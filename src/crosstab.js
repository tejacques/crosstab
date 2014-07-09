var crosstab = (function () {

    function notSupported() {
        throw new Error('crosstab not supported: localStorage not availabe');
    }

    // --- Utility ---
    var GLOBAL_LOCK = 'crosstab.GLOBAL_LOCK';
    var MESSAGE_KEY = 'crosstab.MESSAGE_KEY';
    var TABS_KEY = 'crosstab.TABS_KEY';
    var TAB_CLOSED_KEY = 'crosstab.TAB_CLOSED';
    var MASTER_TAB = 'MASTER_TAB';
    var util = {};

    util.forEachObj = function (thing, fn) {
        for (var key in thing) {
            if (!thing.hasOwnProperty(key)) {
                continue;
            }
            fn.call(thing, thing[key], key);
        }
    };

    util.forEachArr = function (thing, fn) {
        for (var i = 0; i < thing.length; i++) {
            fn.call(thing, thing[i], i);
        }
    };

    util.forEach = function (thing, fn) {
        if (Object.prototype.toString.call(thing) === '[object Array]') {
            util.forEachArr(thing, fn);
        } else {
            util.forEachObj(thing, fn);
        }
    };

    util.map = function (thing, fn) {
        var res = [];
        util.forEach(thing, function (item) {
            res.push(fn(item));
        });

        return res;
    };

    util.filter = function (thing, fn) {
        var isArr = Object.prototype.toString.call(thing) === '[object Array]';
        var res = isArr ? [] : {};
        util.forEach(thing, function (value, key) {
            if (fn(value, key)) {
                if (isArr) {
                    res.push(value);
                } else {
                    res[key] = value;
                }
            }
        });

        return res;
    };

    util.tabs = {};

    util.eventTypes = {
        becomeMaster: 'becomeMaster',
        tabsUpdated: 'tabsUpdated',
        tabClosed: 'tabClosed',
        unlocked: 'unlocked'
    };

    // --- Events ---
    // node.js style events, with the main difference being object based
    // rather than array based, as well as being able to add/remove
    // events by key.
    util.createEventHandler = function () {
        var events = {};

        var addListener = function (event, listener, key) {
            key = key || listener;
            var handlers = listeners(event);
            handlers[key] = listener;

            return key;
        };

        var removeListener = function (event, key) {
            if (events[event] && events[event][key]) {
                delete events[event][key];
                return true;
            }
            return false;
        };

        var removeAllListeners = function (event) {
            if (event) {
                if (events[event]) {
                    delete events[event];
                }
            } else {
                events = {};
            }
        };

        var emit = function (event) {
            var args = Array.prototype.slice.call(arguments, 1);
            var handlers = listeners(event);

            util.forEach(handlers, function (listener) {
                if (typeof (listener) === 'function') {
                    listener.apply(this, args);
                }
            });
        };

        var once = function (event, listener, key) {
            // Generate a unique id for this listener
            var handlers = listeners(event);
            while (!key || handlers[key]) {
                key = util.generateId();
            }

            addListener(event, function () {
                removeListener(event, key);
                var args = Array.prototype.slice.call(arguments);
                listener.apply(this, args);
            }, key);

            return key;
        };

        var listeners = function (event) {
            var handlers = events[event] = events[event] || {};
            return handlers;
        };

        return {
            addListener: addListener,
            on: addListener,
            once: once,
            emit: emit,
            listeners: listeners,
            removeListener: removeListener,
            removeAllListeners: removeAllListeners
        };
    };

    // --- Setup Events ---
    var eventHandler = util.createEventHandler();

    // wrap eventHandler so that setting it will not blow up
    // any of the internal workings
    util.events = {
        addListener: eventHandler.addListener,
        on: eventHandler.addListener,
        once: eventHandler.once,
        emit: eventHandler.emit,
        listeners: eventHandler.listeners,
        removeListener: eventHandler.removeListener,
        removeAllListeners: eventHandler.removeAllListeners
    };

    function onStorageEvent(event) {
        var eventValue = event.newValue ? JSON.parse(event.newValue) : {};
        if (event.key !== GLOBAL_LOCK && !eventValue.id || eventValue.id === crosstab.id) {
            // This is to force IE to behave properly
            return;
        }
        switch (event.key) {
            case GLOBAL_LOCK:
                if (event.newValue === null) {
                    console.log("GLOBAL LOCK CLEARED");
                    console.log(event);
                    eventHandler.emit(util.eventTypes.unlocked);
                }
                break;
            case TABS_KEY:
                var tabs = eventValue.data;
                eventHandler.emit(util.eventTypes.tabsUpdated, tabs);
                break;
            case TAB_CLOSED_KEY:
                var id = eventValue.data;
                eventHandler.emit(util.eventTypes.tabClosed, id);
                break;
            case MESSAGE_KEY:
                var message = eventValue.data;
                // only handle if this message was meant for this tab.
                if (!message.destination || message.destination === crosstab.id) {
                    eventHandler.emit(message.event, message);
                }
                break;
        }
    }

    function setLocalStorageItem(key, data) {
        var storageItem = {
            id: crosstab.id,
            data: data
        };

        localStorage.setItem(key, JSON.stringify(storageItem));
    }

    function getLocalStorageItem(key) {
        var json = localStorage.getItem(key);
        var item = json ? JSON.parse(json) : {};
        return item.data;
    }

    function beforeUnload(event) {
        //var c = confirm("Sure?");
        var numTabs = 0;
        util.forEach(util.tabs, function (tab, key) {
            if (key !== MASTER_TAB) {
                numTabs++;
            }
        });

        if (numTabs === 1) {
            util.lock(function () {
                util.tabs = {};
                setStoredTabs();
            });
        } else {
            // lockless because we want to make sure it always happens
            setLocalStorageItem(TAB_CLOSED_KEY, crosstab.id);
        }
    }

    // Handle other tabs closing by updating internal tab model, and promoting
    // self if we are the lowest tab id
    eventHandler.addListener(util.eventTypes.tabClosed, function (id) {
        console.log("TTTTTTTTTTTTTT tab closed");
        var start = (new Date()).getTime();
        // all functions that modify tabs must be done within a lock
        util.lock(function () {
            var now = (new Date()).getTime();
            console.log("TTTTTTTTTTTTTT tabs closed locked in ", (now - start), " ms");
            if (util.tabs[id]) {
                delete util.tabs[id];
            }

            if (util.tabs[MASTER_TAB].id === id) {
                // If the master was the closed tab, delete it and the highest
                // tab ID becomes the new master, which will save the tabs
                delete util.tabs[MASTER_TAB];

                var maxId = -1;
                util.forEach(util.tabs, function (tab) {
                    if (tab.id > maxId) {
                        maxId = tab.id;
                    }
                });

                if (maxId === crosstab.id) {
                    eventHandler.emit(util.eventTypes.becomeMaster, crosstab.id);
                }
            } else if (util.tabs[MASTER_TAB].id === crosstab.id) {
                // If I am master, save the new tabs out
                setStoredTabs();
            }
        });
    });

    eventHandler.addListener(util.eventTypes.tabsUpdated, function (tabs) {
        var start = (new Date()).getTime();
        console.log("UUUUUUUUUUUUUU tabs updated");
        console.log(tabs);
        // all functions that modify tabs must be done withing a lock
        util.lock(function () {
            var now = (new Date()).getTime();
            console.log("UUUUUUUUUUUUUU tabs updated locked in ", (now-start), " ms");
            util.tabs = tabs;
        });
    });

    eventHandler.addListener(util.eventTypes.becomeMaster, function (id) {
        util.lock(function () {
            util.tabs[MASTER_TAB] = {
                id: id,
                lastUpdated: (new Date()).getTime()
            };
            setStoredTabs();
        });
    });

    util.generateId = function () {
        return (Math.random() * 0x7FFFFFFF) | 0;
    };

    // --- Setup locking ---
    var iHaveTheLock = 0;
    util.lock = function (fn, cb) {
        // unique id for this transaction
        var id = util.generateId();
        // 5 seconds max lock time.
        var EXPIRED = 5 * 1000;
        // 10 ms retry time
        var RETRY = 10;
        // self reference
        var self = this;

        // only run the function once
        var executedFunction = false;

        // listening for local storage changes to re-try locking
        var storageListener = 0;

        // re-trying to lock based on the RETRY time
        var lockTimers = [];

        var start = (new Date()).getTime();

        function lock() {
            // only execute the function once. This if block can happen
            // if multiple events fire off before they are cleared
            if (executedFunction) {
                return;
            }

            var now = (new Date()).getTime();

            if (!iHaveTheLock) {
                var lockActive = now - (getLocalStorageItem(GLOBAL_LOCK) || 0) < EXPIRED;
                console.log("Lock Active? ", lockActive);

                // if another tab has the lock, and it hasn't expired
                // we'll wait until it's available by listening for
                // storage changes and retrying every RETY interval
                if (lockActive) {
                    if (!storageListener) {
                        storageListener = eventHandler.once(
                            util.eventTypes.unlocked,
                            function () {
                                console.log("++++++++ STORAGE LISTENER LOCK AGAIN +++++++");
                                storageListener = null;
                                lock();
                            },
                            id);
                    }

                    lockTimers.push(window.setTimeout(function () {
                        console.log("++++++++ LOCKTIMER LOCK AGAIN +++++++");
                        lock();
                    }, RETRY));
                    return;
                }
            }

            if (!iHaveTheLock) {
                console.log("lock acquired in ", (now-start), " ms");
            }
            iHaveTheLock++;
            executedFunction = true;
            setLocalStorageItem(GLOBAL_LOCK, now);

            // try/finally block to ensure that we unlock
            try {
                if (typeof (fn) === 'function') {
                    fn();
                }
            }
            finally {
                unlock();
                if (typeof (cb) === 'function') {
                    cb();
                }
            }
        }

        function unlock() {
            iHaveTheLock--;

            // clean up the storage listener if there was one
            if (storageListener) {
                eventHandler.removeListener(util.eventTypes.unlocked, id);
            }

            // clean up all of the lock timers if there were any
            if (lockTimers.length) {
                for (var i = 0; i < lockTimers.length; i++) {
                    window.clearTimeout(lockTimers[i]);
                }
            }

            // clean up the local storage lock
            if (!iHaveTheLock) {
                console.log("lock released");
                localStorage.removeItem(GLOBAL_LOCK);
            }
        }

        lock();
    };

    // --- Setup message sending and handling ---
    function broadcast(event, data, destination) {
        message = {
            event: event,
            data: data,
            destination: destination,
            origin: crosstab.id,
            timestamp: (new Date()).getTime()
        };

        // If the destination differs from the origin send it out, otherwise
        // handle it locally
        if (message.destination !== message.origin) {
            util.lock(function () {
                setLocalStorageItem(MESSAGE_KEY, message);
            });
        }

        if (!message.destination || message.destination === message.origin) {
            eventHandler.emit(event, message);
        }
    }

    function broadcastMaster(event, data) {
        broadcast(event, data, util.tabs[MASTER_TAB].id);
    }

    // ---- Return ----
    var crosstab = {
        id: util.generateId(),
        supported: !!localStorage && window.addEventListener,
        util: util,
        broadcast: broadcast,
        broadcastMaster: broadcastMaster
    };

    // --- Tab Setup ---
    // 5 second timeout
    var TAB_KEEPALIVE = 6 * 1000;
    var TAB_TIMEOUT = 15 * 1000;

    function getStoredTabs() {
        var storedTabs = getLocalStorageItem(TABS_KEY);
        util.tabs = storedTabs || util.tabs;
        return util.tabs;
    }

    function setStoredTabs() {
        setLocalStorageItem(TABS_KEY, util.tabs);
    }

    function keepalive() {
        util.lock(function () {
            getStoredTabs();
            var now = (new Date()).getTime();

            var myTab = {
                id: crosstab.id,
                lastUpdated: now
            };

            // Set my tab
            util.tabs[crosstab.id] = myTab;
            // Set master tab if it has expired
            util.tabs[MASTER_TAB] = util.tabs[MASTER_TAB] || { lastUpdated: 0 };
            var masterExpired = now - util.tabs[MASTER_TAB].lastUpdated > TAB_TIMEOUT;
            var iAmMaster = util.tabs[MASTER_TAB].id === myTab.id;
            if (masterExpired || iAmMaster) {
                util.tabs[MASTER_TAB] = myTab;
            }

            util.tabs = util.filter(util.tabs, function (tab) {
                return now - tab.lastUpdated < TAB_TIMEOUT;
            });

            if (masterExpired && !iAmMaster) {
                // become master -- this will update tabs so we don't need
                // to below.
                eventHandler.emit(util.eventTypes.becomeMaster, crosstab.id);
            } else {
                setStoredTabs();
                eventHandler.emit(util.eventTypes.tabsUpdated, util.tabs);
            }
        });

        if (!crosstab.stopKeepalive) {
            window.setTimeout(keepalive, TAB_KEEPALIVE);
        }
    }

    // --- Check if localStorage is supported ---
    if (!crosstab.supported) {
        util.lock = notSupported;
        crosstab.broadcast = notSupported;
    } else {
        // ---- Setup Storage Listener
        window.addEventListener('storage', onStorageEvent, false);
        window.addEventListener('beforeunload', beforeUnload, false);

        keepalive();
    }

    return crosstab;
})();

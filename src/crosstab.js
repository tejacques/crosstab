var crosstab = (function () {

    function notSupported() {
        throw new Error('crosstab not supported: localStorage not availabe');
    }

    // --- Utility ---
    var MESSAGE_KEY = 'crosstab.MESSAGE_KEY';
    var TABS_KEY = 'crosstab.TABS_KEY';
    var MASTER_TAB = 'MASTER_TAB';
    var util = {};

    util.forEachObj = function (thing, fn) {
        for (var key in thing) {
            if (thing.hasOwnProperty(key)) {
                fn.call(thing, thing[key], key);
            }
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

    util.now = function () {
        return (new Date()).getTime();
    };

    util.tabs = getStoredTabs();

    util.eventTypes = {
        becomeMaster: 'becomeMaster',
        tabUpdated: 'tabUpdated',
        tabClosed: 'tabClosed',
        tabPromoted: 'tabPromoted'
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
        if (!eventValue.id || eventValue.id === crosstab.id) {
            // This is to force IE to behave properly
            return;
        }
        if (event.key === MESSAGE_KEY) {
            var message = eventValue.data;
            // only handle if this message was meant for this tab.
            if (!message.destination || message.destination === crosstab.id) {
                eventHandler.emit(message.event, message);
            }
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
        var item = getLocalStorageRaw(key);
        return item.data;
    }

    function getLocalStorageRaw(key) {
        var json = localStorage.getItem(key);
        var item = json ? JSON.parse(json) : {};
        return item;
    }

    function beforeUnload() {
        var numTabs = 0;
        util.forEach(util.tabs, function (tab, key) {
            if (key !== MASTER_TAB) {
                numTabs++;
            }
        });

        if (numTabs === 1) {
            util.tabs = {};
            setStoredTabs();
        } else {
            broadcast(util.eventTypes.tabClosed, crosstab.id);
        }
    }

    // Handle other tabs closing by updating internal tab model, and promoting
    // self if we are the lowest tab id
    eventHandler.addListener(util.eventTypes.tabClosed, function (message) {
        var id = message.data;
        if (util.tabs[id]) {
            delete util.tabs[id];
        }

        if (util.tabs[MASTER_TAB].id === id) {
            // If the master was the closed tab, delete it and the highest
            // tab ID becomes the new master, which will save the tabs
            delete util.tabs[MASTER_TAB];

            var maxId = null;
            util.forEach(util.tabs, function (tab) {
                if (!maxId || tab.id < maxId) {
                    maxId = tab.id;
                }
            });

            // only broadcast the promotion if I am the new master
            if (maxId === crosstab.id) {
                broadcast(util.eventTypes.tabPromoted, crosstab.id);
            }
        } else if (util.tabs[MASTER_TAB].id === crosstab.id) {
            // If I am master, save the new tabs out
            setStoredTabs();
        }
    });

    eventHandler.addListener(util.eventTypes.tabUpdated, function (message) {
        var tab = message.data;
        util.tabs[tab.id] = tab;
        if (util.tabs[MASTER_TAB].id === tab.id) {
            util.tabs[MASTER_TAB] = tab;
        }
        if (util.tabs[MASTER_TAB].id === crosstab.id) {
            // If I am master, save the new tabs out
            setStoredTabs();
        }
    });

    eventHandler.addListener(util.eventTypes.tabPromoted, function (message) {
        var id = message.data;
        var lastUpdated = message.timestamp;
        util.tabs[MASTER_TAB] = {
            id: id,
            lastUpdated: lastUpdated
        };

        if (crosstab.id === id) {
            // set the tabs in localStorage
            setStoredTabs();

            // emit the become master event so we can handle it accordingly
            util.events.emit(util.eventTypes.becomeMaster);
        }
    });

    function pad(num, width, padChar) {
        padChar = padChar || '0';
        var numStr = (num + '');

        if (numStr.length >= width) {
            return numStr;
        }

        return new Array(width - numStr.length + 1).join(padChar) + numStr;
    }

    util.generateId = function () {
        /*jshint bitwise: false*/
        return util.now() + '' + pad((Math.random() * 0x7FFFFFFF) | 0, 10);
    };

    // --- Setup message sending and handling ---
    function broadcast(event, data, destination) {
        var message = {
            event: event,
            data: data,
            destination: destination,
            origin: crosstab.id,
            timestamp: util.now()
        };

        // If the destination differs from the origin send it out, otherwise
        // handle it locally
        if (message.destination !== message.origin) {
            setLocalStorageItem(MESSAGE_KEY, message);
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
    var TAB_KEEPALIVE = 3 * 1000;
    var TAB_TIMEOUT = 5 * 1000;

    function getStoredTabs() {
        var storedTabs = getLocalStorageItem(TABS_KEY);
        util.tabs = storedTabs || util.tabs || {};
        return util.tabs;
    }

    function setStoredTabs() {
        setLocalStorageItem(TABS_KEY, util.tabs);
    }



    function keepalive() {
        var now = util.now();

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

        function stillAlive(tab) {
            return now - tab.lastUpdated < TAB_TIMEOUT;
        }

        function notAlive(tab, key) {
            return key !== MASTER_TAB && !stillAlive(tab);
        }

        var deadTabs = util.filter(util.tabs, notAlive);
        util.tabs = util.filter(util.tabs, stillAlive);

        // broadcast tabUpdated event
        broadcast(util.eventTypes.tabUpdated, myTab);

        // broadcast tabClosed event for each tab that timed out
        util.forEach(deadTabs, function (tab) {
            broadcast(util.eventTypes.tabClosed, tab.id);
        });
    }

    function keepaliveLoop() {
        if (!crosstab.stopKeepalive) {
            keepalive();
            window.setTimeout(keepaliveLoop, TAB_KEEPALIVE);
        }
    }

    // --- Check if localStorage is supported ---
    if (!crosstab.supported) {
        crosstab.broadcast = notSupported;
    } else {
        // ---- Setup Storage Listener
        window.addEventListener('storage', onStorageEvent, false);
        window.addEventListener('beforeunload', beforeUnload, false);

        keepaliveLoop();
    }

    return crosstab;
})();

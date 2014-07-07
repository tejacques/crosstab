var crosstab = (function () {

    function notSupported() {
        throw new Error('crosstab not supported: localStorage not availabe');
    }

    // --- Utility ---
    var GLOBAL_LOCK = 'crosstab.GLOBAL_LOCK';
    var MESSAGE_KEY = 'crosstab.MESSAGE_KEY';
    var util = {};

    util.storageListeners = {};

    util.generateId = function () {
        return (Math.random() * 0x7FFFFFFF) | 0;
    };

    util.addStorageListener = function (fn, key) {
        util.storageListeners[key || fn] = fn;
    };

    util.removeStorageListener = function (key) {
        delete util.storageListeners[key];
    };

    function storageHandler(event) {
        for (var key in util.storageListeners) {
            if (!util.storageListeners.hasOwnProperty(key)) {
                continue;
            }

            fn = util.storageListeners[key];

            if (typeof (fn) === 'function') {
                fn(event);
            }
        }
    }

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
        var storageListener = false;

        // re-trying to lock based on the RETRY time
        var lockTimers = [];

        function storageListenerFn(storageEvent) {
            if (storageEvent.key === GLOBAL_LOCK) {
                lock();
            }
        }

        function lock() {
            // only execute the function once. This if block can happen
            // if multiple events fire off before they are cleared
            if (executedFunction) {
                return;
            }

            var now = (new Date()).getTime();
            var lockActive = now - parseInt(localStorage.getItem(GLOBAL_LOCK) || 0) < EXPIRED;

            // if another tab has the lock, and it hasn't expired
            // we'll wait until it's available by listening for
            // storage changes and retrying every RETY interval
            if (lockActive) {
                if (!storageListener) {
                    util.addStorageListener(storageListenerFn, id);
                    storageListener = true;
                }

                lockTimers.push(window.setTimeout(lock, RETRY));
                return;
            }

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
            // clean up the storage listener if there was one
            if (storageListener) {
                util.removeStorageListener(id);
            }

            // clean up all of the lock timers if there were any
            if (lockTimers.length) {
                for (var i = 0; i < lockTimers.length; i++) {
                    window.clearTimeout(lockTimers[i]);
                }
            }

            // clean up the local storage lock
            localStorage.removeItem(GLOBAL_LOCK);
        }

        lock();
    };

    function broadcast(type, data, tab) {
        message = {
            type: type,
            data: data,
            tab: tab,
            origin: crosstab.id
        };

        util.lock(function () {
            localStorage.setItem(MESSAGE_KEY, message);
        });
    }

    messageHandlers = {};
    function addMessageHandler(type, fn) {
        messageHandlers[type] = messageHandlers[type] || {};
        messageHandlers[type][fn] = fn;
    }

    function removeMessageHandler(type, fn) {
        if (messageHandlers[type][fn]) {
            delete messageHandlers[type][fn];
        }
    }

    util.addStorageListener(function (event) {
        if (event.key === MESSAGE_KEY) {
            var message = JSON.parse(event.newValue);

            if (!message.tab || message.tab === crosstab.id) {
                handlers = messageHandlers[message.type] || {};
                for (var handler in handlers) {
                    if (!handlers.hasOwnProperty(handler)) {
                        continue;
                    }

                    handlers[handler](message);
                }
            }
        }
    });

    // ---- Return ----
    var crosstab = {
        id: util.generateId(),
        supported: !!localStorage,
        util: util,
        broadcast: broadcast,
        addMessageHandler: addMessageHandler,
        removeMessageHandler: removeMessageHandler
    };

    // --- Check if localStorage is supported ---
    if (!crosstab.supported) {
        util.lock = notSupported;
        crosstab.broadcast = notSupported;
        crosstab.addMessageHandler = notSupported;
        crosstab.removeMessageHandler = notSupported;
    } else {
        // ---- Setup Storage Listener
        if (window.addEventListener) {
            window.addEventListener('storage', storageHandler, false);
        }
        else if (window.attachEvent) {
            window.attachEvent('onstorage', storageHandler);
        }

        // --- Tab Setup ---
        util.lock(function () {
            localStorage
        });
    }

    return crosstab;
})();

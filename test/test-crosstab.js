// =========== Iframe Tools ==============

var runInIframe = function (iframe, fn) {
    /*jshint evil:true*/
    var args = [].slice.call(arguments, 2);
    return iframe.contentWindow.window.eval("("
        + fn
        + ").apply(window, " + JSON.stringify(args) + ");");
};

var runIframe = function (onload) {
    // create iframe
    var iframe = document.createElement('iframe');

    var allArgs = [iframe];
    var args = [].slice.call(arguments);
    allArgs.push.apply(allArgs, args);
    //iframe.style.display = 'none';
    iframe.style.border = 'none';
    iframe.id = (Math.random() * 0xFFFFFFFF) | 0;
    iframe.src = "/test/iframe.html";
    document.body.appendChild(iframe);
    iframeLoadCrosstab(iframe);
    iframeOnload.apply(null, allArgs);
    return iframe;
};

var iframeLoadCrosstab = function (iframe) {
    var doOnload = function () {
        runInIframe(iframe, function () {
            var crosstabScript = document.createElement('script');
            crosstabScript.type = 'text/javascript';
            crosstabScript.src = '/src/crosstab.js';
            crosstabScript.onload = function () {
                var loaded = window.loaded || [];
                window.loaded = {
                    push: function (fn) {
                        fn();
                    }
                };
                for (var i = 0; i < loaded.length; i++) {
                    loaded[i]();
                }
            };
            document.head.appendChild(crosstabScript);

            // addText helper function
            window.addText = function (txt) {
                var div = document.createElement('div');
                var text = document.createTextNode(txt);
                div.appendChild(text);
                document.body.appendChild(div);
            };

            window.loaded = [];
            addText('iframe loaded');
            var start = (+new Date());
            window.loaded.push(function () {
                var end;
                end = +new Date();
                addText('crosstab script loaded in ' + (end - start) + 'ms');
                start = end;
                crosstab(function () {
                    end = +new Date();
                    addText('crosstab script setup in ' + (end - start) + 'ms');
                });
            });
        });
    };

    if (iframe.contentWindow.document.readyState === 'complete') {
        doOnload();
    } else {
        iframe.addEventListener('load', doOnload);
    }
};

var iframeOnload = function (iframe, onload) {
    var args = [].slice.call(arguments, 2);
    onload = onload.toString();

    var doOnload = function () {
        // add crosstab script
        runInIframe(iframe, function (onload, args) {
            /*jshint evil:true*/
            onload = Function('return ' + onload + ';')();

            window.loaded.push(function () {
                onload.apply(null, args);
            });
        }, onload, args);
    };

    if (iframe.contentWindow.document.readyState === 'complete') {
        setTimeout(doOnload, 50);
    } else {
        iframe.addEventListener('load', doOnload);
    }
};

var removeIframe = function (iframe) {
    if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
    }
};

// =========== Tests ==============

describe('crosstab', function () {

    it ('should be a function', function () {
        expect(window.crosstab).to.be.a('function');
    });

    it('should setup without issue', function (done) {
        crosstab(function() {
            expect(crosstab.supported).to.be(true);
            done();
        });
    });

    it('should receive broadcast when sent', function () {
        var msg = "TestMessage";
        var received;
        crosstab.once('test', function(message) {
            received = message.data;
        });
        crosstab.broadcast('test', msg);
        expect(received).to.be(msg);
    });

    it('should only trigger callback once for crosstab.once', function () {
        var msg = "TestOnce";
        var received;
        crosstab.once('testOnce', function (message) {
            received = message.data;
        });
        crosstab.broadcast('testOnce', msg);
        expect(received).to.be(msg);
        received = undefined;
        crosstab.broadcast('testOnce', msg);
        expect(received).to.be(undefined);
    });

    describe('with iframe', function () {
        this.timeout(1000);
        var iframe;

        beforeEach(function (done) {
            this.timeout(10000);
            window.done = done;
            iframe = runIframe(function () {
                crosstab(function () {
                    addText('crosstab setup complete');
                });
                window.parent.done();
            });
        });

        afterEach(function () {
            //removeIframe(iframe);
        });

        it('should have crosstab.supported be true', function (done) {
            window.callback = function () {
                expect(crosstab.supported).to.be(true);
                done();
            };

            iframeOnload(iframe, function () {
                crosstab(function () {
                    window.parent.setTimeout(window.parent.callback);
                });
            });
        });

        it('should receive broadcasts from other tabs', function (done) {
            window.callback = function () {
                expect(crosstab.supported).to.be(true);
            };

            var msg = "OtherTabTestMessage";
            var received;
            crosstab.once('otherTabTest', function (message) {
                received = message.data;
                expect(received).to.be(msg);
                done();
            });

            iframeOnload(iframe, function (msg) {
                crosstab(function () {
                    window.parent.setTimeout(window.parent.callback);
                    crosstab.broadcast('otherTabTest', msg);
                });
            }, msg);
        });

        it('should only receive one broadcast in an iframe per broadcast sent', function (done) {
            var timeoutId;
            var received = 0;

            window.callback = function () {
                expect(crosstab.supported).to.be(true);
            };

            var checkReceived = function () {
                expect(received).to.be(1);
                done();
            };

            crosstab.on('iframeBroadcastTest', function (message) {
                received++;
                clearTimeout(timeoutId);
                timeoutId = setTimeout(checkReceived, 50);
            });

            iframeOnload(iframe, function () {
                crosstab(function () {
                    window.parent.setTimeout(window.parent.callback);
                    crosstab.on('iframeBroadcastTestStart', function () {
                        addText('starting broadcast test in iframe');
                        crosstab.broadcast('iframeBroadcastTest');
                    });
                    addText('telling iframe to start test');
                    window.top.crosstab.broadcast('iframeBroadcastTestStart');
                });
            });
        });
    });
});

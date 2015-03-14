describe('crosstab', function () {

    var runInIframe = function (iframe, fn) {
        /*jshint evil:true*/
        var args = [].slice.call(arguments, 2);
        return iframe.contentWindow.window.eval("("
            + fn
            + ").apply(window, " + JSON.stringify(args) + ");");
    };

    var runIframe = function (onload) {
        var args = [].slice.call(arguments, 1);
        // create iframe
        var iframe = document.createElement('iframe');
        //iframe.style.display = 'none';
        iframe.style.border = 'none';
        iframe.id = (Math.random() * 0xFFFFFFFF) | 0;
        iframe.src = "/test/iframe.html";

        onload = onload.toString();

        iframe.addEventListener('load', function () {
            // add crosstab script
            runInIframe(iframe, function (onload, args) {
                /*jshint evil:true*/
                onload = Function('return ' + onload + ';')();
                var crosstabScript = document.createElement('script');
                crosstabScript.type = 'text/javascript';
                crosstabScript.src = '/src/crosstab.js';
                crosstabScript.onload = function () {
                    onload.apply(crosstabScript, args);
                };
                document.head.appendChild(crosstabScript);

                // addText helper function
                window.addText = function (txt) {
                    var div = document.createElement('div');
                    var text = document.createTextNode(txt);
                    div.appendChild(text);
                    document.body.appendChild(div);
                };
            }, onload, args);
        });
        document.body.appendChild(iframe);
        return iframe;
    };

    var removeIframe = function (iframe) {
        if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
        }
    };

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
        this.timeout(3000);
        var iframe;
        afterEach(function () {
            removeIframe(iframe);
        });

        it('should have crosstab.supported be true', function (done) {
            window.callback = function () {
                expect(crosstab.supported).to.be(true);
                done();
            };

            iframe = runIframe(function () {
                addText('iFrame loaded');
                crosstab(function () {
                    addText('crosstab setup complete');
                    window.parent.setTimeout(window.parent.callback);
                });
            });
        });

        it('should receive broadcasts from other tabs', function (done) {
            window.callback = function () {
                expect(crosstab.supported).to.be(true);
                done();
            };

            var msg = "OtherTabTestMessage";
            var received;
            crosstab.once('otherTabTest', function (message) {
                received = message.data;
                expect(received).to.be(msg);
                done();
            });

            iframe = runIframe(function (msg) {
                addText('iFrame loaded');
                crosstab(function () {
                    addText('crosstab setup complete');
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
                done();
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

            iframe = runIframe(function (msg) {
                addText('iFrame loaded');

                crosstab(function () {
                    addText('crosstab setup complete');
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

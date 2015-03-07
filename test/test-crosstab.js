describe('crosstab', function () {
    var runInIframe = function (iframe, fn) {
        /*jshint evil:true*/
        var args = [].slice.call(arguments, 2);
        return iframe.contentWindow.window.eval("("
            + fn
            + ").apply(window, " + JSON.stringify(args) + ");");
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
    it('should receive broadcasts from other tabs', function (done) {
        var msg = "OtherTabTestMessage";
        var received;
        crosstab.once('otherTabTest', function (message) {
            received = message.data;
            expect(received).to.be(msg);
            done();
        });

        // create iframe
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.id = 'iframe';
        iframe.src = "/test/iframe.html";


        
        iframe.addEventListener('load', function () {
            // add crosstab script
            runInIframe(iframe, function (msg) {
                var crosstabScript = document.createElement('script');
                crosstabScript.type = 'text/javascript';
                crosstabScript.src = '/src/crosstab.js';
                crosstabScript.onload = function () {
                    crosstab(function () {
                        crosstab.broadcast('otherTabTest', msg);
                    });
                };
                document.head.appendChild(crosstabScript);
            }, msg);
        });
        document.body.appendChild(iframe);
    });
});

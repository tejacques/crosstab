var browsers = {
    chrome: [
        ['Linux', 'chrome', ''],
    ],
    'chrome-osx': [
        ['OSX 10.10', 'chrome', ''],
    ],
    'chrome-win': [
        ['Windows 7', 'chrome', ''],
    ],
    firefox: [
        ['Linux', 'firefox', ''],
    ],
    'firefox-osx': [
        ['OSX 10.10', 'firefox', ''],
    ],
    'firefox-win': [
        ['Windows 7', 'firefox', ''],
    ],
    'ie8': [
        ['Windows XP', 'internet explorer', '8'],
    ],
    'ie9': [
        ['Windows 7', 'internet explorer', '9'],
    ],
    'ie10': [
        ['Windows 7', 'internet explorer', '10'],
    ],
    'ie11': [
        ['Windows 10', 'internet explorer', '11'],
    ],
    'ie': [
        ['Windows 10', 'internet explorer', '11'],
    ],
    safari: [
        ['OSX 10.11', 'safari', '9'],
    ],
    opera: [
        ['Linux', 'opera', '12.15'],
    ],
    'opera-win': [
        // Testing Opera 12 is currently broken on sauce labs
        //['Windows 7', 'opera', '12.12'],
        ['Windows 7', 'opera', '11.64'],
    ],

    quick: [
        ['Windows 7', 'chrome', ''],
        ['Windows 7', 'firefox', ''],
        ['Windows 7', 'internet explorer', '11'],
        ['OSX 10.11', 'safari', ''],
    ],
    ci: [
        // Chrome
        ['Linux', 'chrome', ''],
        ['OSX 10.10', 'chrome', ''],
        ['Windows XP', 'chrome', ''],
        ['Windows 7', 'chrome', ''],
        ['Windows 8', 'chrome', ''],
        ['Windows 8.1', 'chrome', ''],
        ['Windows 10', 'chrome', ''],
        // Firefox
        ['Linux', 'firefox', ''],
        ['OSX 10.10', 'firefox', ''],
        ['Windows XP', 'firefox', ''],
        ['Windows 7', 'firefox', ''],
        ['Windows 8', 'firefox', ''],
        ['Windows 8.1', 'firefox', ''],
        ['Windows 10', 'firefox', ''],
        // Internet Explorer
        ['Windows XP', 'internet explorer', '8'], // Off for now
        ['Windows 7', 'internet explorer', '8'], // Off for now
        ['Windows 7', 'internet explorer', '9'],
        ['Windows 7', 'internet explorer', '10'],
        ['Windows 7', 'internet explorer', '11'],
        ['Windows 8.1', 'internet explorer', '11'],
        ['Windows 10', 'internet explorer', '11'],
        // Safari
        ['OSX 10.8', 'safari', '6'],
        ['OSX 10.9', 'safari', '7'],
        ['OSX 10.10', 'safari', '8'],
        ['OSX 10.11', 'safari', '9'],
        // Opera
        // Testing Opera 12 is currently broken on sauce labs
        // ['Linux', 'opera', '12.15'],
        ['Windows 7', 'opera', '11.64'],
    ]
};

module.exports = browsers;

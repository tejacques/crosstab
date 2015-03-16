var browsers = {
    chrome: [
        ['Linux', 'chrome', '40'],
    ],
    'chrome-osx': [
        ['OSX 10.10', 'chrome', '40'],
    ],
    'chrome-win': [
        ['Windows 7', 'chrome', '40'],
    ],
    firefox: [
        ['Linux', 'firefox', '35'],
    ],
    'firefox-osx': [
        ['OSX 10.10', 'firefox', '35'],
    ],
    'firefox-win': [
        ['Windows 7', 'firefox', '35'],
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
        ['Windows 8.1', 'internet explorer', '11'],
    ],
    'ie': [
        ['Windows 8.1', 'internet explorer', '11'],
    ],
    safari: [
        ['OSX 10.10', 'safari', '8'],
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
        ['Windows 7', 'chrome', '40'], ['Windows 7', 'firefox', '35'],
        ['Windows 7', 'internet explorer', '11'],
        ['OSX 10.10', 'safari', '8']
    ],
    ci: [
        // Chrome
        ['Linux', 'chrome', '40'],
        ['OSX 10.10', 'chrome', '40'],
        ['Windows XP', 'chrome', '40'],
        ['Windows 7', 'chrome', '40'],
        ['Windows 8', 'chrome', '40'],
        ['Windows 8.1', 'chrome', '40'],
        // Firefox
        ['Linux', 'firefox', '35'],
        ['OSX 10.10', 'firefox', '35'],
        ['Windows XP', 'firefox', '35'],
        ['Windows 7', 'firefox', '35'],
        ['Windows 8', 'firefox', '35'],
        ['Windows 8.1', 'firefox', '35'],
        // Internet Explorer
        // ['Windows XP', 'internet explorer', '8'], // Off for now
        // ['Windows 7', 'internet explorer', '8'], // Off for now
        ['Windows 7', 'internet explorer', '9'],
        ['Windows 7', 'internet explorer', '10'],
        ['Windows 7', 'internet explorer', '11'],
        ['Windows 8.1', 'internet explorer', '11'],
        // Safari
        ['OSX 10.6', 'safari', '5.1'],
        ['OSX 10.8', 'safari', '6'],
        ['OSX 10.9', 'safari', '7'],
        ['OSX 10.10', 'safari', '8'],
        // Opera
        // Testing Opera 12 is currently broken on sauce labs
        // ['Linux', 'opera', '12.15'],
        ['Windows 7', 'opera', '11.64'],
    ]
};

module.exports = browsers;

# crosstab [![NPM version][npm-img]][npm-url] [![Build Status][travis-img]][travis-url]

A utility library for cross-tab communication using localStorage.

[![Sauce Labs Test Status][saucelabs-img]][saucelabs-url]

How can I get it?
-----------------

crosstab is available through npm and bower and can be installed with the following command:

npm:
```
npm install crosstab
```

bower:
```
bower install crosstab
```

What is it?
-----------

crosstab is a javascript utility library for inter-tab communication on the same domain. It offers the following features:

* Tracks open tabs
* Designates a `master` tab and updates the master tab if it closes or times out. This is useful for maintaining a single server connection across all tabs.
* Broadcast messages to all tabs or a particular tab

# Browser Compatibility #


| Browser | Version Tested |
|---------|----------------|
|   IE    |        9+      |
| Chrome  |       35+      |
| FireFox |       30+      |
| Safari  |        6.1+    |

No Mobile browser is supported.

# API #

Most of the time, you will only need to do two things with crosstab, set up event handlers, and fire off events.

## Broadcasts ##

crosstab broadcasts messages like this:

```JavaScript
crosstab.broadcast(event, data, destination);
```

If a destination is not specified, the message is broadcast to all tabs, including itself.

## Event Handlers ##

crosstab registers and unregisters event handlers like this:

```JavaScript
crosstab.on('eventName', function(message) {
    // Handle event
});
```

The messages received by events have the following format:

```JavaScript
var message = {
    id: string,          // The unique ID of this message
    event: string,       // The name of the event
    data: any,           // The data passed
    destination: string, // The destination tab
    origin: string,      // The origin tab
    timestamp: number    // The time the message was created
};
```

The event will not fire if the destination is present and differs from the id of the current tab.
 

Why was it made?
----------------

I wanted to be able to have robust cross tab communication for the purpose of resource sharing (such as websockets). Though there are some libraries which have a similar goal, they all had subtle issues. This library aims to be the most correct it can be for supported browsers. This library was created with inspiration from the [intercom.js](https://github.com/diy/intercom.js/) library, and addresses several of it's shortcomings by dropping support for IE8 and using a lockless system that is entirely event driven. IE8 can still be used with crosstab by using the [tejacques/IE8-EventListener](https://github.com/tejacques/IE8-EventListener) EventListener polyfill

Contributing
------------

Contributions are welcome and encouraged, you can contribute in several different ways, by filing issues, commenting on discussions, or contributing code.

### Filing issues ###

Please use the issue tracker for discussions and bug reports. For bug reports, please include as much detail as possible.

These will help determine/resolve your issue:

* Clear description of the problem or unexpexted behavior
* Clear description of the expected result or output
* Steps to reproduce
* Steps you have taken to debug it yourself
* Minimal reproducible example with self contained and runnable JS code

### Contributing Code ###

#### Project Workflow ####

We use roughly the [Github Workflow](https://guides.github.com/introduction/flow/). You should:

* Create an issue for the feature/bug
* Fork the project
* Create a new branch
* Commit changes
* Submit a pull request to the master branch

#### Tests ####

Tests can be run with the following command:

```.sh
grunt test
```

* Tests must pass
* Tests should be added for each bug/feature that is added
* All tests should be self-contained
* If test is determined to be too difficult to create for an issue, there does not need to be a test for it

#### Getting Started ####

```.sh
git clone https://github.com/tejacques/crosstab
cd crosstab
npm install
grunt
```

You can now access:
* Examples: [http://localhost:9000](http://localhost:9000)
* Tests: [http://localhost:9000/test/mocha_test.html](http://localhost:9000/test/mocha_test.html)

[downloads-img]: https://img.shields.io/npm/dm/crosstab.svg
[npm-url]: https://npmjs.org/package/crosstab
[npm-img]: http://img.shields.io/npm/v/crosstab.svg
[travis-url]: https://travis-ci.org/tejacques/crosstab
[travis-img]: https://travis-ci.org/tejacques/crosstab.svg?branch=master
[saucelabs-url]: https://saucelabs.com/users/crosstab/tests
[saucelabs-img]: https://saucelabs.com/browser-matrix/crosstab.svg

crosstab
========

A utility library from cross-tab communication using localStorage.


What is it?
-----------

crosstab is a javascript utility library for inter-tab communication on the same domain. It offers the following features:

* Tracks open tabs
* Designates a `master` tab and updates the master tab if it closes or times out. This is useful for maintaining a single server connection across all tabs.
* Broadcast messages to all tabs or a particular tab
* Send a message to a particular tab

# Browser Compatibility #


| Browser | Version Tested |
|---------|----------------|
|   IE    |       9+      |
| Chrome  |      35+      |
| FireFox |      30+      |
 

Why was it made?
----------------

This library was created with inspiration from [intercom.js](https://github.com/diy/intercom.js/) and addresses several of it's shortcomings:

* doesn't implement proper locking.
 * does not guarantee that one tab holds the lock at a time (in fact this is impossible to guarantee flat out, but can be guaranteed within defined execution times).
 * locking on functions that throw will break.
 * Updates to any localStorage item will cause the locks to attempt to be acquired instead of only removals of the lock.
* in trying to support IE8 message broadcasting has a race condition where messages can be dropped.
* leaks memory by maintaining a state of every message id received

crosstab
========

A utility library from cross-tab communication using localStorage.


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
 

Why was it made?
----------------

I wanted to be able to have robust cross tab communication for the purpose of resource sharing (such as websockets). Though there are some libraries which have a similar goal, they all had subtle issues. This library aims to be the most correct it can be for supported browsers. This library was created with inspiration from the excellent [intercom.js](https://github.com/diy/intercom.js/) library, and addresses several of it's shortcomings:

* intercom.js doesn't implement proper locking.
 * does not guarantee that one tab holds the lock at a time (in fact this is impossible to guarantee flat out, but can be guaranteed within defined execution times).
 * locking on functions that throw will break.
 * Updates to any localStorage item will cause the locks to attempt to be acquired instead of only removals of the lock.
* in trying to support IE8 message broadcasting in intercom.js has a race condition where messages can be dropped.
* intercom.js leaks memory by maintaining a state of every message id received (also in an attempt to support IE8)

crosstab solves these issues by dropping support for IE8 and using a lockless system that is entirely event driven (IE8 cannot pass messages via localStorage events, which is why intercom.js requires locking, because it supports IE8).

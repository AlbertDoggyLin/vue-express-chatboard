ExpressSessionMongoDB
=====================

Implementation of the store functionality conforming to the API specified in express-session project (https://github.com/expressjs/session).

This implementation uses the MongoDB database.

Requirements
============

- A recent version of MongoDB (version 2.4.9 is installed on my machine) [1]

- A recent version of Node.js (version 0.10.25 is installed on my machine) [1]

- npm if you want the easy way to install this module.

- Read the package.json file for other dependencies. The devDependencies are solely to run the tests and not required for production.

[1] Later versions should also work. If you find it not to be the case, let me know.

Installation
============

npm install express-session-mongodb

Running Tests
=============

In the directory where the module is located, run the following 2 commands on the prompt:

- npm install
- npm test

Running the tests will a bit over a minute due to the TimeToLive test.

Usage
=====

Example of the usage pattern for this module:

```javascript
var Mongodb = require('mongodb');
var Store = require('express-session-mongodb');
var ExpressSession = require('express-session');
var Express = require('express');
var App = Express();
//Probably Some code

var StoreOptions = {'TimeToLive': 0, 'IndexSessionID': false}; //Read more below
MongoDB.MongoClient.connect("mongodb://localhost:27017/SomeDatabase", function(Err, DB) { //Obviously, your code will probably differ here
    Store(DB, function(Err, SessionStore) {
        var Options = {'secret': 'qwerty!', 'store': SessionStore}; //Look at the express-session project to find out all the options you can pass here
        App.use(ExpressSession(Options));
        
        //Probably more code

    }, StoreOptions);
});
```

The express-session-mongodb module returns a function with the following signature:

```javascript
function(<DBHandle>, <Callback>, <Options>);
```

&lt;DBHandle&gt; is the database handle that the store will operate on. It should be obtained using the MongoDB driver.

&lt;Options&gt; are the options you can pass to the session store instance. It is an object with the following properties: 

- IndexSessionID: Can be either true or false (default). If true, session IDs will be indexed with a unique requirement in the MongoDB database, making the creation of sessions slower, but their access faster. 

While theorically, an error should be reported if duplicate session IDs are created, this will never happen in practice because of the way the express-session project is implemented (the fact that the call it makes to create or update a session in the database are the same). Rather, if ever express-session somehow creates two sessions with duplicate IDs, one will overwrite the other. Obviously, a good key generator will make this occurence logically or probabilistically impossible.

Additional note: I tried passing a key generator that always generated the same key to express-session to see how it would react, but it appended some random string to the generated keys so express-session does seem to take extra precautions to avoid collisions.

- TimeToLive: Integer than can be 0 (default) or greater. If greater than 0, a Time-to-Live index will be set which will represent how long (in seconds) a session can be idle in the database (neither written to nor accessed) before MongoDB deletes it.
Note that according to the author of "MongoDB: The Definitive Guide", MongoDB check on Time-To-Live indexes about once per minute, so you should not rely on a session getting deleted the exact second it expires.

- Filter: Can be true or false (default). If set to true, the '.', '$' and '\0' special characters are sanitized in session properties before storage. Necessary to store sessions with properties that contains those characters. You can gain a bit of speed by setting this to false if you are certain your session properties won't contain those characters. 

- DeleteFlags: If set to true (default is false), it causes the 'destroy' (which express-session uses to delete sessions in the MongoDB store) and 'clear' calls to call 'FlagDeletion' instead of directly deleting sessions from the database. Read below for more details.

&lt;Callback&gt; is the function that will be called when the session store instance (and its underlying database collection/index dependencies) have been created. It takes the following signature: 

```javascript
function(<Err>, <StoreInstance>)
```

&lt;Err&gt; is null if no error occured (otherwise it contains the error object).

&lt;StoreInstance&gt; is the resulting store instance you can pass to express-session.

Additional Notes on TimeToLive and express-session
--------------------------------------------------

For those who use the TimeToLive options (which introduces the phenomemon of sessions being deleted in the database without express-session knowing it):

If sessions are deleted between request (when Req.session doesn't exist), express-session will just automatically generate a new session (blank with a new ID) whenever a client submits a request with a cookie for a session that doesn't exist.

Things get just a little more complicated if a session gets deleted while the server is processing a request (when Req.session exists) which could feasibly happen if TimeToLive is very short and a requests takes a while to process:

- Manipulations on the Req.session will behave as normal and the session will be re-saved in the database when the request returns (ok for TimeToLive, probably bad if you want to implement reliably deleting sessions from an admin panel)

- Calls to Req.session.regenerate or Req.session.destroy will not report an error and will behave as expected: a new generation will be created during the request in the former and the Req.session object will be taken down in the later (nothing will be done in the database, because the session will already have been deleted there)

- Calls to Req.session.reload won't do anything (there is no session in the database to reload from), but will report an error.

- Calls to Req.session.save will behave as expected and will save the session back to the database (in this case, re-create it).

FlagDeletion and Cleanup methods
--------------------------------

In addition to the recommanded store API, the 'FlagDeletion' and 'Cleanup' methods were implemented.

Their purpose is to more realiably delete sessions when it matters (perhaps for security reasons).

Because express-session holds sessions in memory during requests and save them back to the database before responding, physically deleting a session in the database while a request (or multiple requests) is(are) in progress will cause the said request(s) to be restore the session in the database. The 'TestDeleteParallelFails' test in the integration tests do an empirical demonstration of the above phenomenon with the default direct database deletion.

A way to reliably purge a session's content is to flag the session as deleted, cause the 'get' accessor to report the request as 'not found' when it is flaged as deleted and then wait for all requests holding the session in memory to complete before physically deleting the session from the database.

- 'FlagDeletion' has the following signature: function(&lt;SessionID&gt;, &lt;Callback&gt;)

If &lt;SessionID&gt; is not null, it will flag the corresponding session as deleted, else it will flag all sessions as deleted.

&lt;Callback&gt; is called when the flagging is completed, its first argument being an error (if any is encountered, else null) and its second argument being the number of sessions that were flagged.

- 'Cleanup' has the following signature: function(&lt;Callback&gt;)

Here, &lt;Callback&gt; is called after the cleanup is done and contains as its first argument an error (if any, else null) and as its second argument the number of sessions that were deleted from the database.

'Cleanup' deletes all sessions that are flagged as deleted from the database. It should not immediately be called after a session is flagged for deletion as sufficient time should be given for any request containing the session to complete.

A self-managing alternative to 'Cleanup' is to set the 'TimeToLive' option with a sufficiently big value for sessions to automatically be deleted a certain amount of time after they were last accessed.

Future
======

Immediate plans for this module include more integration tests (internal tests are finished) to cover the following cases:

- Running the tests for all possible option permutations you can pass to express-session during the initialization.
- Running tests when the database is down.

Longer term plans include implementing further useful options you can pass to the constructor as well as an evented API. 

Versions History
================

1.0.0 
-----

Initial Release. 

1.0.1 
-----

Documentation display fix.

1.1.0
-----

- Add filter functionality to permit keys in sessions to contain '$', '.' or '\0'. 
- More tests
- Documentation formatting fix

1.1.1
-----

- Expended on documentation and fixed some documentation errors.
- Added TimeToLive tests.

1.2.0
-----

- A small bit of refactoring in code and integration tests
- Fixed a bug where the Filter option wouldn't be applied if the TimeToLive option is greater than 0
- Added a facility for the get accessor to delete a session when fetching it if it is flaged to be deleted.
- Added integration test for the above.

1.3.0
-----

- Changed the delete flag function not to delete on get, but merely report the session as not found
- Added a method to mark a session as for deletion
- Added a method to clean up sessions that are marked for deletion
- Added tests and documentation for the above

1.3.1
-----

Minor documentation improvement.

1.3.2
-----

- Updated express-session dependency to version 1.10.1
- Update mongodb dependency to version 1.4.28
- Implemented integration tests for the Filter option
- Fixed a bug where the Filter option would cause sessions to be improperly stored

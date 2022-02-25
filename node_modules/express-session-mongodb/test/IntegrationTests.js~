//Copyright (c) 2014 Eric Vallee <eric_vallee2003@yahoo.ca>
//MIT License: https://raw.githubusercontent.com/Magnitus-/ExpressSessionMongoDB/master/License.txt

var MongoDB = require('mongodb');
var Express = require('express');
var Session = require('express-session');
var Store = require('../lib/ExpressSessionMongoDB');
var Http = require('http');
var Nimble = require('nimble');

var RandomIdentifier = 'ExpressSessionMongoDBTestDB'+Math.random().toString(36).slice(-8);
var Context = {};

function Setup(Options, Callback, StoreOptions)
{
    MongoDB.MongoClient.connect("mongodb://localhost:27017/"+RandomIdentifier, {native_parser:true}, function(Err, DB) {
        Context['DB'] = DB;
        Context['Delete'] = 0;
        Context['LastError'] = null;
        Store(DB, function(Err, SessionStore) {
            Context['Store'] = SessionStore;
            Options['store'] = SessionStore;
            Context['App'] = Express();
            Context['App'].use(Session(Options));
            //In a real world production case, you'd want to do some sanitization and error checking on URL input
            //As it is, I trust myself to have no malicious intent with regard to my test server
            function ProcessDeletions(Callback)
            {
                if(Context['Delete']==1)
                {
                    Context['Delete'] = 0;
                    Context['DB'].collection('Sessions', function(Err, SessionsCollection) {
                        SessionsCollection.remove({}, function(Err, Result) {
                            Callback();
                        });
                    });
                }
                else
                {
                    Callback();
                }
            }
            Context['App'].get('/Wait/:Var', function(Req, Res) {
                if(Req.params.Var==0)
                {
                    setImmediate(function() {
                        Res.end();
                    });
                }
                else
                {
                    setTimeout(function() {
                       Res.end();
                    }, Req.params.Var);
                }
            });
            Context['App'].put('/FlagDelete', function(Req, Res) {
                Context['Delete'] = 1;
                Res.end();
            });
            Context['App'].post('/:Var/Increment', function(Req, Res) {
                ProcessDeletions(function() {
                    if(Req.session[Req.params.Var])
                    {
                        Req.session[Req.params.Var]+=1;
                    }
                    else
                    {
                        Req.session[Req.params.Var]=1;
                    }
                    Res.end();
                });
            });
            Context['App'].post('/:List/Append/:Var', function(Req, Res) {
                ProcessDeletions(function() {
                    if(!Req.session[Req.params.List])
                    {
                        Req.session[Req.params.List]=[];
                    }
                    Req.session[Req.params.List].push(Req.session[Req.params.Var]);
                    Res.end();
                });
            });
            Context['App'].get('/:Var', function(Req, Res) {
                ProcessDeletions(function() {
                    Res.json({'Value': Req.session[Req.params.Var]});
                });
            });
            Context['App'].put('/Session/Regeneration', function(Req, Res) {
                ProcessDeletions(function() {
                    Req.session.regenerate(function(Err) {
                        Context['LastError'] = Err;
                        Res.end();
                    });
                });
            });
            Context['App'].put('/Session/Destruction', function(Req, Res) {
                ProcessDeletions(function() {
                    Req.session.destroy(function(Err) {
                        Context['LastError'] = Err;
                        Res.end();
                    });
                });
            });
            Context['App'].put('/Session/Reload/:Var', function(Req, Res) {
                //<Var> shouldn't be changed. 
                //It was put here to enable testing of the desired functionality.
                ProcessDeletions(function() {
                    if(Req.session[Req.params.Var])
                    {
                        Req.session[Req.params.Var]+=1;
                    }
                    else
                    {
                        Req.session[Req.params.Var]=1;
                    }
                    Req.session.reload(function(Err) {
                        Context['LastError'] = Err;
                        Res.end();
                    });
                });
            });
            Context['App'].put('/Session/Save/:Var', function(Req, Res) {
                //<Var> should be changed incremented. 
                //It was put here to enable testing of the desired functionality.
                ProcessDeletions(function() {
                    if(Req.session[Req.params.Var])
                    {
                        Req.session[Req.params.Var]+=1;
                    }
                    else
                    {
                        Req.session[Req.params.Var]=1;
                    }
                    Req.session.save(function(Err) {
                        Context['LastError'] = Err;
                        Req.session.reload(function(Err) {
                            Res.end();
                        });
                    });
                });
            });
            Context['App'].use(function(Err, Req, Res, Next) {
                Context['LastError'] = Err;
                console.error('Error on test server: '+Err);
            });
            Context['Server'] = Http.createServer(Context['App']);
            Context['Server'].listen(8080, function() {
                Callback();
            });
        }, StoreOptions);
    });
}

function TearDown(Callback)
{
    Context['Delete'] = 0;
    Context['LastError'] = null;
    Context['Server'].close(function() {
        Context.DB.dropDatabase(function(Err, Result) {
            Context.DB.close();
            Callback();
        });
    });
}

function RequestHandler()
{
    this.SessionID = null;
    if(!RequestHandler.prototype.SetSessionID)
    {
        RequestHandler.prototype.SetSessionID = function(Headers) {
            if(Headers["set-cookie"])
            {
                var SessionCookie = Headers["set-cookie"][0];
                SessionCookie = SessionCookie.slice(String("connect.sid=").length, SessionCookie.indexOf(';'));
                this.SessionID = SessionCookie;
            }
        };
        
        RequestHandler.prototype.Request = function(Method, Path, GetBody, Callback) {
            var Self = this;
            var RequestObject = {'hostname': 'localhost', 'port': 8080, 'method': Method, 'path': Path, 'headers': {'Accept': 'application/json'}};
            if(this.SessionID)
            {
                RequestObject['headers']['cookie'] = 'connect.sid='+this.SessionID;
            }
            var Req = Http.request(RequestObject, function(Res) {
                Res.setEncoding('utf8');
                var Body = "";
                if(!GetBody)
                {
                    Res.resume();
                }
                else
                {
                    Res.on('data', function (Chunk) {
                        Body+=Chunk;
                    });
                }
                Res.on('end', function() {
                    Self.SetSessionID(Res.headers);
                    Body = GetBody ? JSON.parse(Body) : null;
                    Callback(Body);
                });
            });
            Req.end();
        };
    }
}

exports.BasicSetup = {
    'setUp': function(Callback) {
        Setup({'secret': 'qwerty!'}, Callback);
    },
    'tearDown': function(Callback) {
        TearDown(Callback);
    },
    'TestObjectAPI': function(Test) {
        Test.expect(2);
        var Handler = new RequestHandler();
        Handler.Request('POST', '/Test/Increment', false, function() {
            Handler.Request('GET', '/Test', true, function(Body) {
                Test.ok(Body['Value']==1,'Confirming basic session manipulation works');
                Handler.Request('POST', '/TestArray/Append/Test', false, function() {
                    Handler.Request('POST', '/Test/Increment', false, function() {
                        Handler.Request('POST', '/TestArray/Append/Test', false, function() {
                            Handler.Request('GET', '/TestArray', true, function(Body) {
                                Test.ok(Body['Value'].length && Body['Value'].length ==2 && Body['Value'][0]==1 && Body['Value'][1]==2,'Confirming that session data is preserved and returned over several requests.');
                                Test.done();
                            });
                        });
                    });
                });
            });
        });
    },
    'TestRegenerateMethod': function(Test) {
        Test.expect(2);
        var Handler = new RequestHandler();
        Handler.Request('POST', '/Test/Increment', false, function() {
            Handler.Request('POST', '/Test/Increment', false, function() {
                var PreviousSessionID = Handler.SessionID;
                Handler.Request('PUT', '/Session/Regeneration', false, function() {
                    Test.ok(Handler.SessionID != PreviousSessionID, "Confirming that a new session ID has been generated.");
                    Handler.Request('POST', '/Test/Increment', false, function() {
                        Handler.Request('GET', '/Test', true, function(Body) {
                            Test.ok(Body['Value']==1,'Confirming the session was reset.');
                            Test.done();
                        });
                    });
                });
            });
        });
    },
    'TestDestroyMethod': function(Test) {
        Test.expect(3);
        var Handler = new RequestHandler();
        Handler.Request('POST', '/Test/Increment', false, function() {
            Handler.Request('POST', '/Test/Increment', false, function() {
                var PreviousSessionID = Handler.SessionID;
                Handler.Request('PUT', '/Session/Destruction', false, function() {
                    Test.ok(Handler.SessionID == PreviousSessionID, "Confirming that a new session ID has not been generated.");
                    Handler.Request('POST', '/Test/Increment', false, function() {
                        Test.ok(Handler.SessionID != PreviousSessionID, "Confirming that a new session ID has been generated.");
                        Handler.Request('GET', '/Test', true, function(Body) {
                            Test.ok(Body['Value']==1,'Confirming the session was reset.');
                            Test.done();
                        });
                    });
                });
            });
        });
    },
    'TestReloadMethod': function(Test) {
        Test.expect(1);
        var Handler = new RequestHandler();
        Handler.Request('POST', '/Test/Increment', false, function() {
            Handler.Request('PUT', '/Session/Reload/Test', false, function() {
                Handler.Request('GET', '/Test', true, function(Body) {
                    Test.ok(Body['Value']==1,'Confirming that session was proprerly reloaded.');
                    Test.done();
                });
            });
        });
    },
    'TestSaveMethod': function(Test) {
        Test.expect(1);
        var Handler = new RequestHandler();
        Handler.Request('POST', '/Test/Increment', false, function() {
            Handler.Request('PUT', '/Session/Save/Test', false, function() {
                Handler.Request('GET', '/Test', true, function(Body) {
                    Test.ok(Body['Value']==2,'Confirming that session was proprerly saved.');
                    Test.done();
                });
            });
        });
    }
};
 
exports.TimeToLive = {
    'setUp': function(Callback) {
        Setup({'secret': 'qwerty!'}, Callback, {'TimeToLive': 2});
    },
    'tearDown': function(Callback) {
        TearDown(Callback);
    },
    'TestBefore': function(Test) {
        Test.expect(2);
        var Handler = new RequestHandler();
        Handler.Request('POST', '/Test/Increment', false, function() {
            var InitialSessionID = Handler.SessionID;
            setTimeout(function() {
                Handler.Request('GET', '/Test', true, function(Body) {
                    Test.ok(Handler.SessionID!=InitialSessionID, "Confirming that previous session was deleted and that express-session generated a new one.");
                    Test.ok(!Body['Value'], "Confirming that new session is empty.");
                    Test.done();
                });
            }, 72000);
        });
    },
   'TestObjectAPIDuring': function(Test) {
        Test.expect(4);
        var Handler = new RequestHandler();
        Handler.Request('PUT', '/FlagDelete', false, function() {
            var InitialSessionID = Handler.SessionID;
            Handler.Request('POST', '/Test/Increment', false, function() {
                Test.ok(Handler.SessionID==InitialSessionID, "Confirming that express-session saved the in-memory data, re-creating the session in the database.");
                Test.ok(!Context['LastError'], "Confirming that usual get is error-free in the absense of the session in storage.");
                Handler.Request('POST', '/Test/Increment', false, function() {
                    Handler.Request('GET', '/Test', true, function(Body) {
                        Test.ok(Body['Value']==2, "Confirming that session data was preserved.");
                        Test.ok(Handler.SessionID==InitialSessionID, "Re-Confirming that express-session saved the in-memory data, re-creating the session in the database.");
                        Test.done();
                    });
                });
            });
        });
    },
    'TestRegenerateDuring': function(Test) {
        Test.expect(2);
        var Handler = new RequestHandler();
        Handler.Request('POST', '/Test/Increment', false, function() {
            Handler.Request('PUT', '/FlagDelete', false, function() {
                var InitialSessionID = Handler.SessionID;
                Handler.Request('PUT', '/Session/Regeneration', false, function() {
                    Test.ok(!Context['LastError'], "Confirming that session regeneration is error-free in the absense of the session in storage.");
                    Test.ok(Handler.SessionID!=InitialSessionID, "Confirming that the session was regenerated.");
                    Test.done();
                });
            });
        });
    },
    'TestDestroyMethodDuring': function(Test) {
        Test.expect(3);
        var Handler = new RequestHandler();
        Handler.Request('POST', '/Test/Increment', false, function() {
            var InitialSessionID = Handler.SessionID;
            Handler.Request('PUT', '/FlagDelete', false, function() {
                Handler.Request('PUT', '/Session/Destruction', false, function() {
                    Test.ok(!Context['LastError'], "Confirming that session destruction is error-free in the absense of the session in storage.");
                    Test.ok(Handler.SessionID == InitialSessionID, "Confirming that a new session ID has not been generated.");
                    Handler.Request('POST', '/Test/Increment', false, function() {
                        Test.ok(Handler.SessionID != InitialSessionID, "Confirming that a new session ID has been generated.");
                        Test.done();
                    });
                });
            });
        });
    },
    'TestReloadMethodDuring': function(Test) {
        Test.expect(4);
        var Handler = new RequestHandler();
        Handler.Request('POST', '/Test/Increment', false, function() {
            var InitialSessionID = Handler.SessionID;
            Handler.Request('PUT', '/FlagDelete', false, function() {
                Handler.Request('PUT', '/Session/Reload/Test', false, function() {
                    Test.ok(Context['LastError'], "Confirming that reload returned an error");
                    Test.ok(Handler.SessionID == InitialSessionID, "Confirming that a new session ID has not been generated.");
                    Handler.Request('GET', '/Test', true, function(Body) {
                        Test.ok(Handler.SessionID == InitialSessionID, "Re-confirming that a new session ID has not been generated.");
                        Test.ok(Body['Value']==2, "Confirming that the session data from memory was preserved.");
                        Test.done();
                    });
                });
            });
        });
    },
    'TestSaveDuring': function(Test) {
        Test.expect(4);
        var Handler = new RequestHandler();
        Handler.Request('POST', '/Test/Increment', false, function() {
            var InitialSessionID = Handler.SessionID;
            Handler.Request('PUT', '/FlagDelete', false, function() {
                Handler.Request('PUT', '/Session/Save/Test', false, function() {
                    Test.ok(!Context['LastError'], "Confirming that save didn't encounter an error.");
                    Test.ok(Handler.SessionID == InitialSessionID, "Confirming that a new session ID has not been generated.");
                    Handler.Request('GET', '/Test', true, function(Body) {
                        Test.ok(Handler.SessionID == InitialSessionID, "Re-confirming that a new session ID has not been generated.");
                        Test.ok(Body['Value']==2, "Confirming that the session data was preserved.");
                        Test.done();
                    });
                });
            });
        });
    }
};

exports.Delete = {
    'TestDeleteGet': function(Test) {
        Test.expect(4);
        Setup({'secret': 'qwerty!'}, function() {
            var Handler = new RequestHandler();
            Context['DB'].collection('Sessions', function(Err, SessionsCollection) {
                Handler.Request('POST', '/Test/Increment', false, function() {
                    var InitialSessionID = Handler.SessionID;
                    SessionsCollection.update({}, {'$set': {'Delete': true}}, function(Err, Result) {
                        Handler.Request('GET', '/Test', true, function(Body) {
                            Test.ok(!Context['LastError'], "Confirming that the process was error-free.");
                            Test.ok(Handler.SessionID != InitialSessionID, "Confirming that a new session ID has been generated.");
                            Test.ok(!Body['Value'], "Confirming that the session data didn't survive transition.");
                            SessionsCollection.count({}, function(Err, Amount) {
                                Test.ok(Amount==2, "Confirming that previous session is still in the database, but flagged as deleted.");
                                TearDown(function() {
                                    Test.done();
                                });
                            });
                        });
                    });
                });
            });
        });
    },
    'TestDeleteParallelFails': function(Test) { //This is to confirm the need that FlagDeletion/Cleanup addresses
        Test.expect(2);
        Setup({'secret': 'qwerty!'}, function() {
            var Handler1 = new RequestHandler();
            var Handler2 = new RequestHandler();
            Handler1.Request('POST', '/Test/Increment', false, function() {
                var InitialSessionID = Handler1.SessionID;
                Handler2.SessionID = Handler1.SessionID;
                Nimble.parallel([
                    function(Callback) {
                        Handler1.Request('GET', '/Wait/100', false, function() {
                            Callback();
                        });
                    },
                    function(Callback) {
                        Handler2.Request('PUT', '/Session/Destruction', false, function() {
                            Callback();
                        });
                    }],
                    function(Err) {
                        Handler1.Request('GET', '/Test', true, function(Body) {
                            Test.ok(Handler1.SessionID==InitialSessionID, "Confirming the initial session survived desipte deletion.");
                            Test.ok(Body['Value']==1, "Confirming the initial session data survived.");
                            TearDown(function() {
                                Test.done();
                            });
                        });
                    });
            });
        });
    },
    'TestDeleteParallelWorks': function(Test) { //The fix, and my apologies for copy-pasting 95%+ of the code from the previous test. Got lazy.
        Test.expect(2);
        Setup({'secret': 'qwerty!'}, function() {
            var Handler1 = new RequestHandler();
            var Handler2 = new RequestHandler();
            Handler1.Request('POST', '/Test/Increment', false, function() {
                var InitialSessionID = Handler1.SessionID;
                Handler2.SessionID = Handler1.SessionID;
                Nimble.parallel([
                    function(Callback) {
                        Handler1.Request('GET', '/Wait/100', false, function() {
                            Callback();
                        });
                    },
                    function(Callback) {
                        Handler2.Request('PUT', '/Session/Destruction', false, function() {
                            Callback();
                        });
                    }],
                    function(Err) {
                        Handler1.Request('GET', '/Test', true, function(Body) {
                            Test.ok(Handler1.SessionID!=InitialSessionID, "Confirming the initial session did not survive deletion.");
                            Test.ok(!Body['Value'], "Confirming the initial session data did not survive.");
                            TearDown(function() {
                                Test.done();
                            });
                        });
                    });
            });
        }, {'DeleteFlag': true});
    }
};

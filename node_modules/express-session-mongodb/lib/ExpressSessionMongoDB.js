//Copyright (c) 2014 Eric Vallee <eric_vallee2003@yahoo.ca>
//MIT License: https://raw.githubusercontent.com/Magnitus-/ExpressSessionMongoDB/master/License.txt

var Mongodb = require('mongodb'),
    Util = require('util'),
    ExpressSession = require('express-session');
    
function HandleError(Err, ErrCallback, OkCallback) 
{
    if(Err)
    {
        if(ErrCallback)
        {
            ErrCallback(Err);
        }
    }
    else
    {
        OkCallback();
    }
};

function EnsureTimeToLive(SessionCollection, Callback)
{
    var Self = this;
    if(Self.TimeToLive > 0)
    {
        SessionCollection.ensureIndex({'LastAccessed' : 1}, {'w': 1, 'expireAfterSeconds' : Self.TimeToLive}, function(Err, Index) {
            HandleError(Err, Callback, function() { 
                if(Callback)
                {
                    Callback();
                }
            });
        });
    }
    else
    {
        if(Callback)
        {
            Callback();
        }
    }
}

function EnsureIndexSessionID(SessionCollection, Callback)
{
    var Self = this;
    if(Self.IndexSessionID)
    {
        SessionCollection.ensureIndex({'SessionID' : 1}, {'w': 1, 'unique' : true}, function(Err, Index) {
            HandleError(Err, Callback, function() { 
                if(Callback)
                {
                    Callback();
                }
            });
        });
    }
    else
    {
        if(Callback)
        {
            Callback();
        }
    }
}

function EnsureDependencies(Callback)
{
    var Self = this;
    if(!Self.DependenciesOk)
    {
        Self.DB.createCollection(Self.CollectionName, {'w': 1}, function(Err, SessionCollection) {
            HandleError(Err, Callback, function() { 
                EnsureTimeToLive.call(Self, SessionCollection, function(Err) {
                    HandleError(Err, Callback, function() { 
                        EnsureIndexSessionID.call(Self, SessionCollection, function(Err) {
                            HandleError(Err, Callback, function() {
                                Self.DependenciesOk=true;
                                if(Callback)
                                {
                                    Callback();
                                }
                            });
                        });
                    });
                });
            });
        });
    }
    else
    {
        Callback();
    }
}

function Store(DB, Callback, Options) {
    if(this instanceof Store)
    {
        ExpressSession.Store.call(this, Options);
        this.CollectionName = Options && Options.CollectionName ? Options.CollectionName : 'Sessions';
        this.TimeToLive = Options && Options.TimeToLive ? Options.TimeToLive : 0;
        this.IndexSessionID = Options && Options.IndexSessionID ? Options.IndexSessionID : false;
        this.Filter = Options && Options.Filter;
        this.DeleteFlag = Options && Options.DeleteFlag ? Options.DeleteFlag : false;
        this.ConvertToUtf8 = Options && Options.ConvertToUtf8;
        this.DB = DB;
        EnsureDependencies.call(this, (function(Err) {
            if(Callback)
            {
                Callback(Err, this);
            }
        }).bind(this));
    }
    else
    {
        return new Store(DB, Callback, Options);
    }
};

Util.inherits(Store, ExpressSession.Store);

function IsContainer(Arg)
{
    return(Arg instanceof Object);
}

var FilterArray = [['-', '*-'], ['.','dot-'],['$','dol-'],['\0','nul-']];
var ReverseFilterArray = [];
FilterArray.forEach(function(Item, Index, List) {
    ReverseFilterArray.unshift([Item[1], Item[0]]);
});

function Filter(Container, Reverse)
{
    var ToReturn = Array.isArray(Container) ? [] : {};
    for(var ContainerKey in Container)
    {
        var FilteredKey = ContainerKey;        
        var CorrectFilter = Reverse ? ReverseFilterArray : FilterArray;
        CorrectFilter.forEach(function(Item, Index, List) {
            FilteredKey = FilteredKey.replace(Item[0], Item[1]);
        });
        if(IsContainer(Container[ContainerKey]))
        {
            ToReturn[FilteredKey] = Filter(Container[ContainerKey], Reverse);
        }
        else
        {
            ToReturn[FilteredKey] = Container[ContainerKey];
        }
    }
    
    return(ToReturn);
}

Store.prototype.set = function(SessionID, Session, Callback) {
    var Self = this;
    EnsureDependencies.call(Self, function(Err) {
        HandleError(Err, Callback, function() {
            Self.DB.collection(Self.CollectionName, function(Err, SessionCollection) {
                HandleError(Err, Callback, function() {
                    var SessionToStore = Self.Filter ? Filter(Session, false) : Session;
                    var Update = {'$setOnInsert': {'SessionID': SessionID}, '$set': {'Data': SessionToStore}};
                    if(Self.TimeToLive>0)
                    {
                        Update['$set']['LastAccessed'] = new Date();
                    }
                    SessionCollection.update({'SessionID': SessionID}, Update, {'upsert': true}, function(Err, Result) {
                        HandleError(Err, Callback, function() {
                            if(Callback)
                            {
                                Callback(null, Session);
                            } 
                        });
                    });
                });
            });
        });
    });
};

function GetSessionInfo(Session, SessionCollection, SessionID, Callback)
{
    var Self = this;
    if(Session && Session.Delete)
    {
        Callback(null, null);
    }
    else
    {
        var Data = Session ? Session.Data : null;
        Data = Data && Self.Filter ? Filter(Data, true) : Data;
        if(Callback)
        {
            Callback(null, Data);
        }
    }
}

Store.prototype.get = function(SessionID, Callback) {
    var Self = this;
    EnsureDependencies.call(Self, function(Err) {
        HandleError(Err, Callback, function() {
            Self.DB.collection(Self.CollectionName, function(Err, SessionCollection) {
                HandleError(Err, Callback, function() {
                    if(Self.TimeToLive==0)
                    {
                        SessionCollection.findOne({'SessionID': SessionID }, function(Err, Session) {
                            HandleError(Err, Callback, function() {
                                GetSessionInfo.call(Self, Session, SessionCollection, SessionID, Callback);
                            });
                        });
                    }
                    else
                    {
                        var Now = new Date();
                        SessionCollection.findAndModify({'SessionID': SessionID }, [['LastAccessed', 1]], {'$set': {'LastAccessed': Now}}, {'w': 0, 'new': true}, function(Err, Session) {
                            HandleError(Err, Callback, function() {
                                GetSessionInfo.call(Self, Session, SessionCollection, SessionID, Callback);
                            });
                        })
                    }
                });
            });
        });
    });
};

Store.prototype.FlagDeletion = function(SessionID, Callback) {
    var Self = this;
    EnsureDependencies.call(Self, function(Err) {
        HandleError(Err, Callback, function() {
            Self.DB.collection(Self.CollectionName, function(Err, SessionCollection) {
                HandleError(Err, Callback, function() {
                    var UpdateSelector = SessionID ? {'SessionID': SessionID} : {};
                    var UpdateOptions = SessionID ? {'multi': false} : {'multi': true};
                    SessionCollection.update(UpdateSelector, {'$set': {'Delete': true}}, UpdateOptions, function(Err, Result) {
                        Callback(Err, Result);
                    });
                });
            });
        });
    });
}

Store.prototype.Cleanup = function(Callback) {
    var Self = this;
    EnsureDependencies.call(Self, function(Err) {
        HandleError(Err, Callback, function() {
            Self.DB.collection(Self.CollectionName, function(Err, SessionCollection) {
                HandleError(Err, Callback, function() {
                    SessionCollection.remove({'Delete': true}, function(Err, Result) {
                        Callback(Err, Result);
                    });
                });
            });
        });
    });
}

Store.prototype.destroy = function(SessionID, Callback) {
    if(!this.DeleteFlag)
    {
        var Self = this;
        EnsureDependencies.call(Self, function(Err) {
            HandleError(Err, Callback, function() {
                Self.DB.collection(Self.CollectionName, function(Err, SessionCollection) {
                    HandleError(Err, Callback, function() {
                        SessionCollection.remove({'SessionID': SessionID}, function(Err, Result) {
                            HandleError(Err, Callback, function() {
                                if(Callback)
                                {
                                    Callback();
                                }
                            });
                        });
                    });
                });
            });
        });
    }
    else
    {
        Store.prototype.FlagDeletion.call(this, SessionID, Callback);
    }
};

Store.prototype.length = function(Callback) {
    var Self = this;
    EnsureDependencies.call(Self, function(Err) {
        HandleError(Err, Callback, function() {
            Self.DB.collection(Self.CollectionName, function(Err, SessionCollection) {
                HandleError(Err, Callback, function() {
                    SessionCollection.count({'Delete': {'$ne': true}}, function(Err, Count) {
                        HandleError(Err, Callback, function() {
                            if(Callback)
                            {
                                Callback(null, Count);
                            }
                        });
                    });
                });
            });
        });
    });
};

Store.prototype.clear = function(Callback) {
    if(!this.DeleteFlag)
    {
        var Self = this;
        EnsureDependencies.call(Self, function(Err) {
            HandleError(Err, Callback, function() {
                Self.DB.collection(Self.CollectionName, function(Err, SessionCollection) {
                    //Dropping and re-creating a collection is faster than removing all elements from it
                    Self.DependenciesOk = false;
                    SessionCollection.drop(function(Err, Reply) {
                        HandleError(Err, Callback, function() {
                            EnsureDependencies.call(Self, function(Err) {
                                HandleError(Err, Callback, function() {
                                    if(Callback)
                                    {
                                        Callback();
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    else
    {
        Store.prototype.FlagDeletion.call(this, null, Callback);
    }
};

Store.prototype.UnitTestCalls = {};
Store.prototype.UnitTestCalls['EnsureTimeToLive'] = EnsureTimeToLive;
Store.prototype.UnitTestCalls['EnsureIndexSessionID'] = EnsureIndexSessionID;
Store.prototype.UnitTestCalls['EnsureDependencies'] = EnsureDependencies;


module.exports = Store;


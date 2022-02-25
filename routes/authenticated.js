const express = require('express');
const router = express.Router();
const session = require('express-session');
const MongoDBStore = require('express-mongodb-session')(session);
const { MongoClient, ObjectId } = require('mongodb');
const UserDBurl = "mongodb://localhost:27017/UserDB";
const InfoDBurl = "mongodb://localhost:27017/InfoDB";

MongoClient.connect(UserDBurl, function(err, db) {
  if (err) throw err;
  const userDB=db.db('UserDB');
  userDB.createCollection('Users', (err, req)=>{
    db.close();
  })
});

MongoClient.connect(InfoDBurl, function(err, db) {
  if (err) throw err;
  const infoDB=db.db('InfoDB');
  infoDB.createCollection('Info', (err, req)=>{
    db.close();
  })
});

const UserDB=new MongoClient(UserDBurl);
const InfoDB=new MongoClient(InfoDBurl);

const cookieSetting = {
  maxAge:null
};
let someErrorHappend = false;
const store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/connect_mongodb_session',
  collection: 'mySessions'
});

store.on('error', function(error) {
  someErrorHappend=true;
  console.log(error);
});

router.use((req, res, next)=>{
  cookieSetting.maxAge=null;
  next();
});


router.use('/login', (req, res, next)=>{
  if(req.body.remember)
    cookieSetting.maxAge=1000 * 60 * 60 * 24 * 7;
  next();
});

router.use(require('express-session')({
  secret: 'secret of my vue express express-session',
  cookie: cookieSetting,
  store: store,
  resave: true,
  saveUninitialized: false,
  httpOnly:true
}));

router.use((req, res, next)=>{
  if(someErrorHappend)res.send('error');
  else next();
})

router.post('/register', async(req, res)=>{
  try{
    await UserDB.connect();
    const userCollection = await (await UserDB.db('UserDB')).collection('Users');
    const {userName, password}=req.body;
    const cursorValues = await userCollection.find({userName}).toArray();
    if(cursorValues.length!==0)res.send({status:'user name repeated'});
    await userCollection.insertOne({userName, password});
    res.send({status:'login'})
  }
  catch(e){console.log(e)}
  finally{
    UserDB.close();
  }
})

router.post('/login', async (req, res, next)=>{
  try{
    await UserDB.connect();
    const userCollection = await (await UserDB.db('UserDB')).collection('Users');
    const {userName, password}=req.body;
    const cursorValues = await userCollection.find({userName}).toArray();
    if(cursorValues.length===0)res.send({status:'user not found'});
    cursorValues.forEach(e => {
      if(e.password===password){
        req.session.user=req.body.userName;
        res.send({status:'login'})
      }
    });
  }
  catch(e){console.log(e)}
  finally{
    UserDB.close();
  }
})

router.get('/logout', (req, res)=>{
  try{
    req.session.destroy(()=>{
      res.send({status:'logout sucess'})
    })
  }catch(e){}
})

router.delete('/article', async(req, res)=>{
  try{
    if(!req.session.user){
      res.send({status:'not login yet'});
    }
    else{
        await InfoDB.connect();
        const infoCollection = await (await InfoDB.db('InfoDB')).collection('Info');
        if(req.session.user!==(await infoCollection.findOne({_id:ObjectId(req.body._id)})).author){
          res.send({status:"not the author"});
        }
        else{
          await infoCollection.deleteOne({_id:ObjectId(req.body._id)});
          res.send({status:'successcully delete article'});
        }
      }
  }catch(e){console.log(e)}
  finally{InfoDB.close();}
})

router.post('/post', async(req, res)=>{
  try{
    if(!req.session.user)res.send({status:'not login yet'});
    else{
        await InfoDB.connect();
        const infoCollection= await (await InfoDB.db('InfoDB')).collection('Info');
        console.log(req.body)
        await infoCollection.insertOne({
          ...req.body,
          author:req.session.user,
          discuss:[]
        })
        res.send({status:'post successful'})
      }
    }catch(e){console.log(e)}
  finally{InfoDB.close();}
})

router.post('/comment', async(req, res)=>{
  try{
    if(!req.session.user)res.send({status:"not login yet"});
    else{
        await InfoDB.connect();
        const infoCollection= await (await InfoDB.db('InfoDB')).collection('Info');
        const query = { _id: ObjectId(req.body._id) };
        const commentId=ObjectId()
        const updateDocument = {
          $push: {discussion:{_id:commentId, userName:req.session.user, content:req.body.content}}
        };
        await infoCollection.updateOne(query, updateDocument);
        res.send({status:"comment successful", _id:commentId})
      }
  }catch(e){console.log(e)}
  finally{InfoDB.close();}
})

router.delete('/comment', async(req, res)=>{
  try{
    if(!req.session.user)res.send({status:'not login yet'});
    else{
        await InfoDB.connect();
        const infoCollection = await (await InfoDB.db('InfoDB')).collection('Info');
        const {_id, index}=req.body;
        const discussionArray = (await infoCollection.findOne({_id:ObjectId(_id)})).discussion
        const deletedTarget = discussionArray.find(e=>e._id.toString()===index);
        if(req.session.user!== deletedTarget.userName){
          res.send({status:"not the author"});
        }
        else{
          const query = { _id:ObjectId(_id) };
          const updateDocument = {
            $pull: { discussion:deletedTarget },
          };
          await infoCollection.updateOne(query, updateDocument);
          res.send({status:'successcully delete comment'});
        }
      }
  }catch(e){console.log(e);res.send({status:'comment not found'})}
  finally{InfoDB.close();}
})

router.get('/', (req, res)=>{
  try{
    if(req.session.user) res.send({status:'login by session', userName:req.session.user});
    else res.send({status:'not login yet'});
  }catch(e){console.log(e)}
})


module.exports = router;

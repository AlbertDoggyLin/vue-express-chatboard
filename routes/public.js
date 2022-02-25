const router = require('express').Router();
const { MongoClient, ObjectId } = require('mongodb');
const InfoDBurl = "mongodb://localhost:27017/InfoDB";

MongoClient.connect(InfoDBurl, function(err, db) {
  if (err) throw err;
  const infoDB=db.db('InfoDB');
  infoDB.createCollection('Info', (err, req)=>{
    db.close();
  })
});

const InfoDB=new MongoClient(InfoDBurl);
router.get('/', async function(req,res){
  try{
    await InfoDB.connect();
    const infoCollection= await (await InfoDB.db('InfoDB')).collection('Info');
    const values=await infoCollection.find({}).toArray();
    res.send({status:'fetch successful', data:values})
  }catch(e){console.log(e)}
  finally{InfoDB.close();}
})

router.post('/',async(req, res)=>{
  try{
    await InfoDB.connect();
    const infoCollection= await (await InfoDB.db('InfoDB')).collection('Info');
    const {_id}=req.body;
    const value = (await infoCollection.find({_id:ObjectId(_id)}).toArray())[0];
    res.send({status:'fetch successful', article:value})
  }catch(e){console.log(e)}
  finally{InfoDB.close();}
})

module.exports = router;
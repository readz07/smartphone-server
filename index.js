//core rquires packages
const express = require('express')
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
require('dotenv').config()
const port = process.env.port || 5000;

//middleware
app.use(cors())
app.use(express.json())

function verifyJWT(req, res, next){
  const authHeaders = req.headers.authorization;
  if(!authHeaders){
    return res.status(401).send({message:"Unauthorised Access"});
  }
  const token = authHeaders.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
    if(err){
      return res.status(403).send({message :"Forbidden Access"})
    }
    
    req.decoded = decoded
    next()
  })
}

//database conncetion
const uri = `mongodb+srv://${process.env.DB_PRODUCTS}:${process.env.DB_SECURE}@cluster0.30h5q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
  try {
    await client.connect();
    const productsCollection = client.db("smartphoneInventory").collection("products");
    
    app.get('/products', async(req, res)=>{
      const query = {};
      const cursor = productsCollection.find(query)
      const products = await cursor.toArray()
      res.send(products)
    })

    //show single product on front end
    app.get('/products/:Id', async(req,res)=>{
      const id = req.params.Id
      const query = {_id:ObjectId(id)}
      const product = await productsCollection.findOne(query);
      res.send(product)
    })

    // JWT token for sign in
    app.post('/signin', async(req, res)=>{
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: "1d"
      })
      res.send(accessToken)
    })

    //show products based on email id and jwt
    app.get('/productslist' , verifyJWT, async(req, res)=>{
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
     if(email === decodedEmail){
       const query ={email:email};
       const cursor = productsCollection.find(query);
       const results = await cursor.toArray();
       res.send(results)
     } else{
       return res.status(403).send({message:'Forbidden Access'})
     }
    })

    //insert data POST method
    app.post('/products', async(req, res)=>{
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct)
      res.send(result)
    })

    // Update product quantity
    app.put('/products/:id', async(req,res)=>{
      const id = req.params.id;
      const newQuantity = req.body;
      const filter = {_id: ObjectId(id)};
      const options = { upsert: true };
      const updatedDoc = {
        $set: newQuantity
      };
      const result = await productsCollection.updateOne(filter,updatedDoc, options);
      res.send(result)
    }) 

    //Delete products
    app.delete('/products/:id', async(req,res)=>{
      const id = req.params.id
      const query = {_id:ObjectId(id)}
      const result = await productsCollection.deleteOne(query)
      res.send(result)
    })
  } finally {
    
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


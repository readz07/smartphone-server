//core rquires packages
const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
require('dotenv').config()
const port = process.env.port || 5000;

//middleware
app.use(cors())
app.use(express.json())


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

    app.get('/products/:Id', async(req,res)=>{
      const id = req.params.Id
      const query = {_id:ObjectId(id)}
      const product = await productsCollection.findOne(query);
      res.send(product)
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


const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u4rhioo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db('carDoctor').collection('services');
    const checkOutCollection = client.db('carDoctor').collection('checkOuts');

    app.get('/services', async(req, res) => {
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/services/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id)}

        const options = {
            // Include only the `title` and `imdb` fields in the returned document
            projection: { title: 1, price: 1, service_id: 1, img: 1},
          };

        const result = await serviceCollection.findOne(query, options);
        res.send(result);
    })

    // checkOuts or bookings 
    app.get('/checkOuts', async(req, res) => {
      console.log(req. query.email);
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await checkOutCollection.find(query).toArray()
      res.send(result);
    })



    app.post('/checkOuts', async(req, res) => {
        const checkOut = req.body;
        console.log(checkOut);
        const result = await checkOutCollection.insertOne(checkOut);
        res.send(result);
    });

    app.patch('/checkOuts/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updatedBooking = req.body;
      console.log(updatedBooking);
      const updatedDoc = {
        $set: {
          status: updatedBooking.status
        },
      };
      
      const result = await checkOutCollection.updateOne(filter, updatedDoc);
      res.send(result);

    })

    app.delete('/checkOuts/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await checkOutCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('doctor is running')
})

app.listen(port, () => {
    console.log(`car doctor server is running on port ${port}`)
})
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kjebueb.mongodb.net/?retryWrites=true&w=majority`;

console.log(process.env.DB_USER)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect((error) => {
      if (error) {
        console.log(error)
        return;
      }
    });
    const toysCollections = client.db("actionDB").collection("toys");

    // const indexKeys = { name: 1 }; 
    // const indexOptions = { name: "name" }; 
    // const result = await toysCollections.createIndex(indexKeys, indexOptions);

    app.get("/allToys", async (req, res) => {
      const result = await toysCollections.find().toArray();
      res.send(result);
    })

    app.get("/toys/:category", async (req, res) => {
      const category = req.params.category;
      if (category === "Marvel" || category === "DC" || category === "Transformers") {
        const result = await toysCollections.find({ subCategory: category }).limit(6).toArray();
        return res.send(result)
      }
    })

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollections.findOne(query);
      res.send(result)
    })
    app.get("/singleToyDetails/:id", async (req, res) => {

      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollections.findOne(query);
      res.send(result)

    })
    app.get("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollections.findOne(query);
      res.send(result)
    })
    app.get("/myToys/:text", async (req, res) => {
      console.log(req.query.email)
      const text = req.params.text;
      let query = {}
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      let sorting = {}
      if (text == "low") {
        sorting = { price: 1 }
      }
      else if (text == "high") {
        sorting = { price: -1 }
      }
      else {
        return res.send({ error: "error" })
      }

      const result = await toysCollections.find(query).sort(sorting).toArray();
      res.send(result)
    })
    app.get("/searchItem/:name", async (req, res) => {
      const searchName = req.params.name;
      const result = await toysCollections
        .find({
          $or: [
            { name: { $regex: searchName, $options: "i" } }
          ],
        })
        .toArray();
      res.send(result);
    })


    app.post("/addToy", async (req, res) => {
      const toy = req.body;
      const result = await toysCollections.insertOne(toy);
      res.send(result)
    })

    app.delete("/myToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollections.deleteOne(query);
      res.send(result)

    })
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const toy = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          price: toy.price,
          availableQuantity: toy.quantity,
          description: toy.description
        },
      };

      const result = await toysCollections.updateOne(filter, updateDoc, options);
      res.send(result)
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



app.get("/", (req, res) => {
  res.send("Toy Market is Running")
})

app.listen(port, () => {
  console.log(`Toy Market is running on port${port}`)
})
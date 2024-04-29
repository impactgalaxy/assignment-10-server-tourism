require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s7sbkwf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get("/", (req, res) => {
    res.send("Server for assignment_10 is running successfully.....")
})
app.listen(port, () => {
    console.log(`Server for assignment_10 is running on port => ${port}`);
})
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const dbCollectionSpot = client.db("touristDB").collection("touristSpot");
        const dbCollectionCountries = client.db("touristDB").collection("countries");

        app.post("/touristSpots", async (req, res) => {
            const body = req.body;
            const result = await dbCollectionSpot.insertOne(body);
            res.send(result);
        });

        app.get("/touristSpots", async (req, res) => {
            const result = await dbCollectionSpot.find().toArray();
            res.send(result);
        });

        app.get("/touristSpots/:id", async (req, res) => {
            const id = req.params.id;
            const regEx = /^[A-Z]/
            const check = regEx.test(id);
            if (check) {
                const queryById = {
                    country: id
                };
                const result = await dbCollectionSpot.find(queryById).toArray();
                res.send(result);

            } else {
                const query = {
                    _id: new ObjectId(id)
                }
                const result = await dbCollectionSpot.findOne(query);
                res.send(result);
            }

        });
        app.patch("/touristSpots/:id", async (req, res) => {
            const { spot, location, country, visitorPerYear, cost, travelTime, photo, season, description } = req.body;
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    spot, location, country, visitorPerYear, cost, travelTime, photo, season, description
                }
            }
            const result = await dbCollectionSpot.updateOne(query, updateDoc, { upsert: true });
            res.send(result);
        })
        app.delete("/touristSpots/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await dbCollectionSpot.deleteOne(query);
            res.send(result);
        })

        app.get("/countries", async (req, res) => {
            const result = await dbCollectionCountries.find().toArray();
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

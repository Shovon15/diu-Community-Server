const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const jwt = require("jsonwebtoken");
require("dotenv").config();
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jallqro.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});
// console.log(uri);

async function run() {
    try {
        const usersCollection = client.db("DIU-Community").collection("users");
        const postsCollection = client.db("DIU-Community").collection("posts");

        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send(user);
        });

        app.post("/users", async (req, res) => {
            const user = req.body;
            // console.log(user);
            // TODO: make sure you do not enter duplicate user email
            // only insert users if the user doesn't exist in the database
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.put("/users/:email", async (req, res) => {
            const email = req.params.email;
            const status = req.body;
            console.log(email, status);
            const query = { email: email };
            const option = { upsert: true };
            const updatedDoc = {
                $set: {
                    name: status.name,
                    institute: status.institute,
                    department: status.department,
                    batch: status.batch,
                    profession: status.profession,
                },
            };
            const result = await usersCollection.updateOne(query, updatedDoc, option);
            res.send(result);
        });

        // ----------------------------user post api--------------------------------

        app.get("/posts", async (req, res) => {
            const query = {};
            const result = await postsCollection.find(query).toArray();
            res.send(result);
        });
        app.get("/topposts", async (req, res) => {
            const query = {};
            const result = await postsCollection.find(query).limit(10).toArray();
            res.send(result);
        });

        app.post("/posts", async (req, res) => {
            const post = req.body;
            const result = await postsCollection.insertOne(post);
            res.send(result);
        });

        app.get("/posts/:email", async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
            const posts = await postsCollection.find(query).toArray();
            res.send(posts);
        });
    } finally {
    }
}
run().catch(console.log);
// ------------------------
app.get("/", async (req, res) => {
    res.send("diu community server is running");
});

app.listen(port, () => console.log(`diu community server running on ${port}`));

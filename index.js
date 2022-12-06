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
        const commentsCollection = client.db("DIU-Community").collection("comments");

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
            // console.log(email, status);
            const query = { email: email };
            const option = { upsert: true };
            const updatedDoc = {
                $set: {
                    name: status.name,
                    institution: status.institution,
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
        app.get("/posts/:_id", async (req, res) => {
            const id = req.params._id;
            // console.log(id);
            const filter = { _id: ObjectId(id) };
            const result = await postsCollection.findOne(filter);
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
            // const query = { postId: email };
            // console.log(email);
            const posts = await postsCollection.find(query).toArray();
            res.send(posts);
        });
        // app.get("/posts/:email", async (req, res) => {
        //     const email = req.params.email;
        //     // const email = "user@gmail.com";
        //     console.log(email);
        //     // const query = { userEmail: email };
        //     // const posts = await postsCollection.find(query).toArray();
        //     // res.send(posts);
        // });

        // ------------------------user comments api------------------------------

        app.get("/comments/:_id", async (req, res) => {
            const id = req.params._id;
            // console.log(id);
            // const postId = {};
            const filter = { postId: id };
            const sort = { date: -1 };
            const result = await commentsCollection.find(filter).sort(sort).toArray();
            res.send(result);
        });

        app.get("/comments", async (req, res) => {
            const filter = {};
            const result = await commentsCollection.find(filter).toArray();
            res.send(result);
        });

        app.post("/comments/", async (req, res) => {
            const comments = req.body;
            const result = await commentsCollection.insertOne(comments);
            res.send(result);
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

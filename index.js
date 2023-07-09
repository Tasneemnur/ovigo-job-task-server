const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { query } = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9iyox0a.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const usersCollection = client.db("travellersDB").collection("users");
  const communitiesCollection = client
    .db("travellersDB")
    .collection("communities");
  const cartsCollection = client.db("travellersDB").collection("carts");
  const postsCollection = client.db("travellersDB").collection("posts");

  try {
    // await client.connect();

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send(token);
    });

    app.get("/posts", async (req, res) => {
      const result = await postsCollection.find().toArray();
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.get("/communities", async (req, res) => {
      const result = await communitiesCollection.find().toArray();
      res.send(result);
    });
    app.get("/carts", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      if (req.query?.id) {
        query = { adminId: req.query.id };
      }
      const result = await cartsCollection.find(query).toArray();
      res.send(result);
    });
    app.patch("/carts/approved/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateClass = {
        $set: {
          status: "approved",
        },
      };
      const result = await cartsCollection.updateOne(filter, updateClass);
      res.send(result);
    });
    app.post("/carts", async (req, res) => {
      const cart = req.body;
      const insertResult = await cartsCollection.insertOne(cart);
      res.send(insertResult);
    });
    app.post("/communities", async (req, res) => {
      const community = req.body;
      const result = await communitiesCollection.insertOne(community);
      res.send(result);
    });
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("This is Traveller Server");
});
app.listen(port, () => {
  console.log(`The traveller server running on port: ${port}`);
});

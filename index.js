const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const fakeData = [
  {
    "communityName": "The Betterment Society",
    "communityPicture": "https://i.ibb.co/zx9MS2M/society.jpg",
    "time": "12:30 PM",
    "likes": 10,
    "details": "Those of us that are here in Bangladesh have all heard and seen the devastating effects the flood has brought upon the people of the Greater Sylhet region. So many lives lost and countless livelihoods shelters destroyed. The whole city is in dire need of support. Those who are abroad probably with no idea what’s going on, we can only show you the pictures and videos of the situation here but you would have to be there to understand what it feels like to see your home, the city you grew up in get ruined in front of your own eyes.",
    "postPicture": "https://i.ibb.co/P5kwcqF/post1.jpg"
  },
  {
    "communityName": "Pink Blush",
    "communityPicture": "https://i.ibb.co/Km3XnjQ/blush.jpg",
    "time": "09:45 AM",
    "likes": 5,
    "details": "Check out the new Pink Blush Summer Collection! Get ready for the summer with our vibrant and stylish outfits. From flowy dresses to trendy tops, we have it all. Visit our website to browse the collection and enjoy exclusive discounts. Don't miss out on the perfect summer wardrobe! #PinkBlush #SummerCollection",
    "postPicture": "https://i.ibb.co/Rb7qSbH/post2.jpg"
  },
  {
    "communityName": "Love not War",
    "communityPicture": "https://i.ibb.co/DfKnnM8/love.jpg",
    "time": "06:15 PM",
    "likes": 15,
    "details": "Spread love, not war! Let's embrace kindness, compassion, and understanding. Together, we can make the world a better place. Share your stories of love, acts of kindness, or inspirational quotes in the comments below. Remember, a little love can go a long way! #LoveNotWar #SpreadLove",
    "postPicture": "https://i.ibb.co/23K7H0L/post3.jpg"
  },
{
    "communityName": "Science in Progress",
    "communityPicture": "https://i.ibb.co/Kwd05Fx/science.jpg",
    "time": "08:20 PM",
    "likes": 30,
    "details": "After President Obama’s call to attain a “level of research and development not seen since the height of the Space Race” in the State of the Union, universities are renewing their cry for a deal to avoid the automatic budget cuts known as sequestration.",
    "postPicture": "https://i.ibb.co/p0FQZft/post4.jpg"
  },
{
    "communityName": "Green Fields",
    "communityPicture": "https://i.ibb.co/b2zMksK/field.jpg",
    "time": "09:15 AM",
    "likes": 12,
    "details": "The greenfield strategy relies on a complete fresh start. To use a metaphor: The project starts anew and proverbially “on the greenfield”. This path has advantages. Often, many legacy systems have grown historically and have been subject to many adaptations over the course of the last few years.",
    "postPicture": "https://i.ibb.co/BPML4WY/post5.jpg"
  },
{
    "communityName": "The Betterment Society",
    "communityPicture": "https://i.ibb.co/zx9MS2M/society.jpg",
    "time": "5:30 PM",
    "likes": 45,
    "details": "Assalamualaikum everyone. Alhamdulillah we were able to hold two events with the funds raised. Thank you everyone for your love, support and prayers that led us to make #project_help a huge success in such a short period of time. After Eid-ul-Fitr, we did a collaboration with an organisation from Sunamganj named 'Swopnadorsho' স্বপ্নাদর্শ and distributed rations to around a 100 families during this difficult covid times.",
    "postPicture": "https://i.ibb.co/ZMx6Hm7/post6.jpg"
  },
{
    "communityName": "Love not War",
    "communityPicture": "https://i.ibb.co/DfKnnM8/love.jpg",
    "time": "12:12 AM",
    "likes": 20,
    "details": "Investing in a child's growth and development is crucial, as it sets a strong foundation for their future. Nurturing and guiding children through their formative years can help shape their character and potential. Remember, it is easier to build a child with love, support, and education than it is to repair an adult. Let's prioritize providing a positive and empowering environment for our children's growth. Together, we can help them flourish into confident and resilient individuals.",
    "postPicture": "https://i.ibb.co/VD6q216/post7.jpg"
  },
{
    "communityName": "Green Fields",
    "communityPicture": "https://i.ibb.co/b2zMksK/field.jpg",
    "time": "2:10 PM",
    "likes": 14,
    "details": "Take a moment to appreciate the beauty of a green field. There's something truly enchanting about the lush green grass dancing in the breeze. It symbolizes growth, renewal, and the wonders of nature. Let's cherish and protect our green spaces, ensuring they thrive for future generations to enjoy. Share your favorite green field photos or memories in the comments below! #GreenField #NatureLove",
    "postPicture": "https://i.ibb.co/k8sPZ77/post8.jpg"
  },
{
    "communityName": "The Betterment Society",
    "communityPicture": "https://i.ibb.co/zx9MS2M/society.jpg",
    "time": "4:30 PM",
    "likes": 30,
    "details": "Assalamualaikum all, After a successful fundraising Alhamdulilah, we decided to hold two events for  #project_help. On the 27th of Ramadan, we have successfully distributed Iftar to more than a 100 people! Here's a glimpse of the blessed day.",
    "postPicture": "https://i.ibb.co/xYqLKw6/post9.jpg"
  },
]

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
  }
});

async function run() {
    const usersCollection = client.db("travellersDB").collection("users");
    const communitiesCollection = client.db("travellersDB").collection("communities");
    const cartsCollection = client.db("travellersDB").collection("carts");
    const postsCollection = client.db("travellersDB").collection("posts");
    
  try {
    await client.connect();

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send(token);
    });
    const result = await postsCollection.insertMany(fakeData);
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
          console.log(req.query.id)
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
      })
      app.post("/carts", async (req, res) => {
        const cart = req.body;
        const insertResult = await cartsCollection.insertOne(cart);

        // const {communityId} = cart;
        // const updateResult = await communitiesCollection.updateOne({ _id: new ObjectId(communityId) }, {
        //   $inc: { members: 1 }
        // },{ upsert: true } )
  
        res.send(insertResult);
      });
    app.post("/communities", async (req, res) => {
        const community = req.body;
        const result = await communitiesCollection.insertOne(community);
        res.send(result);
      });
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
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
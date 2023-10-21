const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};
app.use(cors(corsConfig));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pzomx9u.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const brandsCollection = client.db("brandsDB").collection("brands");
    const productsCollection = client.db("brandsDB").collection("products");

    app.get("/brands", async (req, res) => {
      const query = { tag: "brands" };
      const brands = await brandsCollection.find(query).toArray();
      res.send(brands);
    });

    app.get("/products/:brand_name", async (req, res) => {
      const brand_name = req.params.brand_name;
      const query = { brandName: brand_name };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    app.get("/addToCart/:user", async (req, res) => {
      const user = req.params.user;
      const userCartCollection = client
        .db("brandsDB")
        .collection("CartItemFor." + user);
      const query = { userEmail: user };
      const result = await userCartCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.post("/addToCart", async (req, res) => {
      const product = req.body;
      const getUserEmail = product.userEmail;
      const userCartCollection = client
        .db("brandsDB")
        .collection("CartItemFor." + getUserEmail);
      const result = await userCartCollection.insertOne(product);
      res.send(result);
    });

    app.patch("/product/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateProduct = req.body;
      const product = {
        $set: {
          carName: updateProduct.carName,
          price: updateProduct.price,
          description: updateProduct.description,
          photoUrl: updateProduct.photoUrl,
          brandName: updateProduct.brandName,
          category: updateProduct.category,
          rating: updateProduct.rating,
        },
      };
      const result = await productsCollection.updateOne(
        filter,
        product,
        options
      );
      res.send(result);
    });

    app.delete("/addToCart/:id/:user", async (req, res) => {
      const id = req.params.id;
      const user = req.params.user;
      const query = { _id: id };
      const userCartCollection = client
        .db("brandsDB")
        .collection("CartItemFor." + user);
      const result = await userCartCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Brand Shop Server Side Running");
});
app.listen(port, () => {
  console.log(`Port Running On: ${port}`);
});

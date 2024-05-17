const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3c2xoyj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // Send a ping to confirm a successful connection

        const productCollection = client.db('emaJohnDB').collection('products');

        app.get('/products', async (req, res) => {
            // console.log(req.query);
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            // console.log(page, limit, skip);
            const result = await productCollection.find().skip(skip).limit(limit).toArray();
            res.send(result);
        })

        app.get('/totalProducts', async (req, res) => {
            const result = await productCollection.estimatedDocumentCount();
            res.send({ totalProducts: result });
        })

        app.post('/productsByIds', async (req, res) => {
            const ids = req.body;
            // console.log(ids);
            const objectIds = ids?.map(id => new ObjectId(id))
            const query = { _id: { $in: objectIds } };
            const result = await productCollection.find(query).toArray();
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Ema John server is running');
})

app.listen(port, () => {
    console.log(`Ema John server is running port ${port}`);
})

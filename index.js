require('dotenv').config();

const PORT = process.env.PORT;
const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.DB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

const run = async () => {
    try {
        await client.connect();
        const db = await client.db(process.env.DB_NAME);
        const collection = await db.collection(process.env.DB_COLLECTION);
        const bookings = await db.collection(process.env.BOOKING_COLLECTION);

        app.get('/tutors', async (req, res) => {
            const cu = collection.find();
            const tutors = await cu.toArray();
            res.send(tutors);
        });

        app.get('/tutors/:slug', async (req, res) => {
            const id = req.params.slug;
            const query = {
                _id: new ObjectId(id)
            };
            const tutor = await collection.findOne(query);
            if (!tutor) {
                return res.status(404).json({ error: "Tutor not found" });
            };
            res.send(tutor);
        });

        app.post('/bookings', async (req, res) => {
            const newBooking = req.body;
            const result = await bookings.insertOne(newBooking);
            res.send(result);
        });

        app.get('/bookings', async (req, res) => {
            const cu = bookings.find();
            const result = await cu.toArray();
            res.send(result);
        });

        app.post('/tutors', async (req, res) => {
            const newTutor = req.body;
            const result = await collection.insertOne(newTutor);
            res.send(result);
        });

        app.delete('/del/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id),
            };
            const result = bookings.deleteOne(query);
            console.log(await result, "deleted booking");
            res.send(result);
        });

    } finally {
        // await client.close();
    }
};

run().catch(console.dir);
app.listen(PORT, (req, res) => {
    console.log('running...!');
});
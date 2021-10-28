const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const port = process.env.PORT || 6000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yai2s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run () {
    try{
        await client.connect();

        const database = client.db(process.env.DB_HOST);
        const eventsCollection = database.collection('events');
        const RegisterVolunteerCollection = database.collection('RegisteredAllVolunteer');

        // Add Service for Volunteer
        app.get('/events', async(req, res) =>{
            const events = await eventsCollection.find({}).toArray();
            res.send(events);
        })

        // Event Post
        app.post('/eventPost', async(req, res) =>{
            const eventBody = req.body;
            const result = await eventsCollection.insertOne(eventBody);
            res.send(result);
        })

        // Register volunteer for services
        app.post('/allVolunteer', async(req, res) =>{
            const regVolunteer = req.body;
            const result = await RegisterVolunteerCollection.insertOne(regVolunteer);
            res.send(result);
        })

        // Get Registered Events
        app.get('/regEvents/:email', async(req, res) =>{
            RegisterVolunteerCollection.find({emailValue: req.params.email})
            .toArray((err, results)  =>{
                res.send(results);
            })
        })

        // Delete Registered Events
        app.delete('/regEvents/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await RegisterVolunteerCollection.deleteOne(query);
            res.send(result);
        })

        // All Volunteers Register List
        app.get('/allVolunteers', async(req, res) =>{
            const result = await RegisterVolunteerCollection.find({}).toArray();
            res.send(result);
        })
    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send("Volunteer Network Server running...");
})

app.listen(port, () =>{
    console.log("Server running on port: ", port);
})
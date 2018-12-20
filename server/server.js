import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { MongoClient as Client } from 'mongodb';
import Sentiment from 'sentiment';
import { uri } from './mongodbConfig.js';

const app = express();
const port = 3001;
const sentiment = new Sentiment();
const client = new Client(uri, { useNewUrlParser: true });
client.connect();

app.use(cors());
app.use(bodyParser.json());

app.get('/', (_req, res) => {
  res.sendStatus(200);
});

app.get('/entries', (_req, res) => {
  const collection = client.db('trollhunterz').collection('entries');
  collection.find({}).toArray((err, result) => {
    if (err) {
      res.status(500).send('Database failure');
      return;
    }
    const entries = result.map(({ _id, comparative, score }) => ({
      value: _id.value,
      comparative,
      score,
    })).reverse();
    res.status(200).send({ entries });
  });
});

app.get('/entry', (req, res) => {
  const { value } = req.body;
  const collection = client.db('trollhunterz').collection('entries');
  collection.find({ _id: { value } }).toArray((err, result) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    const entries = result.map(({ _id, comparative, score }) => ({
      value: _id.value,
      comparative,
      score,
    }));
    res.status(200).send({ entries });
  });
});

app.post('/entry', (req, res) => {
  const collection = client.db('trollhunterz').collection('entries');
  const { value } = req.body;
  if (!value) {
    res.status(400).send('Empty body');
    return;
  }

  try {
    const { comparative, score } = sentiment.analyze(value);
    try {
      collection.insertOne({
        _id: {
          value,
        },
        comparative,
        score,
      });
      res.sendStatus(200);
      return;
    } catch (e) {
      res.status(500).send('Database failure.');
      return;
    }
  } catch (e) {
    res.status(500).send('Analyze failure');
    return;
  }
});

app.listen(port, () => {
  console.log(`Listening to port ${ port }.`);
});
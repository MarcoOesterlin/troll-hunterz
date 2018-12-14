import express from 'express';
import Sentiment from 'sentiment';
import cors from 'cors';

const app = express();
const sentiment = new Sentiment();

app.use(cors());

app.get('/', (req, res) => {
  try {
    const { value } = req.query;
    const { comparative, score } = sentiment.analyze(value);
    res.status(200).send({ comparative, score });
  } catch (e) {
    res.status(500).send('Failed to analyze');
  }
});

app.listen(3001, () => {
  console.log('Listening to 3001');
});
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import Sentiment from 'sentiment';

const app = express();
const port = 3002;
const sentiment = new Sentiment();

app.use(cors());
app.use(json());
app.get('/analyze', (req, res) => {
  const { value } = req.query;
  const { comparative, score } = sentiment.analyze(value);
  res.status(200).send({
    comparative,
    score,
  });
  return;
});
app.listen(port, () => {
  console.log(`Sentiment server listening to port ${ port }.`);
});

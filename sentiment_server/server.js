import express from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";
import Sentiment from "sentiment";

/**
 * Initializing a server using npm Sentiment package and displaying it as a web-API. A user can post a request containing a String and recieves a sentiment comparative score.
 */

const app = express();
const port = 3002;
const sentiment = new Sentiment();

app.use(cors());
app.use(json({ limit: "10mb", extended: true }));
app.use(urlencoded({ limit: "10mb", extended: true }));
app.post("/analyze", (req, res) => {
  try {
    const { stringArray } = req.body;
    const comparativeArray = stringArray.map(
      s => sentiment.analyze(s).comparative
    );
    const numElements = stringArray.length;
    const comparative =
      (comparativeArray.reduce((acc, val) => acc + val, 0) / numElements) * 100;
    res.status(200).send({ comparative });
    return;
  } catch (e) {
    console.log("Failed to analyze");
    res.status(500).send("Failed to analyze");
    return;
  }
});
app.get("/analyze", (req, res) => {
  console.log(req.query);
  res.sendStatus(200);
});
app.listen(port, () => {
  console.log(`Sentiment server listening to port ${port}.`);
});

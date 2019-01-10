import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import Controller from './Controller';

const app = express();
const port = 3001;
const {
  getAllEntries,
  insertEntry,
  youtubeEntry,
} = new Controller();

app.use(cors());
app.use(json());
app.get('/entries', getAllEntries);
app.post('/entry', insertEntry);
app.post('/youtubeentry', youtubeEntry)
app.listen(port, () => {
  console.log(`Server listening to port ${ port }.`);
});
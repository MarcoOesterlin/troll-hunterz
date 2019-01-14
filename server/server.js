import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import Controller from './Controller';

const app = express();
const port = 3001;
const {
  getAllEntries,
  youtubeEntry,
  updateDb,
} = new Controller();

// Middlewares
app.use(cors());
app.use(json({ limit: '10mb', extended: true }));
app.use(urlencoded({ limit: '10mb', extended: true }));

// Routes 
const router = express.Router();
router.get('/entries', getAllEntries);
router.post('/entry', youtubeEntry);
router.post('/updatedb', updateDb);
app.use('/api/v1', router);

// Init server
app.listen(port, () => {
  console.log(`Server listening to port ${ port }.`);
});
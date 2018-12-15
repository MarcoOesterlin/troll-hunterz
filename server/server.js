import express from 'express';
import Sentiment from 'sentiment';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';

// Init sentiment analysis object
const sentiment = new Sentiment();

// Init express with middlewares
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Init database
const db = new sqlite3.Database('database.db');
db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS entries`)
  db.run(`CREATE TABLE entries ( value TEXT PRIMARY KEY, score DECIMAL )`);
});

app.get('/entries', (req, res) => {
  try {
    db.all(`SELECT * FROM entries`, (err, rows) => {
      res.status(200).send({ entries: rows});
    });
  } catch (err) {
    res.status(500).send('Database failure');
  }
});

app.post('/entry', (req, res) => {
  const { value } = req.body;
  if (!value) {
    res.status(400).send('Empty body');
  } else {
    try {
      const { comparative } = sentiment.analyze(value);
      try {
        db.run(`INSERT INTO entries VALUES ('${ value }', ${ comparative })`, (err) => {
          if (err) {
            if (err.code) {
              if (err.code === 'SQLITE_CONSTRAINT') {
                res.status(200).send({ comparative, message: 'Entry already exists' });
              } else {
                res.status(500).send(`Database failure. Reason: ${ err.code }`);
              } 
            } else {
              res.status(500).send('Database failure.');
            }
          } else {
            res.status(200).send({ comparative });
          }
        });
      } catch (e) {
        res.status(500).send('Database failure.');
      }
    } catch (e) {
      res.status(500).send('Analyze failure');
    }
  }
});

app.listen(3001, () => {
  console.log('Listening to 3001');
});
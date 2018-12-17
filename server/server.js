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
// db.serialize(() => {
//   db.run(`DROP TABLE IF EXISTS entries`);
//   db.run(`CREATE TABLE entries (
//     value TEXT PRIMARY KEY,
//     score DECIMAL,
//     comparative DECIMAL
//   )`);
// });
// db.parallelize(() => {
//   db.run(`INSERT INTO entries VALUES ("Shit cunt", -9.0, -4.5)`);
//   db.run(`INSERT INTO entries VALUES ("Fuck", -4.0, -4.0)`);
//   db.run(`INSERT INTO entries VALUES ("Great weather", 3.0, 1.5)`);
// });

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
    return;
  }

  try {
    const { comparative, score } = sentiment.analyze(value);
    try {
      db.serialize(() => {
        const query = `INSERT INTO entries VALUES ("${ value }", ${ score }, ${ comparative })`;
        db.run(query, err => {
          if (!err) {
            res.status(200).send({ comparative, score });
            return;
          }
          
          if (!err.code) {
            res.status(500).send('Database failure.');
            return;
          }
          
          if (err.code === 'SQLITE_CONSTRAINT') {
            res.status(200).send({ comparative, score, message: 'Entry already exists' });
            return;
          }
          
          res.status(500).send(`Database failure. Reason: ${ err.code }`);
          return;
        });
      });
    } catch (e) {
      res.status(500).send('Database failure.');
      return;
    }
  } catch (e) {
    res.status(500).send('Analyze failure');
    return;
  }
});

// app.post('/entry', (req, res) => {
//   const { value } = req.body;
//   if (!value) {
//     res.status(400).send('Empty body');
//   } else {
//     try {
//       const { comparative, score } = sentiment.analyze(value);
//       try {
//         db.serialize(() => {
//           db.run(`INSERT INTO entries VALUES ("${ value }", ${ score }, ${ comparative })`, (err) => {
//             if (err) {
//               if (err.code) {
//                 if (err.code === 'SQLITE_CONSTRAINT') {
//                   res.status(200).send({ comparative, message: 'Entry already exists' });
//                 } else {
//                   res.status(500).send(`Database failure. Reason: ${ err.code }`);
//                 } 
//               } else {
//                 res.status(500).send('Database failure.');
//               }
//             } else {
//               res.status(200).send({ comparative });
//             }
//           });
//         });
//       } catch (e) {
//         res.status(500).send('Database failure.');
//       }
//     } catch (e) {
//       res.status(500).send('Analyze failure');
//     }
//   }
// });

app.listen(3001, () => {
  console.log('Listening to 3001');
});
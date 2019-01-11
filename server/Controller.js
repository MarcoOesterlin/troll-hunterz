import { uri } from "./mongodbConfig.js";
import { MongoClient, ObjectId } from "mongodb";
import axios from "axios";
import { sentimentURI } from "./config";
import youtubeAPIKey from "./youtubeAPIKey";
import { google } from "googleapis";
export default class Controller {
  constructor() {
    this.mongoClient = new MongoClient(uri, { useNewUrlParser: true });
    this.mongoClient.connect(() => {
      console.log('Connected to MongoDB cloud.');
    });
    this.getAllEntries = this.getAllEntries.bind(this);
    this.insertEntry = this.insertEntry.bind(this);
    this.youtubeEntry = this.youtubeEntry.bind(this);
  }

  getAllEntries(_req, res) {
    // res.status(200).send({
    //   entries: {
    //     toxic: [
    //       {
    //         imgUrl:
    //           "https://yt3.ggpht.com/a-/AAuE7mAcW198VrHrQqGTGs5EEXx7-Tv-qtFpWky1og=s88-mo-c-c0xffffffff-rj-k-no",
    //         score: -7.182177975501057,
    //         username: "newdramaalert"
    //       },
    //       {
    //         imgUrl:
    //           "https://yt3.ggpht.com/a-/AAuE7mD7iJevCngNeCAIs0-3F6Dn_L4LtFnVOcpp9w=s88-mo-c-c0xffffffff-rj-k-no",
    //         score: 43.38968802213832,
    //         username: "h3h3productions"
    //       }
    //     ],
    //     polite: [
    //       {
    //         imgUrl:
    //           "https://yt3.ggpht.com/a-/AAuE7mDZhAzA6_0IvivO8I50ZE8Wdw3XQY4v2V-nDA=s88-mo-c-c0xffffffff-rj-k-no",
    //         score: 69.38185887861775,
    //         username: "destinws2"
    //       }
    //     ]
    //   }
    // });
    
    const getLatestByUsername = arraySortedByTimestamp => {
      const usernameMap = {};
      arraySortedByTimestamp.forEach(entry => {
        usernameMap[entry.username] = entry;
      });
      const uniqueUsername = Object.keys(usernameMap).map(key => usernameMap[key]);
      return uniqueUsername;
    }

    const sortByScore = entryArray => {
      const compare = (a,b) => {
        if (a.score < b.score)
          return -1;
        if (a.score > b.score)
          return 1;
        return 0;
      }
      const sortedEntryArray = entryArray.sort(compare)
      return sortedEntryArray;
    }
    
    const { mongoClient } = this;
    const collection = mongoClient.db('trollhunterz').collection('entries');
    collection.find({}).sort({ "_id.timestamp": 1 }).toArray((err, mongoDbResponse) => {
      if (err) {
        res.status(500).send('Database failure');
        return;
      }
      const sortedEntries = mongoDbResponse.map(entry => {
        const { _id, score, imgUrl } = entry;
        const { username, timestamp } = _id;
        return { score, imgUrl, username, timestamp };
      });
      const uniqueByUsername = getLatestByUsername(sortedEntries);
      const sortedByScore = sortByScore(uniqueByUsername);
      res.status(200).send({
        entries: {
        toxic: sortedByScore.slice(0, 3),
        polite: sortedByScore.slice(sortedByScore.length - 3, sortedByScore.length).reverse(),
      }});
    });
  }

  async insertEntry(req, res) {
    const { mongoClient } = this;
    const collection = mongoClient.db("trollhunterz").collection("entries");
    const { value } = req.body;
    if (!value) {
      res.status(400).send("Empty body");
      return;
    }

    try {
      const analyzeResponse = await axios.get(
        `${sentimentURI}/analyze?value=${value}`
      );
      const { comparative, score } = analyzeResponse.data;
      try {
        collection.insertOne({
          _id: {
            value
          },
          comparative,
          score
        });
        res.status(200).send({
          value,
          comparative,
          score
        });
        return;
      } catch (e) {
        res.status(500).send("Database failure.");
        return;
      }
    } catch (err) {
      res.status(500).send(`Failed to analyze.${process.env.SENTIMENT_URI}`);
      return;
    }
  }

  async youtubeEntry(req, res) {
    const service = google.youtube("v3");
    const { value: username } = req.body;
    console.log(`${username}: Analyzing...`);

    const usernameToChannelId = async username => {
      const parameters = {
        maxResults: "25",
        part: "snippet",
        auth: youtubeAPIKey,
        forUsername: username
      };
      try {
        const googleResponse = await service.channels.list(parameters);
        const channelId = googleResponse.data.items[0].id;
        return channelId;
      } catch (e) {
        try {
          const parameters = {
            maxResults: "25",
            part: "snippet",
            auth: youtubeAPIKey,
            channelId: username
          };
          const googleResponse = await service.channels.list(parameters);
          const channelId = googleResponse.data.items[0].id;
          return channelId;
        } catch (e) {
          return null;
        }
      }
    };

    const channelIdToVideoIds = async (channelId, maxResults) => {
      const parameters = {
        maxResults: maxResults,
        part: "snippet",
        auth: youtubeAPIKey,
        type: "video",
        channelId: channelId,
        order: "viewCount"
      };
      try {
        const googleResponse = await service.search.list(parameters);
        const { data } = googleResponse;
        const { items } = data;
        const videoIds = items.map(item => item.id.videoId);
        return videoIds;
      } catch (e) {
        return null;
      }
    };

    const retrieveComments = async (videoId, maxResults) => {
      const parameters = {
        maxResults: maxResults,
        part: "snippet",
        auth: youtubeAPIKey,
        videoId,
        order: "relevance"
      };
      try {
        const googleResponse = await service.commentThreads.list(parameters);
        const { data } = googleResponse;
        const { items } = data;
        const comments = items.map(
          item => item.snippet.topLevelComment.snippet.textOriginal
        );
        return comments;
      } catch (e) {
        return [];
      }
    };

    const summarizeVideoComments = async videoComments => {
      try {
        const commentScores = await Promise.all(
          videoComments.map(async videoComment => {
            const sentimentResponse = await axios.get(
              `${sentimentURI}/analyze?value=${encodeURI(videoComment)}`
            );
            return sentimentResponse.data.comparative;
          })
        );
        const sumScores = commentScores.reduce((a, b) => a + b, 0);
        return sumScores;
      } catch (e) {
        return null;
      }
    };

    const getImageUrl = async username => {
      const parameters = {
        maxResults: "25",
        part: "snippet",
        auth: youtubeAPIKey,
        forUsername: username
      };
      try {
        const googleResponse = await service.channels.list(parameters);
        const imageUrl =
          googleResponse.data.items[0].snippet.thumbnails.default.url;
        return imageUrl;
      } catch (e) {
        return null;
      }
    };

    const getNumEmptyArrays = array2d => {
      let numEmptyArrays = 0;
      array2d.forEach(array => {
        if (array.length <= 0) {
          numEmptyArrays++;
        }
      });
      return numEmptyArrays;
    };

    const channelId = await usernameToChannelId(username);
    if (!channelId) {
      console.log(`${username}: Channel not found.`);
      res.status(400).send(`${username}: Channel not found.`);
      return;
    }

    const videoIds = await channelIdToVideoIds(channelId, 50);
    console.log(`${username}: ${videoIds.length} videos found.`);

    const videosComments = await Promise.all(
      videoIds.map(videoId => retrieveComments(videoId, 100))
    );
    const numDisabledCommentSections = getNumEmptyArrays(videosComments);
    console.log(
      `${username}: ${numDisabledCommentSections} of disabled comment sections of ${
        videosComments.length
      }.`
    );

    const videoSentimentScores = await Promise.all(
      videosComments.map(videoComments => summarizeVideoComments(videoComments))
    );
    if (videoSentimentScores) {
      console.log(`${username}: Successfully executed sentiment analysis.`);
    } else {
      console.log(`${username}: Failed to execute sentiment analysis`);
    }
    const channelSentimentSum = videoSentimentScores.reduce((a, b) => a + b, 0) / videosComments.length;
    console.log(`${username}: ${channelSentimentSum} sentiment score.`);

    const imgUrl = await getImageUrl(username);
    if (imgUrl) {
      console.log(`${username}: Found image.`);
    } else {
      console.log(`${username}: Image not found.`);
    }

    const timestamp = Date.now();
    console.log(`${username}: Timestamp ${ timestamp }`);

    const collection = this.mongoClient
      .db("trollhunterz")
      .collection("entries");
    try {
      console.log(`${username}: Pushing to db...`);
      await collection.insertOne({
        _id: {
          username,
          timestamp
        },
        score: channelSentimentSum,
        imgUrl
      });
      console.log(`${username}: Successfully pushed to db.`);
      res.status(200).send({
        score: channelSentimentSum,
        username: username,
        imgUrl: imgUrl
      });
      console.log(`${username}: OK.`);
      return;
    } catch (e) {
      console.log(`${username}: Failed.`);
      res.status(500).send("Database failure.");
      return;
    }
  }
}

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
    
    const getLatestByChannelId = arraySortedByTimestamp => {
      const channelIdMap = {};
      arraySortedByTimestamp.forEach(entry => {
        channelIdMap[entry.channelId] = entry;
      });
      const uniqueChannelIds = Object.keys(channelIdMap).map(key => channelIdMap[key]);
      return uniqueChannelIds;
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
        const { _id, score, imgUrl, channelTitle, bannerUrl } = entry;
        const { channelId, timestamp } = _id;
        return { score, imgUrl, channelId, timestamp, channelTitle, bannerUrl };
      });
      const uniqueByChannelId = getLatestByChannelId(sortedEntries);
      console.log(uniqueByChannelId);
      const sortedByScore = sortByScore(uniqueByChannelId);
      res.status(200).send({
        entries: {
        toxic: sortedByScore.slice(0, 10),
        polite: sortedByScore.slice(sortedByScore.length - 10, sortedByScore.length).reverse(),
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
    const { value } = req.body;
    console.log(`${value}: Analyzing...`);

    const valueToChannelId = async username => {
      const splitLast = (s, splitCharacter) => {
        const stringArray = s.split(splitCharacter);
        return stringArray[stringArray.length - 1];
      }

      const isYoutubeUrl = s => {
        const urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
        const regex = new RegExp(urlRegex);
        return s.match(regex);
      }
      
      const inputParam = isYoutubeUrl(username)
        ? splitLast(username, '/')
        : username;
      try {
        const parameters = {
          maxResults: "25",
          part: "snippet",
          auth: youtubeAPIKey,
          forUsername: inputParam
        };
        const googleResponse = await service.channels.list(parameters);
        const channelId = googleResponse.data.items[0].id;
        return channelId;
      } catch (e) {
        try {
          const parameters = {
            maxResults: "25",
            part: "snippet",
            auth: youtubeAPIKey,
            id: inputParam
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

    const getImageUrl = async channelId => {
      const parameters = {
        maxResults: "25",
        part: "snippet",
        auth: youtubeAPIKey,
        id: channelId,
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

    const getChannelTitle = async channelId => {
      const parameters = {
        maxResults: "25",
        part: "snippet",
        auth: youtubeAPIKey,
        id: channelId
      };
      try {
        const googleResponse = await service.channels.list(parameters);
        const channelTitle = googleResponse.data.items[0].snippet.title;
        return channelTitle;
      } catch (e) {
        return null;
      }
    }

    const getBannerUrl = async channelId => {
      const parameters = {
        maxResults: "25",
        part: "brandingSettings",
        auth: youtubeAPIKey,
        id: channelId
      };
      try {
        const googleResponse = await service.channels.list(parameters);
        const bannerUrl = googleResponse.data.items[0].brandingSettings.image.bannerImageUrl;
        return bannerUrl;
      } catch (e) {
        return null;
      }
    }
    
    const channelId = await valueToChannelId(value);
    if (!channelId) {
      console.log(`${value}: Channel not found.`);
      res.status(400).send(`${value}: Channel not found.`);
      return;
    } else {
      console.log(`${value}: Channel id: ${channelId}`);
    }
    
    const bannerUrl = await getBannerUrl(channelId);
    if (bannerUrl) {
      console.log(`${value}: BannerUrl found. ${bannerUrl}`);
    }

    const channelTitle = await getChannelTitle(channelId);
    console.log(`${value}: Channel title: ${channelTitle}`);

    const videoIds = await channelIdToVideoIds(channelId, 50);
    console.log(`${value}: ${videoIds.length} videos found.`);

    const videosComments = await Promise.all(
      videoIds.map(videoId => retrieveComments(videoId, 100))
    );
    const numDisabledCommentSections = getNumEmptyArrays(videosComments);
    console.log(
      `${value}: ${numDisabledCommentSections} of disabled comment sections of ${
        videosComments.length
      }.`
    );

    const videoSentimentScores = await Promise.all(
      videosComments.map(videoComments => summarizeVideoComments(videoComments))
    );
    if (videoSentimentScores) {
      console.log(`${value}: Successfully executed sentiment analysis.`);
    } else {
      console.log(`${value}: Failed to execute sentiment analysis`);
    }
    const channelSentimentSum = videoSentimentScores.reduce((a, b) => a + b, 0) / videosComments.length;
    console.log(`${value}: ${channelSentimentSum} sentiment score.`);

    const imgUrl = await getImageUrl(channelId);
    if (imgUrl) {
      console.log(`${value}: Found image.`);
    } else {
      console.log(`${value}: Image not found.`);
    }

    const timestamp = Date.now();
    console.log(`${value}: Timestamp ${ timestamp }`);
    
    const collection = this.mongoClient
      .db("trollhunterz")
      .collection("entries");
    try {
      console.log(`${value}: Pushing to db...`);
      await collection.insertOne({
        _id: {
          channelId,
          timestamp,
        },
        score: channelSentimentSum,
        imgUrl,
        channelTitle,
        bannerUrl,
      });
      console.log(`${value}: Successfully pushed to db.`);
      res.status(200).send({
        score: channelSentimentSum,
        channelId,
        imgUrl,
        channelTitle,
        bannerUrl,
      });
      console.log(`${value}: OK.`);
      return;
    } catch (e) {
      console.log(`${value}: Failed.`);
      res.status(500).send("Database failure.");
      return;
    }
  }
}

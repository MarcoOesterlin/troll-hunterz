import { uri } from "./mongodbConfig.js";
import { MongoClient, ObjectId } from "mongodb";
import axios from "axios";
import { sentimentURI } from "./config";
import youtubeAPIKey from "./youtubeAPIKey";
import { google } from "googleapis";

/**
 * Controller class for the server, handling data fetching from YouTube, sentiment and insertion in the database.
 */

export default class Controller {
  constructor() {
    this.mongoClient = new MongoClient(uri, { useNewUrlParser: true });
    this.mongoClient.connect(() => {
      console.log("Connected to MongoDB cloud.");
    });
    this.getAllEntries = this.getAllEntries.bind(this);
    this.youtubeEntry = this.youtubeEntry.bind(this);
    this.updateDb = this.updateDb.bind(this);
  }

  /**
   * Callback function executed when specified in a request made to the express instance.
   * @param {*Nothing} _req
   * @param {*An entry-object containing top 10 most toxic and polite YouTube channels in the database} res
   */
  getAllEntries(_req, res) {
    const getLatestByChannelId = arraySortedByTimestamp => {
      const channelIdMap = {};
      arraySortedByTimestamp.forEach(entry => {
        channelIdMap[entry.channelId] = entry;
      });
      const uniqueChannelIds = Object.keys(channelIdMap).map(
        key => channelIdMap[key]
      );
      return uniqueChannelIds;
    };

    const sortByScore = entryArray => {
      const compare = (a, b) => {
        if (a.score < b.score) return -1;
        if (a.score > b.score) return 1;
        return 0;
      };
      const sortedEntryArray = entryArray.sort(compare);
      return sortedEntryArray;
    };

    const { mongoClient } = this;
    const collection = mongoClient.db("trollhunterz").collection("entries");
    collection
      .find({})
      .sort({ "_id.timestamp": 1 })
      .toArray((err, mongoDbResponse) => {
        if (err) {
          res.status(500).send("Database failure");
          return;
        }
        const sortedEntries = mongoDbResponse.map(entry => {
          const { _id, score, imgUrl, channelTitle, bannerUrl } = entry;
          const { channelId, timestamp } = _id;
          return {
            score,
            imgUrl,
            channelId,
            timestamp,
            channelTitle,
            bannerUrl
          };
        });
        const uniqueByChannelId = getLatestByChannelId(sortedEntries);
        const sortedByScore = sortByScore(uniqueByChannelId);
        res.status(200).send({
          entries: {
            toxic: sortedByScore.slice(0, 10),
            polite: sortedByScore
              .slice(sortedByScore.length - 10, sortedByScore.length)
              .reverse()
          }
        });
      });
  }

  /**
   * Callback function executed when specified in an request made to the express instance, posting new scores for every YouTube Channel in the database.
   * @param {*Nothing} _req
   * @param {*"Update successful" on success, "Update failure" on failure} res
   */
  updateDb(_req, res) {
    axios
      .get("http://localhost:3001/entries")
      .then(res => {
        const { data } = res;
        const entries = data.entries.toxic.concat(data.entries.polite);
        const channelIds = entries.map(entry => entry.channelId);
        channelIds.forEach(cid => {
          axios.post("http://localhost:3001/entry", { value: cid });
        });
        res.status(201).send("Update successful");
      })
      .catch(() => {
        res.status(500).send("Update failure");
      });
  }

  /**
   * Callback function executed when specified in an request to the express instance. Using the YouTube API it fetches information about specified channel and sends a request to the Sentiment-API
   * containing comments from the channel.
   * @param {*YouTube Channel identifier} req
   * @param {*Object containing BannerURL, Channel Title, Comparativ Score, Image URL, ChannelID of specified Channel} res
   */
  async youtubeEntry(req, res) {
    const service = google.youtube("v3");
    const { value } = req.body;
    if (!value) {
      res.status(400).send("Bad request");
    }

    console.log(`${value}: Analyzing...`);

    const valueToChannelId = async username => {
      const splitLast = (s, splitCharacter) => {
        const stringArray = s.split(splitCharacter);
        return stringArray[stringArray.length - 1];
      };

      const isYoutubeUrl = s => {
        const urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
        const regex = new RegExp(urlRegex);
        return s.match(regex);
      };

      const inputParam = isYoutubeUrl(username)
        ? splitLast(username, "/")
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

    const getImageUrl = async channelId => {
      const parameters = {
        maxResults: "25",
        part: "snippet",
        auth: youtubeAPIKey,
        id: channelId
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
    };

    const getBannerUrl = async channelId => {
      const parameters = {
        maxResults: "25",
        part: "brandingSettings",
        auth: youtubeAPIKey,
        id: channelId
      };
      try {
        const googleResponse = await service.channels.list(parameters);
        const bannerUrl =
          googleResponse.data.items[0].brandingSettings.image.bannerImageUrl;
        return bannerUrl;
      } catch (e) {
        return null;
      }
    };

    const sentimentAnalysis = async stringArray => {
      try {
        const sentimentResponse = await axios.post(
          `${sentimentURI}/analyze`,
          { stringArray },
          {
            maxBodyLength: Infinity
          }
        );
        const { comparative } = sentimentResponse.data;
        return comparative;
      } catch (e) {
        console.log(`Failed to analyze.`);
        console.log(Object.keys(e.request));
        return null;
      }
    };

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
      console.log(`${value}: BannerUrl found.`);
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

    const comments = videosComments.reduce((acc, val) => acc.concat(val), []);
    console.log(`${value}: Number of comments: ${comments.length}`);

    const channelSentimentSum = await sentimentAnalysis(comments);
    if (channelSentimentSum === null || channelSentimentSum === undefined) {
      res.status(500).send('Sentiment server failure');
      return;
    }
    console.log(`${value}: ${channelSentimentSum} sentiment score.`);

    const imgUrl = await getImageUrl(channelId);
    if (imgUrl) {
      console.log(`${value}: Found image.`);
    } else {
      console.log(`${value}: Image not found.`);
    }

    const timestamp = Date.now();
    console.log(`${value}: Timestamp ${timestamp}`);

    const collection = this.mongoClient
      .db("trollhunterz")
      .collection("entries");
    try {
      console.log(`${value}: Pushing to db...`);
      await collection.insertOne({
        _id: {
          channelId,
          timestamp
        },
        score: channelSentimentSum,
        imgUrl,
        channelTitle,
        bannerUrl
      });
      console.log(`${value}: Successfully pushed to db.`);
      res.status(201).send({
        bannerUrl,
        channelId,
        channelTitle,
        imgUrl,
        score: channelSentimentSum
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

import { uri } from './mongodbConfig.js';
import { MongoClient } from 'mongodb';
import axios from 'axios';
import { sentimentURI } from './config';
import youtubeAPIKey from './youtubeAPIKey';
import {google} from 'googleapis';
export default class Controller {
  constructor() {
    this.mongoClient = new MongoClient(
      uri,
      { useNewUrlParser: true },
    );
    this.mongoClient.connect();
    this.getAllEntries = this.getAllEntries.bind(this);
    this.insertEntry = this.insertEntry.bind(this);
    this.youtubeEntry = this.youtubeEntry.bind(this);
  }
  
  getAllEntries(_req, res) {
    res.status(200).send({
      entries: {
        toxic: [{
          imageUrl: 'https://yt3.ggpht.com/a-/AAuE7mAcW198VrHrQqGTGs5EEXx7-Tv-qtFpWky1og=s88-mo-c-c0xffffffff-rj-k-no',
          score: -7.182177975501057,
          username: 'newdramaalert',
        },{
          imageUrl: 'https://yt3.ggpht.com/a-/AAuE7mD7iJevCngNeCAIs0-3F6Dn_L4LtFnVOcpp9w=s88-mo-c-c0xffffffff-rj-k-no',
          score: 43.38968802213832,
          username: 'h3h3productions',
        }],
        polite: [{
          imageUrl: 'https://yt3.ggpht.com/a-/AAuE7mDZhAzA6_0IvivO8I50ZE8Wdw3XQY4v2V-nDA=s88-mo-c-c0xffffffff-rj-k-no',
          score: 69.38185887861775,
          username: 'destinws2',
        }],
      }
    });
    
    // const { mongoClient } = this;
    // const collection = mongoClient.db('trollhunterz').collection('entries');
    // collection.find({}).toArray((err, result) => {
    //   if (err) {
    //     res.status(500).send('Database failure');
    //     return;
    //   }
    //   const entries = result.map(({ _id, comparative, score }) => ({
    //     value: _id.value,
    //     comparative,
    //     score,
    //   })).reverse();
    //   res.status(200).send({ entries });
    // });
  }

  async insertEntry (req, res) {
    const { mongoClient } = this;
    const collection = mongoClient.db('trollhunterz').collection('entries');
    const { value } = req.body;
    if (!value) {
      res.status(400).send('Empty body');
      return;
    }
  
    try {
      const analyzeResponse = await axios.get(`${ sentimentURI }/analyze?value=${ value }`);
      const { comparative, score } = analyzeResponse.data;
      try {
        collection.insertOne({
          _id: {
            value,
          },
          comparative,
          score,
        });
        res.sendStatus(200);
        return;
      } catch (e) {
        res.status(500).send('Database failure.');
        return;
      }
    } catch (err) {
      res.status(500).send(`Failed to analyze.${ process.env.SENTIMENT_URI }`);
      return;
    }
  }

  async youtubeEntry(req, res) {
    const service = google.youtube('v3');
    const { username } = req.body;

    const usernameToChannelId = async username => {
      const parameters = {
        'maxResults': '25',
        'part': 'snippet',
        'auth': youtubeAPIKey,
        'forUsername': username,
      };
      try {
        const googleResponse = await service.channels.list(parameters);
        const channelId = googleResponse.data.items[0].id;
        return channelId;
      } catch (e) {
        try {
          const parameters = {
            'maxResults': '25',
            'part': 'snippet',
            'auth': youtubeAPIKey,
            'channelId': username,
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
        'maxResults': maxResults,
        'part': 'snippet',
        'auth': youtubeAPIKey,
        'type': 'video',
        'channelId': channelId,
        'order': 'viewCount',
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
    }
    
    const retrieveComments = async (videoId, maxResults) => {
      const parameters = {
        'maxResults': maxResults,
        'part': 'snippet',
        'auth': youtubeAPIKey,
        videoId,
        'order': 'relevance',
      };
      try {
        const googleResponse = await service.commentThreads.list(parameters);
        const { data } = googleResponse;
        const { items } = data;
        const comments = items.map(item => item.snippet.topLevelComment.snippet.textOriginal);
        return comments;
      } catch (e) {
        return [];
      }
    }
    
    const summarizeVideoComments = async videoComments => {
      const commentScores = await Promise.all(videoComments.map(async videoComment => {
        const sentimentResponse = await axios.get(
          `${ sentimentURI }/analyze?value=${ encodeURI(videoComment) }`
        );
        return sentimentResponse.data.comparative;
      }));
      const sumScores = commentScores.reduce((a, b) => a + b, 0);
      return sumScores;
    };

    const getImageUrl = async username => {
      const parameters = {
        'maxResults': '25',
        'part': 'snippet',
        'auth': youtubeAPIKey,
        'forUsername': username,
      };
      try {
        const googleResponse = await service.channels.list(parameters);
        const imageUrl = googleResponse.data.items[0].snippet.thumbnails.default.url;
        console.log(imageUrl);
        return imageUrl;
      } catch (e) {
        console.log('Image not found');
        return null;
      }
    }
    
    const channelId = await usernameToChannelId(username);
    if (!channelId) {
      res.status(400).send('Channel not found.');
      return;
    }
    const videoIds = await channelIdToVideoIds(channelId, 10);
    const videosComments = await Promise.all(
      videoIds.map(videoId => retrieveComments(videoId, 100)),
    );
    const videoSentimentScores = await Promise.all(
      videosComments.map(videoComments => summarizeVideoComments(videoComments),
    ));
    const channelSentimentSum = videoSentimentScores.reduce((a, b) => a + b, 0);
    const imgUrl = await getImageUrl(username);
    
    const timestamp = Date.now();
    
    const collection = mongoClient.db('trollhunterz').collection('entries');
    try {
      await collection.insertOne({
        _id: {
          username,
          timestamp,
        },
        score: channelSentimentSum,
        imgUrl,
      });
      res.status(200).send({
        score: channelSentimentSum,
        username: username,
        imgUrl: imgUrl,
      });
      return;
    } catch (e) {
      res.status(500).send('Database failure.');
      return;
    }
  }
}

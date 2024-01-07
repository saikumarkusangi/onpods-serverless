import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { Router } from 'express';
import dotenv from 'dotenv';
import { podcastmodel } from '../models/podcastModel.js'
import userModel from '../models/userModel.js';

const router = Router();

dotenv.config();

initializeApp({
  credential: applicationDefault(),
  projectId: 'onpods',
});

const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};
export default router.post('/podcast/send', async (req, res) => {
    try {
      const { title, body, poster, podcastId } = req.body;

      const podcast = await podcastmodel.findById(podcastId);

      if (!podcast) {
        return res.status(400).json({
          status: 'fail',
          message: 'Podcast not found',
        });
      }

      const followers = await userModel.find({ _id: { $in: podcast.followers } });

      const dynamicTokens = followers.map(follower => follower.fcmToken).filter(Boolean);

      const messaging = getMessaging();
      const chunkedTokens = chunkArray(dynamicTokens, 500);

      const sendPromises = [];

      for (const tokensChunk of chunkedTokens) {
        const messages = tokensChunk.map(token => ({
          notification: {
            title: `🎙️New Episode Alert: ${title}🎙️`,
            body: `Be the first to listen to ${body}🎧 `,
          },
          data: {
            poster: poster || '',
          },
          token: token,
        }));

        sendPromises.push(...messages.map(message => messaging.send(message)));
      }

      await Promise.all(sendPromises);

      res.status(200).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'fail',
        message: error.message,
      });
    }
  });

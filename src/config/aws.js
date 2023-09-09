import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();


AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});


export default AWS;


import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'onpods',
    metadata(req, file, cb) {

      cb(null, { fieldName: file.fieldname });
    },
    key(req, file, cb) {

      cb(null, `quotes/${Date.now().toString()}-${file.originalname}`);
    },
  }),
});


const deleteImageFromS3 = async (objectKey) => {
  try {
    const params = {
      Bucket: 'onpods',
      Key: `quotes/${objectKey}`,
    };

    s3.deleteObject(params, function (err, data) {
      if (err) console.log(err, err.stack);
      else {
        console.log('Delete Success', data);
       
      }
    });
    return true
  } catch (error) {
    console.error(`Error deleting image from S3: ${error}`);
  }
};


export { upload, deleteImageFromS3 };

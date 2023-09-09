const s3 = require('../config/aws');

function uploadPodcastFile(fileBuffer, fileName) {
  const params = {
    Bucket: 'your-s3-bucket-name',
    Key: fileName,
    Body: fileBuffer,
  };

  return s3.upload(params).promise();
}



module.exports = {
  uploadPodcastFile,
};

const {deferConfig} = require('config/defer');

module.exports = {
  dev: true,

  PORT: process.env.PORT || 3000,

  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/pwad',

  HOST: deferConfig(config => `localhost:${config.PORT}`),
  HOST_URL: deferConfig(config => `http://localhost:${config.PORT}`),
  GRAPHQL_URI: deferConfig(config => `http://localhost:${config.PORT}/graphql`),

  API_CLIENT_URL: deferConfig(config => `http://localhost:${config.PORT}`),
  API_SERVER_URL: deferConfig(config => `http://localhost:${config.PORT}`),

  API_TOKEN_SECRET: 'API_TOKEN_SECRET',
  SESSION_COOKIE_SECRET: 'SESSION_COOKIE_SECRET',

  S3_KEY: process.env.S3_KEY,
  S3_SECRET: process.env.S3_SECRET,
  S3_BUCKET: process.env.S3_BUCKET,
  S3_REGION: process.env.S3_REGION,
  CLOUDFRONT_PUBLIC_URL: process.env.CLOUDFRONT_PUBLIC_URL,

  GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET
};

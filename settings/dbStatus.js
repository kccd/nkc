const mongo = require('./mongo');
const logger = require('../nkcModules/logger');
const redis = require('./redis');
const elasticSearch = require('./elasticSearch');
const func = {};
func.mongo = () => {
  return mongo().catch((err) => {
    logger.error(err);
    throw new Error(`MongoDB connection error`);
  });
};

func.redis = () => {
  return new Promise((resolve, reject) => {
    const redisClient = redis();
    redisClient.on('error', (err) => {
      logger.error(err);
      reject(new Error(`Redis connection error`));
    });
    redisClient.set('ping', 1, () => {
      resolve();
    });
  });
};

func.elasticSearch = () => {
  return new Promise((resolve, reject) => {
    const elasticSearchClient = elasticSearch();
    elasticSearchClient.ping(
      {
        requestTimeout: 3000,
      },
      function (err) {
        if (err) {
          logger.error(err);
          return reject(new Error(`ElasticSearch connection error`));
        }
        resolve();
      },
    );
  });
};

func.database = async () => {
  await func.mongo();
  await func.redis();
  await func.elasticSearch();
};

module.exports = func;

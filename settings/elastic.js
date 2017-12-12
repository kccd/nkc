const ES = require('elasticsearch');

const ESSettings = {
  host: 'localhost:9200',
  postIndex: 'posts',
  userIndex: 'users',
  ChineseAnalyzer: 'ik_max_word',
};

const client = new ES.Client({
  host: ESSettings.host
});

module.exports = {...ESSettings, client};
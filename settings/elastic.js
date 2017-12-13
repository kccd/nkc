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

const es = {};

es.indexPost = function(post) {
  const {c, t, pid} = post;
};

es.indexThread = function(thread) {

};

es.indexUser = function(user) {

};

module.exports = {...ESSettings, client};
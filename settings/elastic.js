const ES = require('elasticsearch');


const host = 'localhost:9200',
  postIndex = 'posts',
  userIndex = 'users',
  ChineseAnalyzer = 'ik_max_word';

const ESSettings = {
  host,
  postIndex,
  userIndex,
  ChineseAnalyzer
};

const client = new ES.Client({
  host: ESSettings.host
});

const es = {};
es.client = client;

es.indexPost = function(post) {
  const {c, t, pid, credits, recUsers} = post;
  const esData = {
    c,
    t,
    credits: credits.length,
    recUsers: recUsers.length
  };
  return client.create({
    index: postIndex,
    type: postIndex,
    id: pid,
    body: esData
  })
};

es.indexUser = function(user) {
  const {
    username,
    score,
    uid,
    description,
    recCount,
    subs
  } = user;
  const esData = {
    username,
    score,
    description,
    recCount,
    subs
  };
  return client.create({
    index: userIndex,
    type: userIndex,
    id: uid,
    body: esData
  })
};

es.updatePost = function(id, properties) {
  return client.update({
    index: postIndex,
    type: postIndex,
    id,
    body: {
      doc: properties
    }
  })
};

es.updateUser = function(id, properties) {
  return client.update({
    index: userIndex,
    type: userIndex,
    id,
    body: {
      doc: properties
    }
  })
};

es.ESSettings = ESSettings;

es.searchUser = function(str, page, perpage) {
  return client.search({
    index: userIndex,
    type: userIndex,
    body: {
      from: page * perpage,
      size: perpage,
      query: {
        function_score: {
          query: {
            dis_max: {
              tie_breaker: 0.3,
              queries: [
                simpleQuery('username', str, '50%', 3),
                simpleQuery('description', str, '90%', 1),
              ]
            }
          },
          score_mode: 'sum',
          functions: [
            {
              field_value_factor: {
                field: 'subs',
                factor: 0.03,
                modifier: 'none',
                missing: 0
              }
            },
            {
              field_value_factor: {
                field: 'recCount',
                factor: 0.03,
                modifier: 'none',
                missing: 0
              }
            },
            {
              field_value_factor: {
                field: 'score',
                factor: 0.3,
                modifier: 'none',
                missing: 0
              }
            }
          ],
          boost_mode: 'sum'
        }
      },
      highlight: {
        pre_tags: ['<span style="background-color:red;">'],
        post_tags: ['</span>'],
        fields: {
          description: {},
          username: {}
        }
      }
    }
  })
};

es.searchPost = function(str, page, perpage) {
  return client.search({
    index: postIndex,
    type: postIndex,
    body: {
      from: page * perpage,
      size: perpage,
      query: {
        function_score: {
          query: {
            dis_max: {
              tie_breaker: 0.3,
              queries: [
                simpleQuery('t', str, '50%', 3),
                simpleQuery('c', str, '90%', 1),
              ]
            }
          },
          score_mode: 'sum',
          functions: [
            {
              field_value_factor: {
                field: 'recUsers',
                factor: 0.03,
                modifier: 'none',
                missing: 0
              }
            },
            {
              field_value_factor: {
                field: 'credits',
                factor: 0.03,
                modifier: 'none',
                missing: 0
              }
            }
          ],
          boost_mode: 'sum'
        }
      },
      highlight: {
        pre_tags: ['<span style="background-color:red;">'],
        post_tags: ['</span>'],
        fields: {
          t: {},
          c: {}
        }
      }
    }
  })
};

function simpleQuery(field, query, minimum_should_match = '25%', boost = 1) {
  //generate queries with different term weight
  return {
    simple_query_string: {
      fields: [field],
      query,
      boost: boost || 1,
      default_operator: 'and',
      minimum_should_match
    }
  }
}

module.exports = es;
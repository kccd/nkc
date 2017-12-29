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
    credits: credits? credits.length: 0,
    recUsers: recUsers? recUsers.length: 0
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

es.updateUser = function(user) {
  const {uid, description, username} = user;
  console.log(description)
  console.log(username)
  return client.update({
    index: userIndex,
    type: userIndex,
    id: uid,
    body: {
      doc: {
        description,
        username: username
      }
    }
  })
};

es.updatePost = function(post) {
  const {pid, t, c} = post;
  return client.update({
    index: postIndex,
    type: postIndex,
    id: pid,
    body: {
      doc: {
        t,
        c
      }
    }
  })
};

es.ESSettings = ESSettings;

es.searchUser = function(str, page, perpage) {
  if(!str)
    return {hits: {hits: []}};
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
        pre_tags: ['<span style="background-color: orange;">'],
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
  if(!str)
    return {hits: {hits: []}};
  return client.get({
    index: postIndex,
    type: postIndex,
    id: str
  })
    .then(post => {
      post._source._id = post._id;
      return {hits: {hits: [post._source]}}
    })
    .catch(e => {
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
            pre_tags: ['<span style="color: orange;">'],
            post_tags: ['</span>'],
            fields: {
              t: {},
            }
          }
        }
      })
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
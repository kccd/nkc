const settings = require('./settings');
// initialize the elasticsearch client
const {elastic} = settings;
const {postIndex, ChineseAnalyzer, userIndex, client} = elastic;

module.exports = async function() {
  let posts, users;
  try {
    posts = await client.indices.get({
      index: postIndex
    })
  } catch(e) {
    await client.indices.create({
      index: postIndex,
      body: {
        mappings: {
          posts: {
            properties: {
              // make both p.c(content) and p.t(title) searchable.
              // the properties obj contains one or many properties in a post object.
              c: {
                type: 'text',
                analyzer: ChineseAnalyzer,
                search_analyzer: ChineseAnalyzer
                // The elasticsearch-analysis-ik
                // See: https://github.com/medcl/elasticsearch-analysis-ik
              },
              t: {
                type: 'text',
                analyzer: ChineseAnalyzer,
                search_analyzer: ChineseAnalyzer
              },
              pid: {
                type: 'text',
                // pid is a exact value
              }
            }
          }
        }
      }
    });
  }
  try {
    users = await client.indices.get({index: userIndex})
  } catch(e) {
    await client.indices.create({
      index: userIndex,
      body: {
        mappings: {
          users: {
            properties: {
              username: {
                type: 'text',
                analyzer: ChineseAnalyzer,
                search_analyzer: ChineseAnalyzer,
              },
              description: {
                type: 'text',
                analyzer: ChineseAnalyzer,
                search_analyzer: ChineseAnalyzer
              }
            }
          }
        }
      }
    });
  }
  // es-ready;
};
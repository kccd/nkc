const http = require('http');
const https = require('https');
const ES = require('elasticsearch');

const app = require('./app');
const settings = require('./settings');
const {useHttps, elastic} = settings;
const serverSettings = settings.server;
const listenAddr = '0.0.0.0';
const {host, searchIndex, ChineseAnalyzer} = elastic;
const client = new ES.Client({
  host,
});

let server;
let redirectServer;

if(useHttps) {
  const httpsOptions = settings.httpsOptions();
  server = https.Server(httpsOptions, app)
    .listen(
      serverSettings.httpsPort,
      listenAddr,
      () => console.log(`${serverSettings.name} listening on ${listenAddr}:${serverSettings.httpsPort}`.green)
    );

  redirectServer = http.createServer((req, res) => {
    const host = req.headers['host'];
    res.writeHead(301, {
      'Location': 'https://' + host + req.url
    });
    res.end();
  })
    .listen(serverSettings.port, listenAddr);
} else {
  server = http.createServer(app).listen(
    serverSettings.port,
    listenAddr,
    () => console.log(`${serverSettings.name} listening on ${listenAddr}:${serverSettings.port}`.green)
  );
}

client.indices.getMapping({
  index: searchIndex
})
  .then(mp => {
    const {analyzer} = mp[searchIndex].mappings.posts.properties.c;
    if(!analyzer || analyzer !== 'ik_max_word')
      return Promise.all([
        client.indices.putMapping({
          index: searchIndex,
          updateAllTypes: false,
          type: 'posts', // build mapping for the post collection
          body: {
            properties: {
              // make both p.c(content) and p.t(title) searchable.
              // the properties obj contains one or many properties in a post object.
              c: {
                type: 'string',
                analyzer: ChineseAnalyzer,
                search_analyzer: ChineseAnalyzer
                // The elasticsearch-analysis-ik
                // See: https://github.com/medcl/elasticsearch-analysis-ik
              },
              t: {
                type: 'string',
                analyzer: ChineseAnalyzer,
                search_analyzer: ChineseAnalyzer
              },
              pid: {
                type: 'string',
                index: 'not_analyzed'
                // pid is a exact value
              }
            }
          }
        }),
        client.indices.putMapping({
          index: searchIndex,
          updateAllTypes: false,
          type: 'users',
          body: {
            properties: {
              username: {
                type: 'string',
                analyzer: ChineseAnalyzer,
                search_analyzer: ChineseAnalyzer,
              },
              description: {
                type: 'string',
                analyzer: ChineseAnalyzer,
                search_analyzer: ChineseAnalyzer
              }
            }
          }
        })
      ])
  })
  .then(() => console.log('ElasticSearch is ready...'))
  .catch(e => console.error(`error occured when initialize the ElasticSearch.\n${e.stack}`));


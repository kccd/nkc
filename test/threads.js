const api = require('./nkcAPI');
const {threads, users} = require('./config');

describe(`文章`, function() {
  for(const thread of threads) {
    describe(`文章 ${thread.tid}`, function() {
      for(const user of users) {
        describe(`用户「${user.username}-${user.uid}」`, function () {
          for(let i = 0; i < 2; i++) {
            it(`阅读 page=${i}`, function(done) {
              api(`/t/${thread.tid}?page=${i}`, 'get', 'html', user.type)
                .expect(200, done)
            });
          }
        });
      }
    });
  }
});

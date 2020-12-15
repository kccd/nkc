const api = require('./nkcAPI.js');
const {users} = require('./config.js');

describe(`测试用户名片`, function() {
  for(const user of users) {
    describe(`用户「${user.username}-${user.uid}」`, function() {
      for(const u of users) {
        if(!u.uid) continue;
        it(`访问 「${u.username}-${u.uid}」`, function(done) {
          api(`/u/${u.uid}`, 'get', 'html', user.type)
            .expect(200, done);
        });
      }
    });
  }
});

const api = require('nkcAPI');
const {
  users,
} = require('./config');

describe(`测试编辑器发表文章`, function() {
  describe(`打开编辑器页面`, function() {
    for(const user of users) {
      it(`用户「${user.username}-${user.uid}」`, function() {
        api(`/editor`, 'GET', 'html', user.type)
      });
    }
  });
});

const api = require('./nkcAPI');
const {users} = require('./config');

const pages = [
  {
    name: '主页',
    path: '/?t=home'
  },
  {
    name: '关注页',
    path: '/?t=subscribe'
  },
  {
    name: '最新页',
    path: '/?t=latest'
  },
  {
    name: '专业地图',
    path: '/f'
  },
  {
    name: '短消息',
    path: '/message'
  }
];

describe(`测试首页`, function() {
  for(const user of users) {
    describe(`用户「${user.username}-${user.uid}」`, function() {
      for(const page of pages) {
        it(page.name, function(done) {
          let _api = api(page.path, 'get', 'html', user.type);
          let status = 200;
          if(page.path === '/message') {
            _api = _api.set('FROM', '');
            if(!user.uid) {
              status = 403;
            }
          }
          _api.expect(status, done);
        });
      }
    });
  }
});

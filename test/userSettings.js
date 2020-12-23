const api = require('./nkcAPI');
const {users} = require('./config');

function getPages(uid) {
  const basePath = `/u/${uid}/settings`;
  return [
    {
      name: '基本资料',
      path: basePath + '/info'
    },
    {
      name: '详细资料',
      path: basePath + '/resume'
    },
    {
      name: '交易信息',
      path: basePath + '/transaction'
    },
    {
      name: '账号安全',
      path: basePath + '/security'
    },
    {
      name: '身份认证',
      path: basePath + '/verify'
    },
    {
      name: '偏好设置',
      path: basePath + '/apps'
    }
  ]
}

describe(`测试用户设置`, function() {
  for(const user of users) {
    if(!user.uid) continue;
    describe(`用户「${user.username}-${user.uid}」`, function() {
      for(const page of getPages(user.uid)) {
        it(`访问 ${page.name}`, function(done) {
          api(page.path, 'get', 'html', user.type)
            .expect(200, done)
        });
      }
    })
  }
});

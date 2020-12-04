const api = require('./nkcAPI');
const {forums, users} = require('./config');

function getForumsPage(fid) {
  return [
    {
      name: '首页',
      path: `/f/${fid}/home`
    },
    {
      name: '最新',
      path: `/f/${fid}`
    },
    {
      name: '关注的人',
      path: `/f/${fid}/followers`
    },
    {
      name: '今日来访',
      path: `/f/${fid}/visitors`,
    },
    {
      name: '文库',
      path: `/f/${fid}/library`
    }
  ]
}

describe('测试专业', function() {
  for(const forum of forums) {
    describe(`专业「${forum.fid}-${forum.displayName}」`, function() {
      for(const u of users) {
        describe(`用户「${u.username}-${u.uid}」`, function() {
          for(const fp of getForumsPage(forum.fid)) {
            it(`访问 ${fp.name}`, function(done) {
              api(`/f/${forum.fid}`, 'get', 'html', u.type)
                .expect(200, done);
            });
          }
          const status = u.type === 'visitor'? 403:200;
          it(`关注专业`, function(done) {
            api(`/f/${forum.fid}/subscribe`, 'post', 'json', u.type)
              .expect(status, done);
          });
          it(`取关专业`, function(done) {
            api(`/f/${forum.fid}/subscribe`, 'delete', 'json', u.type)
              .expect(status, done);
          });
        })
      }
    });
  }
});

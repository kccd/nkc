const api = require('./nkcAPI');
const {users} = require('./config');

function getPages(uid) {
  const basePath = `/u/${uid}/profile`;
  const subPath = basePath + '/subscribe';
  return [
    {
      name: '数据概览',
      path: basePath
    },
    {
      name: '我的文章',
      path: basePath + '/thread'
    },
    {
      name: '我的回复',
      path: basePath + '/post'
    },
    {
      name: '我的草稿',
      path: basePath + '/draft'
    },
    {
      name: '我的笔记',
      path: basePath + '/note'
    },
    {
      name: '关注的用户',
      path: subPath + '/user'
    },
    {
      name: '关注的专业',
      path: subPath + '/forum'
    },
    {
      name: '关注的专栏',
      path: subPath + '/column'
    },
    {
      name: '关注的文章',
      path: subPath + '/thread'
    },
    {
      name: '收藏的文章',
      path: subPath + '/collection'
    },
    {
      name: '我的粉丝',
      path: basePath + '/follower'
    },
    {
      name: '黑名单',
      path: basePath + '/blacklist'
    }
  ]
}

describe('测试用户个人中心', function() {
  for(const user of users) {
    if(!user.uid) continue;
    describe(`用户「${user.username}-${user.uid}」`, function() {
      for(const page of getPages(user.uid)) {
        it(`访问 ${page.name}`, function(done) {
          api(page.path, 'get', 'html', user.type)
            .expect(200, done);
        });
      }
    });
  }
});

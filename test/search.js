const api = require('./nkcAPI');
const {users, searchKeywords} = require('./config');

const t = [
  {
    name: '全部',
    type: ''
  },
  {
    name: '文章',
    type: 'thread'
  },
  {
    name: '回复',
    type: 'post'
  },
  {
    name: '专栏',
    type: 'column'
  },
  {
    name: '用户',
    type: 'user'
  },
  {
    name: '文件',
    type: 'resource'
  }
];

describe(`测试搜索`, function() {
  for(const user of users) {
    describe(`用户「${user.username}-${user.uid}」`, function() {
      for(const k of searchKeywords) {
        describe(`搜索关键字「${k}」`, function() {
          for(const _t of t) {
            it(`类型「${_t.name}」`, function(done) {
              let url = `/search?c=${k}`;
              if(_t.type) {
                url += `&t=${_t.type}`;
              }
              api(url, 'GET', 'html', user.type)
                .expect(200, done)
            })
          }
        });
      }
    });
  }
});

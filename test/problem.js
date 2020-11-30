const api = require('./nkcAPI');
const {users} = require('./config');

describe(`报告问题`, function() {
  for(const user of users) {
    describe(`用户「${user.username}-${user.uid}」`, function() {
      it(`打开报告问题页面`, function(done) {
        api(`/problem/add`, 'get', 'html', user.type)
          .expect(200, done);
      });
      it(`提交问题内容（未填写标题）`, function(done) {
        api('/problem/add', 'post', 'json', user.type)
          .send({
            t: '',
            c: 'asdfasdfa'
          })
          .expect(400, done)
      });
      it(`提交问题内容（未填写内容）`, function(done) {
        api('/problem/add', 'post', 'json', user.type)
          .send({
            t: 'asdfasdf',
            c: ''
          })
          .expect(400, done)
      });
      it(`提交问题内容（提交预期数据）`, function(done) {
        api(`/problem/add`, 'post', 'json', user.type)
          .send({
            t: `测试脚本报告问题-${Date.now()}`,
            c: `当前数据来自测试脚本，创建日期：${Date.now()}`
          })
          .expect(200, done);
      })
    })
  }
})

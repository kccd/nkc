const api = require('./nkcAPI');
describe('用户注册', function() {
  it('打开注册页面', function(done) {
    api('/register', 'GET')
      .set('Accept', 'text/html')
      .expect(200, done);
  });
  it('获取图形验证码', function(done) {
    api('/verifications', 'GET')
      .set('Accept', 'Application/json')
      .expect(200, done);
  });
  describe('检查用户名和密码', function() {
    it('用户名冲突报错', function(done) {
      api('/register/check', 'POST')
        .send({
          username: 'spark',
          password: '00000000q'
        })
        .expect(400, done);
    });
    it('密码长度报错', function(done) {
      api('/register/check', 'POST')
        .send({
          username: 'registerTest',
          password: '000'
        })
        .expect(400, done);
    });
    it('提交预期数据', function(done) {
      api('/register/check', 'POST')
        .send({
          username: 'registerTest',
          password: '00000000q'
        })
        .expect(200, done);
    });
  });
})

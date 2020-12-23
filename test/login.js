const api = require('./nkcAPI');
const dev = require('./config').users[0];
describe('用户登录', function() {
  describe('用户名+密码', function() {
    it(`用户名为空`, function(done) {
      api('/login', 'post', 'json', '')
        .send({
          username: '',
          password: dev.password
        })
        .expect(400, done);
    });
    it(`密码为空`, function(done) {
      api(`/login`, 'post', 'json')
        .send({
          username: dev.username,
          password: ''
        })
        .expect(400, done)
    });
    it(`用户名错误`, function(done) {
      api('/login', 'post', 'json')
        .send({
          username: 'login&&test',
          password: dev.password
        })
        .expect(400, done)
    });
    it(`密码错误`, function(done) {
      api('/login', 'post', 'json')
        .send({
          username: dev.username,
          password: '000000000'
        })
        .expect(400, done)
    });
    it(`正常登录`, function(done) {
      api('/login', 'post', 'json')
        .send({
          username: dev.username,
          password: dev.password
        })
        .expect(200, done)
    });
  });
  describe(`手机号+密码`, function() {
    it(`未提供国际区号`, function(done) {
      api('/login', 'post', 'json')
        .send({
          nationCode: '',
          mobile: dev.mobile,
          password: dev.password,
          loginType: 'mobile'
        })
        .expect(400, done);
    });
    it(`未提供手机号`, function(done) {
      api(`/login`, 'post', 'json')
        .send({
          nationCode: '86',
          mobile: '',
          password: dev.password,
          loginType: 'mobile'
        })
        .expect(400, done)
    });
    it(`未提供密码`, function(done) {
      api('/login', 'post', 'json')
        .send({
          nationCode: '86',
          mobile: dev.mobile,
          password: '',
          loginType: 'mobile'
        })
        .expect(400, done);
    });
    it(`正常登录`, function(done) {
      api('/login', 'post', 'json')
        .send({
          nationCode: "86",
          mobile: dev.mobile,
          password: dev.password,
          loginType: 'mobile'
        })
        .expect(200, done);
    })
  });
  describe('手机号+短信验证码', function() {
    it(`未提供国际区号`, function(done) {
      api('/login', 'post', 'json')
        .send({
          nationCode: '',
          mobile: dev.mobile,
          code: '2342',
          loginType: 'code'
        })
        .expect(400, done)
    });
    it(`未提供手机号`, function(done) {
      api('/login', 'post', 'json')
        .send({
          nationCode: '86',
          mobile: '',
          code: '2342',
          loginType: 'code'
        })
        .expect(400, done)
    });
    it(`未提供短信验证码`, function(done) {
      api('/login', 'post', 'json')
        .send({
          nationCode: '86',
          mobile: dev.mobile,
          code: '',
          loginType: 'code'
        })
        .expect(400, done)
    });
  });
});

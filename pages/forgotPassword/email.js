var app = new Vue({
  el: "#app",
  data: {
    username: '',
    email: '',
    code: '',
    password: '',
    password2: '',
    reg: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
    inputPassword: false,
    time: 0
  },
  methods: {
    countdown: function() {
      if(this.time > 0) {
        this.time --;
      }
      setTimeout(function() {
        app.countdown();
      }, 1000);
    },
    sendEmail: function() {
      var self = this;
      return Promise.resolve()
        .then(function() {
          if(!self.username) throw new Error('请输入用户名');
          if(!self.email) throw new Error('请输入邮箱地址');
          NKC.methods.checkData.checkEmail(self.email);
          return nkcAPI('/forgotPassword/email','POST',{
            username: self.username,
            email: self.email
          })
        })
        .then(function() {
          screenTopAlert('邮件发送成功，请查收');
          app.time = 120;
          app.inputPassword = true;
          app.countdown();
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
    },
    save: function() {
      var self = this;
      return Promise.resolve()
        .then(function() {
          if(!self.username) throw new Error('请输入用户名');
          if(!self.email) throw new Error('请输入邮箱地址');
          NKC.methods.checkData.checkEmail(self.email);
          if(!self.code) throw new Error('请输入邮件验证码');
          if(!self.password) throw new Error('请输入新密码');
          if(self.password !== self.password2) throw new Error('两次输入的密码不一致');
          return nkcAPI('/forgotPassword/email', 'PUT', {
            username: self.username,
            email: self.email,
            code: self.code,
            password: self.password
          });
        })
        .then(function() {
          screenTopAlert('密码修改成功，正在前往登录页面');
          setTimeout(function() {
            openToNewLocation("/login");
          }, 1000)
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
    }
  }
});

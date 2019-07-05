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
      if(!this.username) return screenTopWarning('请输入用户名');
      if(!this.email) return screenTopWarning('请输入邮箱地址');
      if(!this.reg.test(this.email)) return screenTopWarning('邮箱格式不正确');
      nkcAPI('/forgotPassword/email','POST',{
        username: this.username,
        email: this.email
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
      if(!this.username) return screenTopWarning('请输入用户名');
      if(!this.email) return screenTopWarning('请输入邮箱地址');
      if(!this.reg.test(this.email)) return screenTopWarning('邮箱格式不正确');
      if(!this.code) return screenTopWarning('请输入邮件验证码');
      if(!this.password) return screenTopWarning('请输入新密码');
      if(this.password !== this.password2) return screenTopWarning('两次输入的密码不一致');
      nkcAPI('/forgotPassword/email', 'PATCH', {
        username: this.username,
        email: this.email,
        code: this.code,
        password: this.password
      })
        .then(function() {
          screenTopAlert('密码修改成功，正在前往登录页面');
          setTimeout(function() {
            // window.location.href = '/login';
            openToNewLocation("/login");
          }, 1000)
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
    }
  }
});
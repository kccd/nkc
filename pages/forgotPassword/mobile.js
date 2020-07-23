var app = new Vue({
  el: "#app",
  data: {
    nationCodes: nationCodes,
    username: '',
    mobile: '',
    nationCode: 86,
    code: '',
    password: '',
    password2: '',
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
    sendMessage: function() {
      if(!this.nationCode) return screenTopWarning('请选择国际区号');
      if(!this.username) return screenTopWarning('请输入用户名');
      if(!this.mobile) return screenTopWarning('请输入手机号码');
      nkcAPI('/sendMessage/getback', 'POST', {
        username: this.username,
        mobile: this.mobile,
        nationCode: this.nationCode
      })
        .then(function() {
          screenTopAlert('验证码发送成功，请查收');
          app.time = 120;
          app.inputPassword = true;
          app.countdown();
        })
        .catch(function(data) {
           screenTopWarning(data.error || data);
        })
    },
    save: function() {
      if(!this.nationCode) return screenTopWarning('请选择国际区号');
      if(!this.username) return screenTopWarning('请输入用户名');
      if(!this.mobile) return screenTopWarning('请输入手机号码');
      if(!this.code) return screenTopWarning('请输入验证码');
      if(!this.password) return screenTopWarning('请输入新密码');
      if(this.password !== this.password2) return screenTopWarning('两次输入的密码不一致');
      nkcAPI('/forgotPassword/mobile', 'PUT', {
        nationCode: this.nationCode,
        username: this.username,
        mobile: this.mobile,
        password: this.password,
        code: this.code,
      })
        .then(function() {
          screenTopAlert('修改成功');
          setTimeout(function() {
            // window.location.href = '/login';
            openToNewLocation("/");
          }, 1000)
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
    }
  }
});

var app = new Vue({
  el: '#app',
  data: {
    emailSettings: {},
    test: {
      name: 'bindEmail',
      content: "",
      email: ''
    }
  },
  methods: {
    tran: function(w) {
      switch (w) {
        case 'bindEmail': return '绑定邮箱';
        case 'getback': return '找回密码';
        case 'changeEmail': return '更换邮箱';
        case "destroy": return "账号注销";
      }
    },
    testSendEmail: function() {
      sweetQuestion("确定要发送邮件验证码？")
        .then(function() {
          return nkcAPI('/e/settings/email/test', 'POST', app.test);
        })
        .then(function() {
          screenTopAlert('测试邮件发送成功');
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })

    },
    save: function() {
      nkcAPI('/e/settings/email', 'PATCH', {emailSettings: this.emailSettings})
        .then(function() {
          screenTopAlert('保存成功');
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
    }
  },
  mounted: function() {
    nkcAPI('/e/settings/email?t=' + Date.now(), 'GET', {})
      .then(function(data) {
        app.emailSettings = data.emailSettings;
      })
      .catch(function(data) {
        screenTopWarning(data.error || data);
      })
  }
});
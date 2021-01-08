function submitPassword(uid) {
  var obj = {
    oldPassword: $('#oldPassword').val(),
    password: $('#password').val(),
    password2: $('#password2').val()
  };
  if(obj.oldPassword === '') {
    return sweetError('请输入旧密码');
  }
  if(obj.password === '') {
    return sweetError('请输入新密码');
  }
  if(obj.password !== obj.password2) {
    return sweetError('两次输入的新密码不一致');
  }
  delete obj.password2;
  nkcAPI('/u/'+uid+'/settings/password', 'PUT', obj)
    .then(function() {
      sweetSuccess('修改成功');
    })
    .catch(function(data) {
      sweetError(data.error);
    })
}



var nationCode = '86';
//选择国际区号
function chooseCountryNum(num){
  nationCode = parseInt(num);
}

function changeNumber() {
  $('#btnChangeNumber').hide();
  $('#inputDiv').show();
}



var email={
  'qq.com': 'http://mail.qq.com',
  'gmail.com': 'http://mail.google.com',
  'sina.com': 'http://mail.sina.com.cn',
  '163.com': 'http://mail.163.com',
  '126.com': 'http://mail.126.com',
  'yeah.net': 'http://www.yeah.net/',
  'sohu.com': 'http://mail.sohu.com/',
  'tom.com': 'http://mail.tom.com/',
  'sogou.com': 'http://mail.sogou.com/',
  '139.com': 'http://mail.10086.cn/',
  'hotmail.com': 'http://www.hotmail.com',
  'live.com': 'http://login.live.com/',
  'live.cn': 'http://login.live.cn/',
  'live.com.cn': 'http://login.live.com.cn',
  '189.com': 'http://webmail16.189.cn/webmail/',
  'yahoo.com.cn': 'http://mail.cn.yahoo.com/',
  'yahoo.cn': 'http://mail.cn.yahoo.com/',
  'eyou.com': 'http://www.eyou.com/',
  '21cn.com': 'http://mail.21cn.com/',
  '188.com': 'http://www.188.com/',
  'foxmail.com': 'http://www.foxmail.com'
};

function sendBindEmail(uid) {
  var obj = {
    email: $('#email').val(),
    operation: 'bindEmail'
  };
  if(obj.email === '') {
    return sweetError('请输入邮箱地址');
  }
  obj.email = obj.email.trim();
  nkcAPI('/u/'+uid+'/settings/email', 'POST', obj)
    .then(function() {
      var url = obj.email.split('@')[1];
      var href = email[url] || '###';
      var aHTML = $('<a href="'+href+'" target="_blank">'+obj.email+'</a>');
      $('#emailInfo').html(aHTML);
      $('#bindEmailDiv').show();
      $('input[name="email"]').val(obj.email);
    })
    .catch(function(data) {
      sweetError(data.error || data);
    })
}

function verifyOldEmail(uid, oldEmail) {
  var obj = {
    operation: 'verifyOldEmail'
  };
  nkcAPI('/u/'+uid+'/settings/email', 'POST', obj)
    .then(function() {
      $('#changeBtn').text('重新发送邮件');
      var url = oldEmail.split('@')[1];
      var href = email[url] || '###';
      var aHTML = $('<a href="'+href+'" target="_blank">'+oldEmail+'</a>');
      $('#oldEmail').html(aHTML);
      $('#verifyOldEmailDiv').show();
    })
    .catch(function(data) {
      sweetError(data.error || data);
    })
}

function sendNewEmail(uid) {
  var obj = {
    oldToken: $('#oldToken').val(),
    email: $('#email').val(),
    operation: 'verifyNewEmail'
  };
  if(obj.email === '') {
    return sweetError('请输入新邮箱地址');
  }
  obj.email = obj.email.trim();
  nkcAPI('/u/'+uid+'/settings/email', 'POST', obj)
    .then(function() {
      var url = obj.email.split('@')[1];
      var href = email[url] || '###';
      var aHTML = $('<a href="'+href+'" target="_blank">'+obj.email+'</a>');
      $('#newEmail').html(aHTML);
      $('input[name="email"]').val(obj.email);
      $('#verifyNewEmailDiv').show();
    })
    .catch(function(data) {
      sweetError(data.error || data);
    })
}


function displayChangeDiv() {
  $('#changeSwitch').hide();
  $('#changeBtnDiv').show();
}
var data = NKC.methods.getDataById("data");

var app = new Vue({
  el: "#app",
  data: {
    email: data.email,
    type: data.email?"showEmail":"bindEmail",

    formType: "", // changeEmail, unbindEmail

    oldEmailCode: "",
    newEmail: data.unverifiedEmail,
    newEmailCode: data.nationCode,

    newTime: 0,
    oldTime: 0
  },
  methods: {
    timeout: function(t) {
      var self = this;
      var time = self[t];
      if(time <= 0) return;
      setTimeout(function() {
        self[t] --;
        self.timeout(t);
      }, 1000);
    },
    reduceTime: function(t) {
      this[t] = 120;
      this.timeout(t);
    },
    selectBindEmail: function() {
      this.type = "verifyOldEmail";
    },
    getEmailCode: function(type) {
      var self = this;
      NKC.methods.sendEmailCode(type)
        .then(function() {
          sweetSuccess("发送成功");
          self.reduceTime("oldTime");
        })
        .catch(sweetError);
    },
    getOldEmailCode: function() {
      var self = this;
      nkcAPI('/u/'+data.user.uid+'/settings/email', 'POST', {
        operation: 'verifyOldEmail'
      })
        .then(function() {
          sweetSuccess("发送成功");
          self.reduceTime("oldTime");
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    getNewEmailCode: function() {
      var self = this;
      nkcAPI('/u/'+data.user.uid+'/settings/email', 'POST', {
        oldToken: this.oldEmailCode,
        email: this.newEmail,
        operation: 'verifyNewEmail'
      })
        .then(function() {
          sweetSuccess("发送成功");
          self.reduceTime("newTime");
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    getBindEmailCode: function() {
      var self = this;
      nkcAPI('/u/'+data.user.uid+'/settings/email', 'POST', {
        email: this.newEmail,
        operation: 'bindEmail'
      })
        .then(function() {
          sweetSuccess("发送成功");
          self.reduceTime("newTime");
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    submitChangeEmail: function() {
      var query = "?email=" + this.newEmail + "&oldToken=" + this.oldEmailCode + "&token=" + this.newEmailCode;
      nkcAPI("/u/" + data.user.uid + "/settings/email/verify" + query, "GET")
        .then(function() {
          sweetSuccess("绑定成功");
          window.location.reload();
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    submitBindEmail: function() {
      var query = "?email=" + this.newEmail + "&token=" + this.newEmailCode;
      nkcAPI("/u/" + data.user.uid + "/settings/email/bind" + query, "GET")
        .then(function() {
          sweetSuccess("绑定成功");
          window.location.reload();
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    submitUnbindEmail: function() {
      var query = "?token=" + this.oldEmailCode;
      nkcAPI("/u/" + data.user.uid + "/settings/email/unbind" + query, "GET")
        .then(function() {
          sweetSuccess("解绑成功");
          window.location.reload();
        })
        .catch(function(data) {
          sweetError(data);
        })
    }
  }
});


var mobileApp = new Vue({
  el: "#mobileApp",
  data: {
    nationCodes: window.nationCodes,
    mobile: data.mobile,
    formType: !data.mobile? "bind": "",
    newMobile: data.unverifiedMobile,
    newNationCode: data.nationCode || nationCode,
    newCode: "",
    oldCode: "",

    newTime: 0,
    oldTime: 0,

    phoneVerify: {
      status: "wait",
      time: 0,
      code: "",
      complete: false
    }
  },
  methods: {
    timeout: function(t) {
      var self = this;
      var time = self[t];
      if(time <= 0) return;
      setTimeout(function() {
        self[t] --;
        self.timeout(t);
      }, 1000);
    },
    reduceTime: function(t) {
      this[t] = 120;
      this.timeout(t);
    },
    bindMobileMessage: function() {
      var obj = {
        mobile: this.newMobile,
        nationCode: this.newNationCode
      };
      if(obj.mobile === '') {
        return sweetError('请输入手机号码');
      }
      var self = this;
      nkcAPI('/sendMessage/bindMobile', 'POST', obj)
        .then(function() {
          sweetSuccess('验证码发送成功');
          self.reduceTime("newTime");
        })
        .catch(function(data) {
          sweetError(data.error);
        })
    },
    submitBindMobile: function() {
      var obj = {
        code: this.newCode,
        mobile: this.newMobile,
        nationCode: this.newNationCode
      };
      if(obj.code === '') {
        return sweetError('请输入手机验证码');
      }
      if(obj.mobile === '') {
        return sweetError('请输入手机号码');
      }
      nkcAPI('/u/'+NKC.configs.uid+'/settings/mobile', 'POST', obj)
        .then(function() {
          sweetSuccess('绑定成功');
          window.location.reload();
        })
        .catch(function(data) {
          sweetError(data.error);
        })
    },
    sendMessage: function(type) {
      var self = this;
      var obj = {operation: 'verifyOldMobile'};
      if(type) {
        obj.operation = 'verifyNewMobile';
        obj.nationCode = this.newNationCode;
        obj.mobile = this.newMobile;
        if(obj.mobile === '') {
          return sweetError('请输入新手机号');
        }
      }

      nkcAPI('/sendMessage/changeMobile', 'POST', obj)
        .then(function() {
          sweetSuccess('验证码发送成功');
          if(type) {
            self.reduceTime("newTime");
          } else {
            self.reduceTime("oldTime");
          }
        })
        .catch(function(data) {
          sweetError(data.error);
        })
    },
    submitChangeMobile: function() {
      var obj = {
        oldCode: this.oldCode,
        code: this.newCode,
        mobile: this.newMobile,
        nationCode: this.newNationCode
      };
      if(obj.oldCode === '') {
        return sweetError('请输入旧手机验证码');
      }
      if(obj.code === '') {
        return sweetError('请输入新手机验证码');
      }
      if(obj.mobile === '') {
        return sweetError('请输入新手机号码');
      }
      nkcAPI('/u/'+NKC.configs.uid+'/settings/mobile', 'PUT', obj)
        .then(function() {
          sweetSuccess('更改绑定成功');
          window.location.reload();
        })
        .catch(function(data) {
          sweetError(data.error);
        })
    },
    unbindMobileMessage: function() {
      var self = this;
      nkcAPI('/sendMessage/unbindMobile', 'POST', {})
        .then(function() {
          sweetSuccess('验证码发送成功');
          self.reduceTime("oldTime");
        })
        .catch(function(data) {
          sweetError(data.error);
        })
    },
    submitUnbindMobile: function() {
      var obj = {
        code: this.oldCode
      };
      if(obj.code === '') {
        return sweetError('请输入手机验证码');
      }
      nkcAPI('/u/'+NKC.configs.uid+'/settings/mobile' + "?code=" + obj.code, 'DELETE')
        .then(function() {
          sweetSuccess('解绑成功');
          window.location.reload();
        })
        .catch(function(data) {
          sweetError(data.error);
        })
    },

    sendPhoneVerifySmsCode: function() {
      var self = this.phoneVerify;
      self.status = "sending";
      nkcAPI("/u/"+ NKC.configs.uid +"/phoneVerify/sendSmsCode", "POST")
        .then(function(data) {
          var countdownLen = data.countdownLen;
          self.time = countdownLen;
          self.status = "countdown";
          var timer = setInterval(function() {
            self.time -= 1;
            if(self.time === 0) {
              clearInterval(timer);
              self.status = "wait";
              self.time = 0;
            }
          }, 1000);
        })
        .catch(function(data) {
          sweetError(data);
          self.status = "wait";
          self.time = 0;
        })
    },
    submitPhoneVerify: function() {
      var self = this.phoneVerify;
      nkcAPI("/u/"+ NKC.configs.uid +"/phoneVerify", "POST", { code: self.code })
        .then(function() {
          self.complete = true;
          return sweetAlert("验证成功");
        })
        .then(function() {
          location.reload();
        })
        .catch(sweetError)
    }
  }
});

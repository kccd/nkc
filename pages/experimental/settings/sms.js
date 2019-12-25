
var app = new Vue({
  el: '#app',
  data: {
    smsSettings: {},
    nationCodes: nationCodes,
    test: {
      name: 'register',
      mobile: '',
      nationCode: '86'
    }
  },
  mounted: function() {
    nkcAPI(window.location.href + '?t=' + Date.now(), 'GET', {})
      .then(function(data) {
        app.smsSettings = data.smsSettings;
      })
      .catch(function(data) {
        screenTopWarning(data.error || data);
      })
  },
  methods: {
    getChineseName (code) {
      var chineseName = ''
      this.nationCodes.forEach(function (ele) {
        if (ele.code === code) {
          chineseName = ele.chineseName
        }
      })
      return chineseName
    },
    isDisabled (nationCode) {
      for (var i=0;  i < this.smsSettings.restrictedNumber.length; i++) {
        if (nationCode === this.smsSettings.restrictedNumber[i].code) return true;
      }
      return false
    },
    tran: function(name) {
      switch (name) {
        case 'register': return '注册';
        case 'login': return '登录';
        case 'getback': return '找回密码';
        case 'bindMobile': return '绑定手机';
        case 'changeMobile': return '更改手机号';
        case 'reset': return '绑定新手机号';
        case 'withdraw': return '提现';
      }
    },
    testSendMessage: function() {
      var name = this.test.name;
      var mobile = this.test.mobile;
      var nationCode = this.test.nationCode;
      if(!name) return screenTopWarning('请选择测试类型');
      if(!nationCode) return screenTopWarning('请选择测试手机国际区号');
      if(!mobile) return screenTopWarning('请输入测试手机号码');
      nkcAPI('/e/settings/sms/test', 'POST', {name: name, mobile: mobile, nationCode: nationCode})
        .then(function() {
          screenTopAlert('测试短信发送成功');
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
    },
    save: function() {
      var smsSettings = this.smsSettings;
      smsSettings.status = ['true', true].indexOf(smsSettings.status) !== -1;
      if(!smsSettings.appId) return screenTopWarning('appId不能为空');
      if(!smsSettings.appKey) return screenTopWarning('appKey不能为空');
      if(!smsSettings.smsSign) return screenTopWarning('短信签名不能为空');
      for(var i = 0 ; i < smsSettings.templates.length ; i++) {
        var template = smsSettings.templates[i];
        if(smsSettings.status) {
          if(template.id === '') return screenTopWarning(template.name + '的模板ID不能为空');
          if(template.validityPeriod === '') return screenTopWarning(template.name + '的有效时间不能为空');
          if(template.validityPeriod <= 0) return screenTopWarning(template.name + '的有效时间必须大于0');
          if(template.sameIpOneDay === '') return screenTopWarning(template.name + '的IP次数限制不能为空');
          if(template.sameIpOneDay <= 0) return screenTopWarning(template.name + '的IP次数限制必须大于0');
          if(template.sameMobileOneDay === '') return screenTopWarning(template.name + '的手机号码次数限制不能为空');
          if(template.sameMobileOneDay <= 0) return screenTopWarning(template.name + '的手机号码次数限制必须大于0');
        }
      }
      // 验证限制号码字符串 去掉无用数据 并转为数组
      Promise.resolve()
        .then(function() {
          var checkString = NKC.methods.checkData.checkString;  
          smsSettings.restrictedNumber.forEach(function (ele) {
            ele.number = ele.number.toString();
            checkString(ele.code, {
              name: "国际区号",
              minLength: 1,
            })
            checkString(ele.number,{
              name: '受限号码',
              minLength: '1'
            })
            ele.number = ele.number.trim().split(',').filter(function (n) {
              return n.trim();
            })
          })
        }, function () {
          screenTopWarning(data.error || data);
        })
        .then(function () {
          return nkcAPI('/e/settings/sms', 'PATCH', {smsSettings: smsSettings})
        })
        .then(function() {
          screenTopAlert('保存成功');
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
      
      // nkcAPI('/e/settings/sms', 'PATCH', {smsSettings: smsSettings})
      //   .then(function() {
      //     screenTopAlert('保存成功');
      //   })
      //   .catch(function(data) {
      //     screenTopWarning(data.error || data);
      //   })
    }
  }
});



/*
var app;
var data;
$(function() {
	data = $('#data').text();
	data = JSON.parse(data);
	data.login.name = '登录';
	data.register.name = '注册';
	data.changeMobile.name = '更换手机号';
	data.bindMobile.name = '绑定手机号';
	data.getback.name = '找回密码';
	app = new Vue({
		el: '#app',
		data: {
			settings: [data.login, data.register, data.changeMobile, data.bindMobile, data.getback]
		},
		updated: function() {
			for(var i = 0; i < app.settings.length; i++) {
				var setting = app.settings[i];
				if(setting.validityPeriod < 0) setting.validityPeriod = 0;
				if(setting.sameMobileOneDay < 0) setting.sameMobileOneDay = 0;
				if(setting.sameIpOneDay < 0) setting.sameIpOneDay = 0;
				setting.validityPeriod = parseInt(setting.validityPeriod);
				setting.sameMobileOneDay = parseInt(setting.sameMobileOneDay);
				setting.sameIpOneDay = parseInt(setting.sameIpOneDay);
			}
		},
		methods: {
			submit: function() {
				var obj = {
					login: app.settings[0],
					register: app.settings[1],
					changeMobile: app.settings[2],
					bindMobile: app.settings[3],
					getback: app.settings[4]
				};
				nkcAPI('/e/settings/sms', 'PATCH', obj)
					.then(function() {
						screenTopAlert('保存成功');
					})
					.catch(function(data) {
						screenTopWarning(data.error || data);
					})
			}
		}
	});
});*/

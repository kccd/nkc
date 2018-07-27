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
});
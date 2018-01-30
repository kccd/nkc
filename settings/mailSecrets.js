//this is a template for mailSecrets.js

//copy, rename to 'mailSecrets.js' then tweak the settings

const alidayu = require('alidayu-node');
let secrets = {};
secrets.smtpConfig = {
  host: 'smtp.exmail.qq.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: 'it@kc.ac.cn',
    pass: 'ccD711q'
  }
};


secrets.sendSMS = async (phone, code, fn, callback) => {
  let period = '15';//字符串模板分钟数
  if(fn === 'register'){
    //注册用户走这里
    await new alidayu('23632480', 'e264a8555d0ef54a9e881969572ed4d2').smsSend({
      sms_free_sign_name: '科新社',  //短信签名
      sms_param: {"code": code, "period": period},
      rec_num: phone,
      sms_template_code: 'SMS_100865101',//注册模板
      sms_type: 'normal'
    });
  }
  else if(fn === 'reset'){
    //修改密码走这里
    await new alidayu('23632480', 'e264a8555d0ef54a9e881969572ed4d2').smsSend({
      sms_free_sign_name: '科新社',  //短信签名
      sms_param: {"code": code, "period": period},
      rec_num: phone,
      sms_template_code: 'SMS_100810088',//大于平台手机找回密码模板号
      sms_type: 'normal'
    });
  }
  else if(fn === 'bindMobile'){
    //现有账号实名认证 绑定手机号
    await new alidayu('23632480', 'e264a8555d0ef54a9e881969572ed4d2').smsSend({
      sms_free_sign_name: '科新社',  //短信签名
      sms_param: {"code": code, "period": period},
      rec_num: phone,
      sms_template_code: 'SMS_100755081',
      sms_type: 'normal'
    });
  }
  else throw '错误的sms调用方式';
};

secrets.senderString = '"中国科创联互联网中心" <it@kc.ac.cn>';

secrets.exampleMailOptions = {
    from: secrets.senderString,
    to: 'redacted@noop.com',
    subject: 'noop',
    text: 'redacted',
};

//转账
secrets.transferAccounts = (option) => {
	const {money, paymentType, number} = option;
	return new Promise((resolve, reject) => {
		console.log(`收款平台：${paymentType}, 收款账号：${number}, 转账金额：${money}`);
		console.log('正在转账...');
		if(1) {
			resolve();
		} else {
			reject('这是错误信息。');
		}
	});
};


module.exports = secrets;

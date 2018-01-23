//this is a template for mailSecrets.js

//copy, rename to 'mailSecrets.js' then tweak the settings

var alidayu = require('alidayu-node');

module.exports = {
  smtpConfig:{
    host: 'your_host_address',
    port: 0,//ur host port
    secure: true, // use SSL
    auth: {
      user: 'your_user_name',
      pass: 'your_password'
    }
  },

  sendSMS: function(phone, code, fn, callback){
    if(fn === 'register'){
      //注册用户走这里
      new alidayu('code', 'code2').smsSend({
        sms_free_sign_name: '注册验证',  //短信签名
        sms_param: {"code": code, "product": "your_product"},
        rec_num: phone,
        sms_template_code: 'your_template_code',//注册模板
        sms_type: 'normal'
      }, callback)
    }
    else if(fn === 'reset'){
      //修改密码走这里
      new alidayu('code', 'code2').smsSend({
        sms_free_sign_name: '身份验证',  //短信签名
        sms_param: {"code": code, "product": "your_product"},
        rec_num: phone,
        sms_template_code: 'your_code',//大于平台手机找回密码模板号
        sms_type: 'normal'
      }, callback)
    }
    else throw '错误的sms调用方式'
  },

  senderString:'your_sender_string'
}
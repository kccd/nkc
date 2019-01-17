module.exports = {
  _id: 'email',
  c: {
    from: '"科创论坛"<blabla@blabla.com>',
    templates: [
      {
        name: 'bindEmail',
        title: '【科创论坛】绑定邮箱',
        text: '您正在执行绑定邮箱的操作（如果这不是您本人的操作，请忽略），验证码如下：'
      },
      {
        name: 'changeEmail',
        title: '【科创论坛】修改绑定邮箱',
        text: '您正在执行更改绑定邮箱的操作（如果这不是您本人的操作，请忽略），验证码如下：'
      },
      {
        name: 'getback',
        title: '【科创论坛】找回密码',
        text: '您正在执行找回密码的操作（如果这不是您本人的操作，请忽略），验证码如下：'
      }
    ],
    smtpConfig: {
      host: 'smtp.exmail.qq.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: '',
        pass: ''
      }
    }
  }
};
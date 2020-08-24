module.exports = {
  _id: 'email',
  c: {
    status: false,
    from: '"科创论坛"<blabla@blabla.com>',
    templates: [
      {
        "text" : "您正在执行绑定邮箱的操作（如果这不是您本人的操作，请忽略），验证码如下：",
        "title" : "【科创】绑定邮箱",
        "name" : "bindEmail"
      },
      {
        "text" : "您正在执行更改绑定邮箱的操作（如果这不是您本人的操作，请忽略），验证码如下：",
        "title" : "【科创】修改绑定邮箱",
        "name" : "changeEmail"
      },
      {
        "text" : "您正在执行找回密码的操作（如果这不是您本人的操作，请忽略），验证码如下：",
        "title" : "【科创】找回密码",
        "name" : "getback"
      },
      {
        "text" : "注销操作无法恢复，注销后将不能处置账号及发表的内容，发表的内容不可删除，账号积分全部作废，原用户名短期内不能再次注册，依据国家规定，行为记录将保留。你想好了吗？验证码如下：",
        "title" : "【科创】账号注销",
        "name" : "destroy"
      },
      {
        "text" : "你正在进行解绑邮箱操作，验证码如下：",
        "title" : "【科创】解绑邮箱",
        "name" : "unbindEmail"
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

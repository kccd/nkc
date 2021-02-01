module.exports = {
  _id: 'sms',
  c: {
    status: false,
    platform: 'tencent', // ali, tencent
    appId: 0,
    appKey: '',
    smsSign: '',
    templates: [
      {
        "name" : "register",
        "id" : '',
        "validityPeriod" : 60,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 10,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "reset",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "getback",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "bindMobile",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "login",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "changeMobile",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "withdraw",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "destroy",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "unbindMobile",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "changeUnusedPhoneNumber",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "verifyPhoneNumber",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      }
    ],
    restrictedNumber: []
  }
};

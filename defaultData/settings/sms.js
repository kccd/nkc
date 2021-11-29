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
        "oid": [], // 特殊情况 {nationCode: "86", id: '23122'}
        "validityPeriod" : 60,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 10,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "reset",
        "id" : '',
        "oid": [],
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "getback",
        "id" : '',
        "oid": [],
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "bindMobile",
        "id" : '',
        "oid": [],
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "login",
        "id" : '',
        "oid": [],
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "changeMobile",
        "id" : '',
        "oid": [],
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "withdraw",
        "id" : '',
        "oid": [],
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "destroy",
        "id" : '',
        "oid": [],
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "unbindMobile",
        "id" : '',
        "oid": [],
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "changeUnusedPhoneNumber",
        "id" : '',
        "oid": [],
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      },
      {
        "name" : "verifyPhoneNumber",
        "id" : '',
        "oid": [],
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5,
        content: "你的验证码为{code}，将在{time}分钟后过期"
      }
    ],
    restrictedNumber: []
  }
};

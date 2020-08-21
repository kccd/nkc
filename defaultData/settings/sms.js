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
        "sameMobileOneDay" : 10
      },
      {
        "name" : "reset",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5
      },
      {
        "name" : "getback",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5
      },
      {
        "name" : "bindMobile",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5
      },
      {
        "name" : "login",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5
      },
      {
        "name" : "changeMobile",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5
      },
      {
        "name" : "withdraw",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5
      },
      {
        "name" : "destroy",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5
      },
      {
        "name" : "unbindMobile",
        "id" : '',
        "validityPeriod" : 15,
        "sameIpOneDay" : 10,
        "sameMobileOneDay" : 5
      }
    ],
    restrictedNumber: []
  }
};

module.exports = {
  _id: 'sms',
  c: {
    status: false,
    appId: 0,
    appKey: '',
    smsSign: '',
    templates: [
      {
        name: 'register',
        id: 0,
        validityPeriod: 15,
        sameIpOneDay: 10,
        sameMobileOneDay: 5
      },
      {
        name: 'reset',
        id: 0,
        validityPeriod: 15,
        sameIpOneDay: 10,
        sameMobileOneDay: 5
      },
      {
        name: 'getback',
        id: 0,
        validityPeriod: 15,
        sameIpOneDay: 10,
        sameMobileOneDay: 5
      },
      {
        name: 'bindMobile',
        id: 0,
        validityPeriod: 15,
        sameIpOneDay: 10,
        sameMobileOneDay: 5
      },
      {
        name: 'login',
        id: 0,
        validityPeriod: 15,
        sameIpOneDay: 10,
        sameMobileOneDay: 5
      },
      {
        name: 'changeMobile',
        id: 0,
        validityPeriod: 15,
        sameIpOneDay: 10,
        sameMobileOneDay: 5
      }
    ]
  }
};
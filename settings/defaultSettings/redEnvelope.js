module.exports = {
  type: 'redEnvelope',
  random: {
    close: true,
    awards: [
      {
        "name" : "特等奖",
        "kcb" : 500,
        "chance" : 1,
        "float" : 20
      },
      {
        "name" : "一等奖",
        "kcb" : 50,
        "chance" : 5,
        "float" : 20
      },
      {
        "name" : "二等奖",
        "kcb" : 20,
        "chance" : 14,
        "float" : 20
      },
      {
        "name" : "鼓励奖",
        "kcb" : 5,
        "chance" : 80,
        "float" : 20
      }
    ]
  },
  draftFee: {
    close: true,
    defaultCount: 1,
    minCount: 1,
    maxCount: 5
  }
};
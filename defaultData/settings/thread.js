module.exports = {
  _id: "thread",
  c: {
    displayPostAttachments: {
      gradesId: [],
      rolesId: []
    },
    playerTips: {
      isDisplay: false,
      tipContent: "仅供内部学术交流或培训使用，请先保存到本地。本内容不代表本站观点，未经原作者同意，请勿转载。"
    },
    disablePost: {
      status: false,
      allowAuthor: false,
      time: '2021-04-26',
      errorInfo: '根据相关法律法规和政策，内容不予显示。',
      rolesId: ['dev'],
      gradesId: [],
    },
    offsiteLink: {
      confirm: "您即将离开科创，请注意您的账号和财产安全。"
    },
    voteUpPost: {
      status: 'hide', // show, hide
      postCount: 1,
      voteUpCount: 1,
      selectedPostCount: 1,
    }
  }
};
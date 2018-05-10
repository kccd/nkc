const scoreMap = {
  postToThread: {
    score: -20,
    postCount: 1
  },
  postToForum: {
    score: 0,
    threadCount: 1
  },
  disablePost: {
    score: -10,
    disabledPostCount: 1
  },
  enablePost: {
    score: 0,
    disabledPostCount: -1
  },
  moveToRecycle: {
    score: 0,
    disabledThreadCount: 1
  },
  recommendPost: {
    score: 0,
    recCount: 1
  },
  unrecommendPost: {
    score: 0,
    recCount: -1
  },
  subscribeUser: {
    score: 0,
    subs: 1
  },
  unsubscribeUser: {
    score: 0,
    subs: -1
  },
  setDigest: {
    score: 100,
    digestThreadsCount: 1
  },
  cancelDigest: {
    score: -100,
    digestThreadsCount: -1
  },
  setTopped: {
    score: 0,
    toppedThreadsCount: 1
  },
  cancelTopped: {
    score: 0,
    toppedThreadsCount: -1
  },
  dailyLogin: {
    score: 1,
    loginDays: 1
  },
	changeUsername: {
  	score: 0
	},
	viewThread: {
  	score: 0
	},
	viewForum: {
  	score: 0
	},
	viewUserCard: {
  	score: 0
	},
	viewUserPersonalForum: {
  	score: 0
	}
};

const scoreCoefficientMap = {
  xsf: 500,
  loginDays: 1,
  disabledPostCount: -20,
  disabledThreadCount: -10,
  postCount: 0,
  threadCount: 0,
  subs: 0,
  recCount: 0,
  digestThreadsCount: 100,
  toppedThreadsCount: 0
};

const scoreArithmetic = function(user, coeMap) {
  let arr = [];
  for(let cal in coeMap) {
    if(coeMap.hasOwnProperty(cal)) {
      arr.push(Number(coeMap[cal]) * Number(user[cal]))
    }
  }
  return arr.reduce((last, current) => last + current, 0)
};

const vitalityArithmetic = function(lWThreadCount, lWPostCount, xsf = 0) {
  lWThreadCount = Number(lWThreadCount);
  lWPostCount = Number(lWPostCount);
  let xsfResult = Math.round(Math.sqrt(Number(xsf + 1)));
  if(xsfResult > 2) {xsfResult = 2}
  return (lWThreadCount*3 + lWPostCount) * xsfResult;
};

module.exports = {
  scoreMap,
  scoreArithmetic,
  scoreCoefficientMap,
  vitalityArithmetic
};
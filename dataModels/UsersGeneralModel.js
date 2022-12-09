const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const usersGeneralSchema = new Schema({
	uid: {
		type: String,
		index: 1
  },
  language: {
	  type: String,
    default: 'zh_cn'
  },
  // 用户名的修改次数
  modifyUsernameCount: {
	  type: Number,
    default: 0,
  },
  reviewedCount: {
    article: {
      type: Number,
      default: 0,
    },
    comment: {
      type: Number,
      default: 0,
    },
    moment: {
      type: Number,
      default: 0
    },
    draft: {
      type: Number,
      default: 0
    }
  },
  /*
  reviewedCount: {
    article: {
      //已发帖
      count: {
        type: Number,
        default: 0
      },
      //违规还需发帖
      violationCount: {
        type: Number,
        default: 0
      }
    }
  },
  */
  waterSetting:{
    waterAdd: {
      type: Boolean,
      default: true
    },
    waterStyle: {
      type: String,
      default: "siteLogo"
    },
    waterGravity: {
      type: String,
      default: "southeast"
    },
    waterPayTime:{
      type: Date,
      default: null
    },
    waterPayInfo:{
      type: Boolean,
      default: false
    },
    picture:{
      waterGravity: {
        type: String,
        default: "southeast"
      },
      waterStyle: {
        type: String,
        default: "siteLogo"
      },
    },
    video:{
      waterGravity: {
        type: String,
        default: "southeast"
      },
      waterStyle: {
        type: String,
        default: "siteLogo"
      },
    }
  },
  messageSettings: {
	  // 响铃
    beep: {
      systemInfo: {
        type: Boolean,
        default: false
      },
      reminder: {
        type: Boolean,
        default: false
      },
      usersMessage: {
        type: Boolean,
        default: false
      }
    },
    // 震动
    vibrate: {
      systemInfo: {
        type: Boolean,
        default: false
      },
      reminder: {
        type: Boolean,
        default: false
      },
      usersMessage: {
        type: Boolean,
        default: false
      }
    },
    // 状态栏
    notificationBar: {
      systemInfo: {
        type: Boolean,
        default: true
      },
      reminder: {
        type: Boolean,
        default: true
      },
      usersMessage: {
        type: Boolean,
        default: true
      }
    },
    // 已创建的聊天
    chat: {
      newFriends: {
        type: Boolean,
        default: true
      },
      systemInfo: {
        type: Boolean,
        default: true
      },
      reminder: {
        type: Boolean,
        default: true
      }
    },
    // 权限设置
    onlyReceiveFromFriends: {
      type: Boolean,
      default: false
    },
    // 防骚扰设置
    limit: {
      status: {
        type: Boolean,
        default: false
      },
      // 时间限制>30天
      timeLimit: {
        type: Boolean,
        default: false
      },
      // 学术分限制>1
      xsfLimit: {
        type: Boolean,
        default: false
      },
      // 精选文章>1
      digestLimit: {
        type: Boolean,
        default: false
      },
      // 最小用户等级
      gradeLimit: {
        type: Number,
        default: 1
      },
      // 是否通过A卷
      volumeA: {
        type: Boolean,
        default: false
      },
      // 是否通过B卷
      volumeB: {
        type: Boolean,
        default: false
      }
    },
    // 出售商品时允许所有人向我发消息
    allowAllMessageWhenSale: {
      type: Boolean,
      default: true,
    }
  },
  lotterySettings: {
	  close: {
	    type: Boolean,
      default: false
    },
	  status: {
	    type: Boolean,
      default: false
    },

  },
  draftFeeSettings: {
	  kcb: {
	    type: Number,
      default: 0
    }
  },
  examSettings: {
    stageTime: {
      type: Date,
      default: new Date('2000-1-1 00:0000')
    }
  },
  kcbSettings: {
	  recordId: {
	    type: Number,
      default: null
    },
    total: {
	    type: Number,
      default: 0
    },
    diff: {
	    type: Boolean,
      default: false
    },
    totalNew: {
	    type: Number,
      default: 0
    },
    time: {
	    type: Date,
      default: null
    }
  },
  displaySettings: {
	  homeThreadList: {// subscribe, latest
      type: String,
      default: "home"
    }
  },
  // 用户个人关注设置
  subscribeSettings: {
	  // 关注时是否弹出关注分类选择弹窗
	  selectTypesWhenSubscribe: {
      type: Boolean,
      default: true
    }
  },
  // 访问专业的记录，用于主页展示最近访问过的专业
  visitedForumsId: {
	  type: [String],
    default: []
  },
  // 我访问过主页的用户
  visitedUsers: {
    type: [
      {
        _id: String,
        time: Date,
      }
    ],
    default: []
  },
  // 我访问过的文章
  visitedThreads: {
    type: [
      {
        _id: String,
        time: Date,
      }
    ],
    default: []
  },
  // 访问我主页的用户
  accessedUsers: {
    type: [
      {
        _id: String,
        time: Date,
      }
    ],
    default: []
  },
  // 上次生成点赞消息的时间
  voteDeadline: {
    type: Date,
    default: Date.now()
  }
}, {
	collection: 'usersGeneral'
});

usersGeneralSchema.statics.replaceItem = async (arr, _id) => {
  for(let i = 0; i < arr.length; i++) {
    if(arr[i]._id !== _id) continue;
    arr.splice(i, 1);
    break;
  }
  if(arr.length >= 12) {
    arr.shift();
  }
  arr.push({
    _id,
    time: new Date()
  });
  return arr;
}

usersGeneralSchema.statics.updateThreadAccessLogs = async (uid, tid) => {
  const UsersGeneralModel = mongoose.model('usersGeneral');
  const userGeneral = await UsersGeneralModel.findOne({uid}, {
    visitedThreads: 1,
  });
  const visitedThreads = await UsersGeneralModel.replaceItem(userGeneral.visitedThreads, tid);
  await userGeneral.updateOne({
    $set: {
      visitedThreads
    }
  });
};

usersGeneralSchema.statics.updateUserAccessLogs = async (uid, tUid) => {
  const UsersGeneralModel = mongoose.model('usersGeneral');
  const usersGeneral = await UsersGeneralModel.find({
    uid: {
      $in: [uid, tUid]
    }
  },
  {
    uid: 1,
    visitedUsers: 1,
    accessedUsers: 1
  });
  if(usersGeneral.length !== 2) return;
  let visitor;
  let target;
  if(usersGeneral[0].uid === uid) {
    visitor = usersGeneral[0];
    target = usersGeneral[1];
  } else {
    visitor = usersGeneral[1];
    target = usersGeneral[0];
  }

  const visitorVisitedUsers = await UsersGeneralModel.replaceItem(visitor.visitedUsers, tUid);
  const targetAccessedUsers = await UsersGeneralModel.replaceItem(target.accessedUsers, uid);

  await visitor.updateOne({
    $set: {
      visitedUsers: visitorVisitedUsers
    }
  });
  await target.updateOne({
    $set: {
      accessedUsers: targetAccessedUsers
    }
  });
}


/*
* 重置用户的图书发帖数量
*
* */
usersGeneralSchema.statics.resetReviewedCount = async function (uid, type) {
  const UsersGeneralSchema = mongoose.model('usersGeneral');
  const SettingModel = mongoose.model('settings');
  const review = await SettingModel. findOne({_id: 'review'}, {
    article: 1,
    document: 1
  });
  //获取违规需要的发帖数
  const articleViolationCount = review.article.violationCount;
  const commentViolationCount = review.comment.violationCount;
  //设置对应违规需要的发帖数
  if(type.includes('article')) {
    await UsersGeneralSchema.updateOne({uid}, {
      $set: {
       'reviewedCount.article.count': articleViolationCount
      }
    });
  }
  if(type.includes('comment')) {
    await UsersGeneralSchema.updateOne({uid}, {
      $set: {
        'reviewedCount.article.violationCount': commentViolationCount,
      }
    });
  }
}

usersGeneralSchema.statics.getUserVisitedForumsId = async (uid) => {
  const UsersGeneralModel = mongoose.model('usersGeneral');
  const generalSettings = await UsersGeneralModel.findOne({uid}, {
    visitedForumsId: 1,
  });
  return generalSettings? generalSettings.visitedForumsId: [];
}


const UsersGeneralModel = mongoose.model('usersGeneral', usersGeneralSchema);
module.exports = UsersGeneralModel;

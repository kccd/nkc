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
  }
}, {
	collection: 'usersGeneral'
});

const UsersGeneralModel = mongoose.model('usersGeneral', usersGeneralSchema);
module.exports = UsersGeneralModel;

const parameter = Symbol('parameter');
const GET = Symbol('GET');
const POST = Symbol('POST');
const DELETE = Symbol('DELETE');
const PATCH = Symbol('PATCH');
const OPTIONS = Symbol('OPTIONS');
const PUT = Symbol('PUT');
const name = Symbol('name');

const _hour = 3600*1000;
const _day = _hour*24;
const _month = _day*30;
const _year = _month*12;

const methodEnum = {
  GET,
  POST,
  PUT,
  PATCH,
  DELETE,
  OPTIONS
};

const certificates ={
  visitor: {
    displayName: '陆游',
    inheritFrom: ['banned'],
    contentClasses: {
      null: true,
      images: true,
      non_public: false,
      non_images: false
    },
    permittedOperations: {
      test: {
        [GET]: true
      },
      login: {
        [name]: '登录',
        [GET]: true,
        [POST]: true,
        [DELETE]: true
      },
      latest: {
        [name]: '最近帖子',
        [GET]: true
      },
      pfa: {
        [name]: '个人版头像',
        [parameter]: {
          [GET]: true
        }
      },
      pfb: {
        [name]: '个人版banner',
        [parameter]: {
          [GET]: true
        }
      },
      qr: {
        [name]: '二维码',
        [parameter]: {
          [GET]: true
        }
      },
      activities: {
        [name]: '个人动态',
        [parameter]: {
          [GET]: true
        }
      },
      t: {
        [name]: '贴子',
        [parameter]: {
          [GET]: true
        }
      },
      f: {
        [name]: '板块',
        [GET]: true,
        [parameter]: {
          [GET]: true,
          c: {
            [name]: '标签',
            [GET]: true,
            [parameter]: {
              [GET]: true
            }
          }
        }
      },
      u: {
        [name]: '用户',
        [parameter]: {
          [GET]: true,
          activities: {
            [name]: '个人动态',
            [GET]: true
          }
        }
      },
      m: {
        [name]: '专栏',
        [parameter]: {
          [GET]: true
        }
      },
      search: {
        [name]: '搜索',
        [GET]: true,
        [POST]: true,
      },
      exam: {
        [name]: '考试',
        [GET]: true,
        [parameter]: {
          [GET]: true,
          [POST]: true,
        }
      },
      register: {
        [name]: '注册',
        [GET]: true,
        email: {
          [GET]: true,
          [POST]: true,
          verify: {
            [GET]: true
          }
        },
        mobile: {
          [GET]: true,
          [POST]: true
        }
      },
      r: {
        [name]: '附件',
        [parameter]: {
          [GET]: true,
        }
      },
      rt: {
        [name]: '附件',
        [parameter]: {
          [GET]: true
        }
      },
      p: {
        [name]: '推文',
        [parameter]: {
          [GET]: true,
        }
      },
      sendMessage: {
        [name]: '发短信',
        register: {
          [name]: '注册短信',
          [POST]: true
        },
        bindMobile: {
          [name]: '绑定手机号',
          [POST]: true
        },
        reset: {
          [name]: '找回密码',
          [POST]: true
        }
      },
      avatar: {
        [parameter]: {
          [GET]: true
        },
        [GET]: true
      },
      ad: {
        [parameter]: {
          [GET]: true
        }
      },
      avatar_small: {
        [parameter]: {
          [GET]: true
        },
        [GET]: true
      },
      resources: {
        site_specific: {
          forum_icon: {
            [parameter]: {
              [GET]: true,
            },
          },
          [parameter]: {
            [GET]: true
          }
        },
      },
      default: {
        [parameter]: {
          [GET]: true
        },
        [GET]: true
      },
      forgotPassword: {
        [name]: '找回密码',
        [GET]: true,
        mobile: {
          [name]: '通过手机号找回',
          [GET]: true,
          [POST]: true,
          [PUT]: true
        },
        email: {
          [name]: '通过邮箱找回',
          [GET]: true,
          [POST]: true,
          [PUT]: true,
          verify: {
            [name]: "验证邮件",
            [GET]: true
          }
        }
      },
	    'index.php': {
      	[name]: '兼容老版本',
      	[GET]: true
	    },
	    'read.php': {
		    [name]: '兼容老版本',
		    [GET]: true
	    }
    },
    elseModifyTimeLimit: 0,
    selfModifyTimeLimit: 0
  },
  banned: {
    displayName: '开除学籍',
    permittedOperations: {
      me: {
        [GET]: true
      },
      logout: {
        [GET]: true
      }
    }
  },
  default: {
    displayName: '会员',
    inheritFrom: ['visitor'],
    contentClasses: {
      images: true,
      non_public: true,
      non_images: true,
      non_broadcast: true
    },
    permittedOperations: {
      m: {
        [parameter]: {
          config: {
            [name]: '个人板块信息',
            [PATCH]: true
          }
        }
      },
      f: {
        [parameter]: {
          [POST]: true,
          subscribe: {
            [POST]: true,
            [DELETE]: true
          },
          category: {
            [name]: '分类',
            [GET]: true
          }
        }
      },
      sms: {
        [name]: '信息',
        [GET]: true,
        at: {
          [name]: '@',
          [GET]: true
        },
        replies: {
          [name]: '回复',
          [GET]: true
        },
        message: {
          [name]: '消息',
          [GET]: true,
          [POST]: true,
          [parameter]: {
            [GET]: true
          }
        },
        system: {
          [name]: '系统',
          [GET]: true,
          [parameter]: {
            [GET]: true
          }
        }
      },
      t: {
      	[GET]: true,
        [parameter]: {
          [POST]: true,
          addColl: {
            [name]: '收藏',
            [POST]: true
          },
          switchInPersonalForum: {
            [name]: '在专栏加精、顶置、隐藏显示',
            [PATCH]: true
          }
        }
      },
      r: {
        [POST]: true,
        [GET]: true
      },
      rt: {
        [GET]: true
      },
      editor: {
        [name]: '编辑器',
        [GET]: true
      },
      p: {
        [parameter]: {
          [PATCH]: true,
          recommend: {
            [name]: '推荐',
            [POST]: true,
            [DELETE]: true
          },
          quote: {
            [name]: '引用',
            [GET]: true
          }
        }
      },
      u: {
        [GET]: true, // 查看用户资料
        [parameter]: {
          subscribe: {
            [name]: '订阅',
            [GET]: true,
            [POST]: true, // 订阅该用户
            [DELETE]: true // 取消订阅该用户
          },
          collections: {
            [name]: '收藏',
            [GET]: true,
            [POST]: true,
            [DELETE]: true,
            [PUT]: true,
            [parameter]: {
              [GET]: true,
              [PATCH]: true,
              [DELETE]: true
            }
          }
        }
      },
      me: {
        [PATCH]: true,
        [GET]: true,
        settings: {
          [name]: '个人信息',
          [PATCH]: true
        },
        password: {
          [name]: '密码',
          [PATCH]: true
        },
        username: {
          [name]: '用户名',
          [PATCH]: true
        },
        mobile: {
          [name]: '手机',
          [POST]: true
        },
        resource: {
          [name]: '上传的资源',
          [GET]: true
        },
        activities: {
          [name]: '个人动态',
          [GET]: true
        },
        threads: {
          [name]: '获取帖子',
          [GET]: true
        },
      },
      logout: {
        [GET]: true
      },
      pfb: {
        [name]: '专栏背景图',
        [parameter]: {
          [POST]: true
        }
      },
      pfa: {
        [name]: '专栏头像',
        [parameter]: {
          [POST]: true
        }
      },
      avatar: {
        [name]: '头像',
        [parameter]: {
          [POST]: true
        }
      },
      /*photo: {
        [name]: '证件照',
	      [POST]: true,
        [parameter]: {
          [GET]: true,
	        [DELETE]:true
        }
      },
	    photo_small: {
		    [name]: '证件照缩略图',
		    [parameter]: {
			    [GET]: true
		    }
	    },
      fund: {
        [name]: '基金',
        [GET]: true,
	      list: {
        	[name]: '基金项目列表',
		      [GET]: true, // 所有基金项目
		      [parameter]: {
			      [GET]: true, // 具体到某一个基金项目
			      [POST]: true, // 申请该基金
			      add: {
				      [GET]: true // 填写申请信息页面
			      },
			      a: {
			      	[name]: '基金申请列表',
				      [GET]: true
			      }
		      }
	      },
	      a: {
        	[name]: '所有基金申请',
		      [GET]: true,
		      [parameter]: {
        		[name]: '基金申请表',
			      [GET]: true,
			      [PATCH]: true,
			      [POST]: true,
			      [DELETE]: true,
			      settings: {
							[GET]: true
			      },
			      member: {
        			[GET]: true,
				      [PATCH]: true
			      }
		      }
	      },
	      me: {
        	[name]: '我的基金',
		      [GET]: true
	      }
      },
	    fundBGI: {
		    [name]: '基金项目背景图片',
		    [POST]: true,
		    [parameter]: {
			    [GET]: true,
		    }
	    },
	    fundBGI_small: {
		    [name]: '基金项目背景图片',
		    [parameter]: {
			    [GET]: true,
		    }
	    },
	    set: {
      	[name]: '个人资料设置',
		    [GET]: true,
		    info: {
      		[name]: '基本信息',
			    [GET]: true,
			    [POST]: true,
			    [PATCH]: true
		    },
		    security: {
					[name]: '账号安全',
			    [GET]: true,
			    [POST]: true,
			    [PATCH]: true
		    },
		    verify: {
      		[name]: '身份认证',
			    [GET]: true,
			    [POST]: true,
			    [PATCH]: true
		    },
		    cert: {
      		[name]: '我的证书',
			    [GET]:true,
			    [POST]: true,
			    [PATCH]: true
		    },
		    album: {
      		[name]: '我的相册',
			    [GET]: true,
			    [POST]: true,
			    [PATCH]: true
		    }
	    },
	    auth: {
		    [name]: '身份认证',
		    [POST]: true, // 提交认证申请
		    [parameter]: {
			    [DELETE]: true
		    }
	    }*/
    },
    elseModifyTimeLimit: 0,
    selfModifyTimeLimit: 0.5*_hour
  },
  email: {
    displayName: '笔友',
    inheritFrom: ['default'],
    permittedOperations: {
      p: {
        [parameter]: {
          quote: {
            [GET]: true
          }
        }
      }
    },
    selfModifyTimeLimit: _hour
  },
  mobile: {
    displayName: '机友',
    inheritFrom: ['default'],
    permittedOperations: {
      p: {
        [parameter]: {
          quote: {
            [GET]: true
          }
        }
      }
    },
    selfModifyTimeLimit: _hour
  },
  examinated: {
    displayName: '进士',
    inheritFrom: ['default'],
    contentClasses: {
      professional: true
    },
    permittedOperations: {
      [GET]: true,
      p: {
        [parameter]: {
          quote: {
            [GET]: true
          }
        }
      }
    },
    selfModifyTimeLimit: 3*_month
  },
  qc: {
    displayName: '题委',
    permittedOperations: {
      q: {
        [GET]: true,
        [parameter]: {
          [GET]: true,
          [POST]: true,
          [parameter]: {
            [GET]: true
          }
        }
      }
    }
  },
  scholar: {
    displayName: '学者',
    inheritFrom: ['examinated', 'qc'],
    contentClasses: {
      sensitive: true
    },
    permittedOperations: {
      p: {
        [parameter]: {
          history: {
            [GET]: true
          }
        }
      }
    },
    selfModifyTimeLimit: 3*_year
  },
  moderator: {
    displayName: '版主',
    inheritFrom: ['scholar'],
    contentClasses: {
      classified: true
    },
    permittedOperations: {
      e: {
        [name]: '管理页面',
        [GET]: true,
        behavior: {
          [name]: '行为日志',
          [GET]: true
        },
        newUsers: {
          [name]: '新注册用户',
          [GET]: true
        },
        stats: {
          [name]: '统计',
          [GET]: true
        },
      },
      u: {
        [parameter]: {
          ban: {
            [name]: '封禁/解封用户',
            [GET]: true,// 封禁用户 
            [PUT]: true // 解封用户
          }
        }
      },
      t: {
        [parameter]: {
          digest: {
            [name]: '精华',
            [PATCH]: true
          },
          topped: {
            [name]: '顶置',
            [PATCH]: true,
            [POST]: true
          },
          moveThread: {
            [name]: '移动贴子',
            [PATCH]: true
          },
          [PATCH]: true
        },
      },
      p: {
        [GET]: true,
        [parameter]: {
          [GET]: true,
          [PATCH]: true,
          credit: {
            [name]: '学术分',
            [PATCH]: true
          },
          disabled: {
            [name]: '屏蔽',
            [PATCH]: true
          }
        }
      },
    },
    elseModifyTimeLimit: 20*_year,
    selfModifyTimeLimit: 20*_year
  },
  senior_moderator: {
    displayName: '责任版主',
    inheritFrom: ['moderator'],
  },
  editor: {
    displayName: '编辑',
    inheritFrom: ['senior_moderator'],
    contentClasses: {
      administractive: true
    },
    permittedOperations: {
      q: {
        [parameter]: {
          [parameter]: {
            [PATCH]: true,
            [DELETE]: true
          }
        }
      },
      m: {
        [parameter]: {
          pop: {
            [name]: '专栏推荐',
            [POST]: true,
            [DELETE]: true
          },
        }
      },
      t: {
        [parameter]: {
          ad: {
            [name]: '首页置顶',
            [PATCH]: true
          }
        }
      },
      f: {
        [parameter]: {
          [PATCH]: true,
          category: {
            [name]: '帖子分类',
            [POST]: true,
            [PATCH]: true,
            [parameter]: {
              [name]: '删除分类',
              [DELETE]: true
            }
          }

        }
      }
    }
  },
  dev: {
    displayName: '运维',
    inheritFrom: ['editor'],
    permittedOperations: {
      e: {
        gitPull: {
          [name]: 'git pull',
          [PATCH]: true
        },
        npmInstall: {
          [name]: 'npm install',
          [PATCH]: true
        },
        newSysinfo: {
          [name]: '系统通知',
          [GET]: true,
          [POST]: true
        },
        updateAllUsers: {
          [name]: '更新所有用户数据',
          [POST]: true
        },
        updateAllForums: {
          [name]: '更新所有板块数据',
          [POST]: true
        },
        updateAllThreads: {
          [name]: '更新所有帖子数据',
          [POST]: true
        }
      },
     /* fund: {
        [POST]: true,
	      m: {
		      [name]:'基金管理页面',
		      [GET]: true,
	      },
	      add: {
					[name]: '新建基金项目页面',
		      [GET]: true
	      },
	      list:{
        	[name]: '基金项目列表',
		      [POST]: true, // 添加基金项目
		      [parameter]: {
			      [DELETE]: true,// 删除基金项目
			      [PATCH]: true, // 修改基金项目
			      settings: {
				      [GET]: true // 基金设置
			      }
		      }
	      }

      },
	    auth: {
		    [name]: '身份认证',
		    [GET]: true,
		    [parameter]: {
		    	[GET]: true,
			    [PATCH]: true,
			    [DELETE]: true
		    }
	    }*/
    }
  }
};

module.exports = {
  methodEnum,
  time: {
    _hour,
    _day,
    _month,
    _year
  },
  certificates,
  parameter,
  name
};
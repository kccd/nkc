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
    	problem: {
				[name]: '问题',
		    add: {
					[name]: '报告问题',
			    [GET]: true,
			    [POST]: true
		    }
	    },
      login: {
        [name]: '登录',
        [GET]: true,
        [POST]: true,
        [DELETE]: true
      },
      latest: {
        [name]: '最近文章',
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
      cover: {
        [name]: '文章封面',
        [parameter]: {
          [GET]: true
        }
      },
      frameImg: {
        [name]: '视频封面',
        [parameter]: {
          [GET]: true
        }
      },
      appDownload: {
        [name]: 'app下载',
        [parameter]: {
          [GET]: true,
          android:{
            [name]: "android下载",
            [GET]: true,
            [parameter]:{
              [GET]: true,
              latest:{
                [name]: "最新",
                [GET]: true
              }
            }
          },
          ios:{
            [name]: "ios下载",
            [GET]: true,
            [parameter]:{
              [GET]: true,
              latest:{
                [name]: "最新",
                [GET]: true
              }
            }
          }
        }
      },
      f: {
        [name]: '板块',
        [GET]: true,
        [parameter]: {
          [GET]: true,
	        home: {
						[name]: '板块首页',
		        [GET]:true
	        },
	        latest: {
						[name]: '最新文章',
		        [GET]: true
	        },
	        followers: {
		        [name]: '关注者',
		        [GET]: true
	        },
	        visitors: {
						[name]: '今日来访',
		        [GET]: true
	        },
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
          [GET]: true
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
      register: {
        [name]: '注册',
        [GET]: true,
        email: {
          [GET]: false,
          [POST]: false,
          verify: {
            [GET]: false
          }
        },
        mobile: {
          [GET]: true,
          [POST]: true
        },
	      code: {
        	[name]: '图形验证码',
		      [GET]: true
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
        getback: {
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
	    forum_avatar: {
				[name]: '板块logo',
		    [parameter]: {
					[GET]: true
		    }
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
          [PATCH]: true
        },
        email: {
          [name]: '通过邮箱找回',
          [GET]: true,
          [POST]: true,
          [PATCH]: true,
          verify: {
            [name]: "验证邮件",
            [GET]: true
          }
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
				    bills: {
					    [name]: '基金账单',
					    [GET]: true
				    }
			    }
		    },
		    a: {
			    [name]: '所有基金申请',
			    // [GET]: true,
			    [parameter]: {
				    [name]: '基金申请表',
				    [GET]: true,
				    report: {
					    [name]: '报告进度',
					    [GET]: true
				    }
			    }
		    },
		    info: {
			    [name]: '科创基金所有信息',
			    [GET]: true,
		    },
		    bills: {
			    [name]: '科创基金总账单',
			    [GET]: true,
			    [POST]: true,
			    [parameter]: {
			    	[name]: '具体某一张账单',
				    [GET]: true,
				    [PATCH]: true,
				    [DELETE]: true
			    }
		    },
		    bill: {
					[name]: '捐赠和添加账单页面',
			    [GET]: true
		    },
		    donation: {
		    	[name]: '赞助',
			    [GET]: true,
			    [POST]: true,
			    return: {
		    		[GET]: true
			    },
			    verify: {
		    		[POST]: true
			    }
		    },
		    history: {
			    [name]: '历史基金',
			    [GET]: true,
			    [parameter]: {
			    	[GET]: true
			    }
		    }
	    },
	    fundBanner: {
		    [name]: '基金项目背景图片',
		    [POST]: true,
		    [parameter]: {
			    [GET]: true,
		    }
	    },
	    fundLogo: {
		    [name]: '基金项目背景图片',
		    [parameter]: {
			    [GET]: true,
		    }
	    },
	    photo: {
		    [name]: '证件照',
		    [parameter]: {
			    [GET]: true,
		    }
	    },
	    photo_small: {
		    [name]: '证件照缩略图',
		    [parameter]: {
			    [GET]: true
		    }
	    },
	    'index.php': {
      	[name]: '兼容老版本',
      	[GET]: true
	    },
	    'read.php': {
		    [name]: '兼容老版本',
		    [GET]: true
	    },
	    page: {
      	faq: {
      		[GET]: true
	      }
	    }
    },
    elseModifyTimeLimit: 0,
    selfModifyTimeLimit: 0
  },
  banned: {
    displayName: '开除学籍',
    permittedOperations: {
      me: {
        [GET]: false
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
      draft: {
        [name]: '草稿',
        [POST]: true,
        [GET]: true
      },
      download: {
        [GET]: true,
        [POST]: true,
        [parameter]: {
          [GET]: true,
          [POST]: true,
          [parameter]: {
            [GET]: true
          }
        }
      },
	    sendMessage: {
		    [name]: '发短信',
		    bindMobile: {
			    [name]: '绑定手机号',
			    [POST]: true
		    },
		    changeMobile: {
		    	[name]: '更换手机号',
			    [POST]: true
		    }
	    },
	    exam: {
		    [name]: '考试',
		    [GET]: true,
		    [parameter]: {
			    [GET]: true,
			    [POST]: true,
		    }
	    },
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
            [POST]: true, // 订阅该用户
            [DELETE]: true, // 取消订阅该用户
	          register: {
		          [GET]: true,
		          [POST]: true
	          }
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
          },
	        production: {
						[name]: '产品序列号',
						[POST]: false
	        },
	        bills: {
          	[name]: '用户账单',
		        [GET]: true
	        },
	        drafts: {
          	[name]: '草稿箱',
            [GET]: true,
            [DELETE]: true,
            [POST]: true,
            [parameter]: {
              [DELETE]: true,
            }
          },
	        auth: {
		        [DELETE]: true,
          	[parameter]: {
          		[name]: '身份认证',
		          [POST]: true
	          }
	        },
	        settings: {
          	[name]: '用户资料设置',
		        [GET]: true,
		        avatar: {
          		[name]: '用户头像设置',
			        [GET]: true
		        },
		        username: {
							[name]: '修改用户名',
			        [PATCH]: true
		        },
		        info: {
          		[name]: '基本资料设置',
			        [GET]: true,
			        [PATCH]: true
		        },
		        resume: {
							[name]: '简历设置',
			        [GET]: true,
			        [PATCH]: true
		        },
		        password: {
          		[name]: '密码修改',
			        [GET]: true,
			        [PATCH]: true
		        },
		        mobile: {
          		[name]: '手机绑定',
			        [GET]: true,
			        [PATCH]: true,
			        [POST]: true
		        },
		        email: {
          		[name]: '邮箱绑定',
			        [GET]: true,
			        [POST]: true,
			        [PATCH]: true,
			        bind: {
          			[name]: '验证绑定邮箱',
				        [GET]:true
			        },
			        verify: {
          			[name]: '验证新邮箱',
				        [GET]: true
			        }
		        },
		        verify: {
          		[name]: '身份认证',
			        [parameter]: {
				        [GET]: true,
				        [POST]: true
			        }
		        },
		        social: {
          		[name]: '社交账号',
			        [GET]: true,
			        [PATCH]: true
		        },
		        transaction: {
          		[name]: '交易信息设置',
			        [GET]: true,
			        [PATCH]: true
		        },
		        photo: {
          		[name]: '照片',
			        [GET]: true,
			        [PATCH]: true
		        },
		        cert: {
          		[name]: '证件',
			        [GET]: true,
			        [PATCH]: true
		        }
	        }
        }
      },
      me: {
        [PATCH]: false,
        [GET]: false,
        settings: {
          [name]: '个人信息',
          [PATCH]: false
        },
        password: {
          [name]: '密码',
          [PATCH]: false
        },
        username: {
          [name]: '用户名',
          [PATCH]: false
        },
        mobile: {
          [name]: '手机',
          [POST]: false
        },
        resource: {
          [name]: '上传的资源',
          [GET]: true
        },
        activities: {
          [name]: '个人动态',
          [GET]: false
        },
        threads: {
          [name]: '获取文章',
          [GET]: true
        },
	      life_photos: {
        	[name]: '生活照',
		      [GET]: true
	      }
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
      photo: {
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
			      add: {
				      [GET]: true, // 同意条款
				      [POST]: true // 申请该基金
			      }
		      }
	      },
	      a: {
        	[name]: '所有基金申请',
		      // [GET]: true,
		      [parameter]: {
        		[name]: '基金申请表',
			      [GET]: true,
			      [PATCH]: true,
			      [POST]: true,
			      [DELETE]: true,
			      settings: {
							[GET]: true
			      },
			      comment: {
							[name]:'评论',
				      [POST]: true,
				      [parameter]: {
					      [DELETE]: true, //封禁评论
				      }
			      },
			      member: {
        			[name]: '组员',
				      [PATCH]: true
			      },
			      vote: {
        			[name]: '投票',
        			[POST]: true
			      },
			      audit: {
        			[name]: '审核',
				      [GET]: true,
				      [POST]: true
			      },
			      report: {
        			[name]: '报告进度',
        			[GET]: true,
				      [POST]: true,
				      [parameter]: {
					      [DELETE]: true, //屏蔽报告
				      },
				      audit: { // 报告审核
								[GET]: true,
					      [POST]: true
				      }
			      },
			      complete: { // 结项
				      [name]: '结项',
        			[GET]: true,
				      [POST]: true,
				      audit: {
				      	[name]: '结题审核',
					      [GET]: true,
					      [POST]: true
				      }
			      },
			      remittance: {
				      [GET]: true,
				      [POST]: true,
        			apply: {
        				[name]: '申请拨款',
				        [GET]: true,
				        [POST]: true
			        },
				      verify: {
				      	[name]: '确认收款',
					      [PATCH]: true
				      }
			      },
			      excellent: {
				      [name]: '评优',
				      [PATCH]: true
			      },
			      disabled: {
				      [name]: '封禁',
				      [PATCH]: true
			      }
		      }
	      },
	      me: {
        	[name]: '我的基金',
		      [GET]: true
	      }
      },
	    fundBanner: {
		    [name]: '基金项目背景图片',
		    [POST]: true,
		    [parameter]: {
			    [GET]: true,
		    }
	    },
	    fundLogo: {
		    [name]: '基金项目背景图片',
		    [POST]: true,
		    [parameter]: {
			    [GET]: true,
		    }
	    }
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
          banned: {
            [name]: '封禁/解封用户',
            [PATCH]: true
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
          moveDraft: {
            [name]: '退回贴子',
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
          },
          history: {
            rollback: {
              [GET]: true,
              [parameter]: {
                [GET]: true
              }
            }
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
    	p: {
    		[parameter]: {
					history: {
						[name]: '屏蔽所有历史',
						[PATCH]: true
					}
		    }
	    },
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
      e: {
	      settings: {
        	[name]: '设置',
        	[GET]: true,
		      forum: {
        		[name]: '专业设置',
			      [GET]: true,
			      [PATCH]: true
		      },
		      base: {
        		[name]: '基础设置',
			      [GET]: true,
			      [PATCH]: true
		      },
		      permission: {
        		[name]: '权限设置',
			      [GET]: true,
			      [PATCH]: true
		      },
		      role: {
			      [name]: '角色设置',
			      [PATCH]: true,
			      [POST]: true,
			      [GET]: true,
			      [parameter]: {
				      [GET]: true,
			      	[DELETE]: true,
			      	users: {
			      		[GET]: true,
					      [PATCH]: true
				      },
				      base: {
			      		[GET]: true,
					      [PATCH]: true
				      },
				      permissions: {
			      		[GET]: true,
					      [PATCH]: true
				      }
			      },
		      },
		      operation: {
        		[name]: '操作权限设置',
			      [GET]: true,
			      [PATCH]: true,// 修改操作
			      [POST]: true,//添加分类
			      [parameter]: {
        			[GET]: true,
				      [PATCH]: true,
				      [DELETE]: true
			      }
		      },
		      user: {
        		[name]: '用户设置',
			      [GET]: true,
			      [parameter]: {
        			[GET]: true,
				      [PATCH]: true
			      }
		      },
		      score: {
        		[name]: '用户积分',
			      [GET]: true,
			      [PATCH]: true
		      },
          log: {
        	  [name]: '日志设置',
            [GET]: true,
            [PATCH]: true,
            [POST]: true
          },
		      download: {
        		[name]: '下载设置',
			      [GET]: true,
			      [PATCH]: true
		      },
		      grade: {
        		[name]: '用户等级设置',
			      [GET]: true,
			      [POST]: true,
			      [parameter]: {
        			[GET]: true,
				      [DELETE]: true,
				      [PATCH]: true
			      }
		      },
		      kcb: {
        		[name]: '科创币设置',
			      [GET]: true,
			      [PATCH]: true
		      },
	      },
	      status: {
	      	[name]: '统计',
		      [GET]: true
	      }
      },
	    f: {
		    [POST]: true, //新建板块
		    [parameter]: {
			    [DELETE]: true,
			    settings: {
				    [name]: '板块设置',
				    [GET]: true,
				    image: {
					    [name]: 'logo',
					    [GET]: true
				    },
				    info: {
					    [name]: '基本信息设置',
					    [GET]: true,
					    [PATCH]: true
				    },
				    category: {
					    [name]: '分类设置',
					    [GET]: true,
					    [PATCH]: true,
					    [POST]: true,
					    [DELETE]: true
				    },
				    permission: {
					    [name]: '权限设置',
					    [GET]: true,
					    [PATCH]: true
				    }
			    }
		    }
	    },
	    forum_avatar: {
		    [name]: '板块logo',
		    [parameter]: {
			    [POST]: true
		    }
	    },
	    problem: {
		    list: {
			    [GET]: true,
			    [parameter]: {
				    [GET]: true,
				    [PATCH]: true,
				    [DELETE]: true
			    }
		    }
	    },
    }
  },
  dev: {
    displayName: '运维',
    inheritFrom: ['editor'],
    permittedOperations: {
    	system: {
				[name]: '网站系统',
		    [GET]: true,
		    settings: {
					[name]: '系统设置',
			    [GET]: true,
			    [PATCH]: true
		    }
	    },
    	log: {
    		[name]: '网站日志',
		    [GET]: true,
		    [DELETE]: true
	    },
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
          [name]: '更新所有文章数据',
          [POST]: true
        }
      },
      fund: {
        [POST]: true,
	      add: {
					[name]: '新建基金项目页面',
		      [GET]: true
	      },
	      settings: {
		      [name]: '科创基金总设置',
		      [GET]: true,
		      [PATCH]: true
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
	      },
	      disabled: {
        	[name]: '被屏蔽的基金',
		      [GET]: true
	      }
      },
	    auth: {
		    [name]: '身份认证',
		    [GET]: true
	    },
	    u: {
    		[parameter]: {
    			auth: {
    				[name]: '用户身份审核',
				    [GET]: true,
				    [parameter]: {
    					[name]: '身份认证2，3',
					    [PATCH]: true
				    }
			    }
		    }
	    }
    }
  }
};

const allContentClasses = [
  'null',
  'images',
  'non_public',
  'non_images',
  'non_broadcast',
  'professional',
  'sensitive',
  'classified',
  'administractive'
];

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
  name,
  allContentClasses
};
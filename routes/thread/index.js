const Router = require('koa-router');
const operationRouter = require('./operation');
const threadRouter = new Router();

threadRouter
  .post('/:tid', async (ctx, next) => {
    const tid = ctx.params.tid;
    const messageObj = ctx.request.body;
    ctx.data = `回复帖子   tid：${tid}，回帖信息：${JSON.stringify(messageObj)}`;
    await next();
  })
  .get('/:tid', async (ctx, next) => {
    const tid = ctx.params.tid;
    ctx.data = {
      "site": {
        "name": "科创论坛",
        "description": "科技爱好综合社区",
        "copyright": "科创研究院 (c)2005-2016"
      },
      "contentClasses": {
        "null": true,
        "images": true,
        "": true
      },
      "permittedOperations": {
        "viewLatest": true,
        "viewPersonalActivities": true,
        "viewEditor": true,
        "viewThread": true,
        "viewForum": true,
        "viewHome": true,
        "viewUser": true,
        "viewPersonalForum": true,
        "useSearch": true,
        "viewLocalSearch": true,
        "viewExam": true,
        "submitExam": true,
        "viewRegister": true,
        "viewRegister2": true,
        "userRegister": true,
        "userLogin": true,
        "viewLogin": true,
        "viewLogout": true,
        "viewPanorama": true,
        "viewCollectionOfUser": true,
        "getResourceThumbnail": true,
        "getResource": true,
        "exampleOperation": true,
        "getGalleryRecent": true,
        "getForumsList": true,
        "viewPage": true,
        "viewTemplate": true,
        "receiveMobileMessage": true,
        "getRegcodeFromMobile": true,
        "forgotPassword": true,
        "newPasswordWithToken": true,
        "pchangePassword": true,
        "viewForgotPassword": true,
        "viewForgotPassword2": true,
        "getMcode": true,
        "getMcode2": true,
        "userPhoneRegister": true,
        "userMailRegister": true,
        "refreshicode": true,
        "refreshicode3": true,
        "viewActiveEmail": true
      },
      "template": "/home/lz/projects/nkc2/nkc_modules/jade/interface_thread.jade",
      "forum": {
        "class": null,
        "visibility": true,
        "count_posts_today": 14,
        "order": 5,
        "count_posts": 7346,
        "count_threads": 58,
        "type": "forum",
        "parentid": "157",
        "tCount": {
          "digest": 1,
          "normal": 58
        },
        "display_name": "公告通知",
        "description": "新消息发布，仅限公务",
        "color": "#65c1c0",
        "moderators": [],
        "_id": "forums/205",
        "_rev": "46887095642403",
        "_key": "205"
      },
      "ocuser": {
        "score": -100,
        "toc": 1504574657303,
        "xsf": 1,
        "postCount": 5,
        "disabledPostCount": 0,
        "disabledThreadCount": 0,
        "threadCount": 1,
        "subs": 0,
        "recCount": 0,
        "toppedThreadsCount": 0,
        "digestThreadsCount": 0,
        "tlv": 1508124496769,
        "lastVisitSelf": 1505283118887,
        "username": "SPARK",
        "username_lowercase": "spark",
        "color": "#000",
        "description": "这是个人简介",
        "post_sign": "这是帖子签名",
        "focus_forums": "205,164,134",
        "certs": [
          "mobile",
          "dev"
        ],
        "cart": [],
        "_id": "users/74185",
        "_rev": "46889077451043",
        "_key": "74185",
        "subscribeUsers": [
          "66939",
          "17332",
          "13025",
          "67916",
          "4891",
          "3212",
          "10",
          "2970",
          "41631"
        ],
        "subscribeForums": null,
        "subscribers": [],
        "hidelastlogin": true
      },
      "paging": {
        "page": 0,
        "perpage": 65,
        "start": 0,
        "count": 65,
        "pagecount": 1
      },
      "posts": [
        {
          "tlm": 1507795881109,
          "toc": 1507795881109,
          "l": "bbcode",
          "tid": "82376",
          "uid": "74185",
          "username": "SPARK",
          "c": "第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖",
          "t": "第一帖第一帖",
          "ipoc": "192.168.11.10",
          "credits": [
            {
              "toc": 1507882161292,
              "q": 1,
              "port": 62510,
              "uid": "74185",
              "username": "SPARK",
              "pid": "840235",
              "source": "nkc",
              "type": "xsf",
              "reason": "asd",
              "touid": "74185",
              "_id": "creditlogs/46887064054051",
              "_key": "46887064054051",
              "_rev": "46887064054051",
              "address": "192.168.11.10"
            }
          ],
          "r": [],
          "_id": "posts/840235",
          "_rev": "46887064840483",
          "_key": "840235",
          "user": {
            "score": -100,
            "toc": 1504574657303,
            "xsf": 1,
            "postCount": 5,
            "disabledPostCount": 0,
            "disabledThreadCount": 0,
            "threadCount": 1,
            "subs": 0,
            "recCount": 0,
            "toppedThreadsCount": 0,
            "digestThreadsCount": 0,
            "tlv": 1508124496769,
            "lastVisitSelf": 1505283118887,
            "username": "SPARK",
            "username_lowercase": "spark",
            "color": "#000",
            "description": "这是个人简介",
            "post_sign": "这是帖子签名",
            "focus_forums": "205,164,134",
            "certs": [
              "mobile",
              "dev"
            ],
            "cart": [],
            "_id": "users/74185",
            "_rev": "46889077451043",
            "_key": "74185"
          }
        },
        {
          "credits": null,
          "tlm": 1507882414320,
          "toc": 1507882414320,
          "l": "pwbb",
          "tid": "82376",
          "uid": "74185",
          "username": "SPARK",
          "c": "[quote=SPARK,840235]第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖[/quote]asdfasdfasd",
          "ipoc": "192.168.11.10",
          "r": [],
          "_id": "posts/840236",
          "_rev": "46887090137379",
          "_key": "840236",
          "user": {
            "score": -100,
            "toc": 1504574657303,
            "xsf": 1,
            "postCount": 5,
            "disabledPostCount": 0,
            "disabledThreadCount": 0,
            "threadCount": 1,
            "subs": 0,
            "recCount": 0,
            "toppedThreadsCount": 0,
            "digestThreadsCount": 0,
            "tlv": 1508124496769,
            "lastVisitSelf": 1505283118887,
            "username": "SPARK",
            "username_lowercase": "spark",
            "color": "#000",
            "description": "这是个人简介",
            "post_sign": "这是帖子签名",
            "focus_forums": "205,164,134",
            "certs": [
              "mobile",
              "dev"
            ],
            "cart": [],
            "_id": "users/74185",
            "_rev": "46889077451043",
            "_key": "74185"
          }
        },
        {
          "credits": null,
          "tlm": 1507882424823,
          "toc": 1507882424823,
          "l": "pwbb",
          "tid": "82376",
          "uid": "74185",
          "username": "SPARK",
          "c": "[quote=SPARK,840236][quote=SPARK,840235]第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖[/quote]asdfasdfasd[/quote]asdfasdfasd",
          "ipoc": "192.168.11.10",
          "r": [],
          "_id": "posts/840237",
          "_rev": "46887096887587",
          "_key": "840237",
          "user": {
            "score": -100,
            "toc": 1504574657303,
            "xsf": 1,
            "postCount": 5,
            "disabledPostCount": 0,
            "disabledThreadCount": 0,
            "threadCount": 1,
            "subs": 0,
            "recCount": 0,
            "toppedThreadsCount": 0,
            "digestThreadsCount": 0,
            "tlv": 1508124496769,
            "lastVisitSelf": 1505283118887,
            "username": "SPARK",
            "username_lowercase": "spark",
            "color": "#000",
            "description": "这是个人简介",
            "post_sign": "这是帖子签名",
            "focus_forums": "205,164,134",
            "certs": [
              "mobile",
              "dev"
            ],
            "cart": [],
            "_id": "users/74185",
            "_rev": "46889077451043",
            "_key": "74185"
          }
        }
      ],
      "thread": {
        "has_file": null,
        "has_image": null,
        "hideInMid": false,
        "count": 3,
        "count_remain": 3,
        "count_today": 2,
        "hits": 14,
        "tlm": 1507882424823,
        "toc": 1507795881109,
        "lm": "840237",
        "oc": {
          "tlm": 1507795881109,
          "toc": 1507795881109,
          "l": "bbcode",
          "tid": "82376",
          "uid": "74185",
          "username": "SPARK",
          "c": "第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖第一帖",
          "t": "第一帖第一帖",
          "ipoc": "192.168.11.10",
          "credits": [
            {
              "toc": 1507882161292,
              "q": 1,
              "port": 62510,
              "uid": "74185",
              "username": "SPARK",
              "pid": "840235",
              "source": "nkc",
              "type": "xsf",
              "reason": "asd",
              "touid": "74185",
              "_id": "creditlogs/46887064054051",
              "_key": "46887064054051",
              "_rev": "46887064054051",
              "address": "192.168.11.10"
            }
          ],
          "r": [],
          "_id": "posts/840235",
          "_rev": "46887064840483",
          "_key": "840235"
        },
        "uid": "74185",
        "mid": "74185",
        "fid": "205",
        "_id": "threads/82376",
        "_rev": "46892968651043",
        "_key": "82376"
      },
      "myForum": {
        "type": "forum",
        "abbr": "SPARK",
        "announcement": "",
        "display_name": "托马斯小火车",
        "description": "副标题",
        "moderators": [
          "74185"
        ],
        "recPosts": [],
        "_id": "personalForums/74185",
        "_rev": "46886295316771",
        "_key": "74185"
      },
      "twemoji": [
        "1f600",
        "1f601",
        "1f602",
        "1f603",
        "1f604",
        "1f605",
        "1f606",
        "1f607",
        "1f608",
        "1f609",
        "1f60a",
        "1f60b",
        "1f60c",
        "1f60d",
        "1f60e",
        "1f60f",
        "1f610",
        "1f611",
        "1f612",
        "1f613",
        "1f614",
        "1f615",
        "1f616",
        "1f617",
        "1f618",
        "1f619",
        "1f61a",
        "1f61b",
        "1f61c",
        "1f61d",
        "1f61e",
        "1f61f",
        "1f620",
        "1f621",
        "1f622",
        "1f623",
        "1f624",
        "1f625",
        "1f626",
        "1f627",
        "1f628",
        "1f629",
        "1f62a",
        "1f62b",
        "1f62c",
        "1f62d",
        "1f62e",
        "1f62f",
        "1f630",
        "1f631",
        "1f632",
        "1f633",
        "1f634",
        "1f635",
        "1f636",
        "1f637",
        "1f641",
        "1f642",
        "1f643",
        "1f644",
        "1f923",
        "1f928",
        "1f929",
        "1f92a",
        "1f92c",
        "1f92d",
        "1f92e",
        "2620",
        "2622",
        "2623",
        "26a0",
        "1f47f",
        "1f480",
        "1f47d",
        "1f47b"
      ],
      "forumlist": [
        {
          "parentforum": {
            "visibility": true,
            "isVisibleForNCC": false,
            "count_posts_today": 0,
            "order": 1,
            "parentid": "0",
            "tCount": {
              "digest": 0,
              "normal": 0
            },
            "display_name": "管理中心",
            "type": "category",
            "description": "规章制度、管理事务办理、公务交流",
            "color": "#98C9E4",
            "moderators": [],
            "_id": "forums/157",
            "_rev": "45636148930851",
            "_key": "157"
          },
          "forumgroup": [
            {
              "class": null,
              "visibility": true,
              "count_posts_today": 14,
              "order": 5,
              "count_posts": 7346,
              "count_threads": 58,
              "type": "forum",
              "parentid": "157",
              "tCount": {
                "digest": 1,
                "normal": 58
              },
              "display_name": "公告通知",
              "description": "新消息发布，仅限公务",
              "color": "#65c1c0",
              "moderators": [],
              "_id": "forums/205",
              "_rev": "46887095642403",
              "_key": "205"
            },
            {
              "visibility": true,
              "count_posts_today": 3,
              "order": 7,
              "count_posts": 2114,
              "count_threads": 201,
              "type": "forum",
              "parentid": "157",
              "abbr": "站务",
              "tCount": {
                "digest": 0,
                "normal": 201
              },
              "display_name": "办事大厅",
              "description": "办理版主申请、活动备案等公务事项",
              "moderators": [],
              "_id": "forums/21",
              "_rev": "45636218988835",
              "_key": "21"
            },
            {
              "class": null,
              "visibility": true,
              "count_posts_today": 0,
              "order": 50,
              "count_posts": 648,
              "count_threads": 26,
              "type": "forum",
              "parentid": "157",
              "abbr": "规章",
              "tCount": {
                "digest": 6,
                "normal": 26
              },
              "display_name": "规章制度",
              "description": "条例、条令、指令性文件",
              "moderators": [],
              "_id": "forums/203",
              "_rev": "45636179339555",
              "_key": "203"
            },
            {
              "visibility": true,
              "count_posts_today": 0,
              "order": 60,
              "count_posts": 1919,
              "count_threads": 131,
              "type": "forum",
              "parentid": "157",
              "abbr": "经费",
              "tCount": {
                "digest": 0,
                "normal": 131
              },
              "display_name": "科创基金",
              "description": "科创研究基金，正受理申报",
              "moderators": [],
              "_id": "forums/166",
              "_rev": "45636179601699",
              "_key": "166"
            }
          ]
        },
        {
          "parentforum": {
            "visibility": true,
            "isVisibleForNCC": true,
            "count_posts_today": 0,
            "order": 5,
            "parentid": "0",
            "tCount": {
              "digest": 0,
              "normal": 0
            },
            "display_name": "科创生活",
            "type": "category",
            "description": "新生交流、生活交友与泛科学创作区。科学哲学、科学文化等与科学技术有关的泛科学话题可以严肃的发表，其它话题应追求轻松愉快。",
            "color": "#7ECA87",
            "moderators": [],
            "_id": "forums/5",
            "_rev": "45636143032611",
            "_key": "5"
          },
          "forumgroup": [
            {
              "class": null,
              "visibility": true,
              "count_posts_today": 427,
              "order": 4,
              "count_posts": 281625,
              "count_threads": 24238,
              "type": "forum",
              "parentid": "5",
              "abbr": "茶话",
              "tCount": {
                "digest": 38,
                "normal": 24238
              },
              "display_name": "科创茶话",
              "description": "灌水贴图区。珍爱生命，远离技术。",
              "color": "#6ec4dc",
              "moderators": [
                "32842"
              ],
              "_id": "forums/81",
              "_rev": "45636232685859",
              "_key": "81"
            },
            {
              "visibility": true,
              "count_posts_today": 17,
              "order": 6,
              "count_posts": 22909,
              "count_threads": 1145,
              "type": "forum",
              "parentid": "5",
              "abbr": "DIY",
              "tCount": {
                "digest": 23,
                "normal": 1145
              },
              "display_name": "快乐DIY",
              "description": "特色鲜明的DIY构思、作品交流",
              "color": "#69bfa2",
              "moderators": [
                "2998"
              ],
              "_id": "forums/164",
              "_rev": "45636225673507",
              "_key": "164"
            },
            {
              "visibility": true,
              "count_posts_today": 0,
              "order": 12,
              "count_posts": 20229,
              "count_threads": 1867,
              "type": "forum",
              "parentid": "5",
              "abbr": "人文",
              "tCount": {
                "digest": 65,
                "normal": 1867
              },
              "display_name": "人文会馆",
              "description": "人文/社会/艺术/旅行等方面话题与作品交流。",
              "color": "#E8AAE8",
              "moderators": [
                "21933"
              ],
              "_id": "forums/109",
              "_rev": "45636177766691",
              "_key": "109"
            },
            {
              "visibility": true,
              "count_posts_today": 22,
              "order": 25,
              "count_posts": 17853,
              "count_threads": 1245,
              "type": "forum",
              "parentid": "5",
              "abbr": "创意",
              "tCount": {
                "digest": 3,
                "normal": 1245
              },
              "display_name": "奇思妙想",
              "description": "思考新途径新方法，展示新奇创意和发明。",
              "moderators": [],
              "_id": "forums/32",
              "_rev": "45636228884771",
              "_key": "32"
            },
            {
              "class": null,
              "visibility": true,
              "count_posts_today": 0,
              "order": 30,
              "count_posts": 885,
              "count_threads": 162,
              "display_name": "科幻",
              "type": "forum",
              "parentid": "5",
              "tCount": {
                "digest": 0,
                "normal": 162
              },
              "description": "交流科幻创意，发布科幻作品",
              "moderators": [],
              "_id": "forums/218",
              "_rev": "45636178684195",
              "_key": "218"
            }
          ]
        },
        {
          "parentforum": {
            "visibility": true,
            "isVisibleForNCC": true,
            "count_posts_today": 0,
            "order": 7,
            "display_name": "极客",
            "tCount": {
              "digest": 0,
              "normal": 0
            },
            "type": "category",
            "description": "原子核科学与技术，强激光与粒子束，声学武器，微波输能与武器等",
            "color": "#933FFA",
            "moderators": [],
            "_id": "forums/222",
            "_rev": "45636151028003",
            "_key": "222"
          },
          "forumgroup": [
            {
              "visibility": true,
              "count_posts_today": 19,
              "order": 2,
              "count_posts": 6488,
              "count_threads": 377,
              "type": "forum",
              "parentid": "222",
              "abbr": "极科",
              "tCount": {
                "digest": 12,
                "normal": 378
              },
              "display_name": "极客科技",
              "description": "EMP、强激光、微波武器等特种技术",
              "color": "#48a97b",
              "moderators": [
                "17332"
              ],
              "_id": "forums/54",
              "_rev": "45636205357347",
              "_key": "54"
            }
          ]
        },
        {
          "parentforum": {
            "class": null,
            "visibility": true,
            "isVisibleForNCC": true,
            "count_posts_today": 10,
            "order": 8,
            "count_posts": 10,
            "count_threads": 1,
            "icon_filename": "g-3",
            "tCount": {
              "digest": 0,
              "normal": 0
            },
            "display_name": "理学院",
            "type": "category",
            "description": "科学技术总论与基础学科，也包括原子核相关的应用技术，自然科学相关的小话题交流。",
            "color": "#9abb55",
            "moderators": [],
            "_id": "forums/201",
            "_rev": "45636145916195",
            "_key": "201"
          },
          "forumgroup": [
            {
              "visibility": true,
              "count_posts_today": 18,
              "order": 1,
              "count_posts": 6217,
              "count_threads": 501,
              "type": "forum",
              "parentid": "201",
              "abbr": "总论",
              "tCount": {
                "digest": 37,
                "normal": 501
              },
              "display_name": "科学技术学",
              "description": "科学技术的意义、规律、构成和泛科学话题",
              "color": "#000000",
              "moderators": [
                "10"
              ],
              "_id": "forums/106",
              "_rev": "45636232161571",
              "_key": "106"
            },
            {
              "class": null,
              "visibility": true,
              "count_posts_today": 0,
              "order": 10,
              "count_posts": 176,
              "count_threads": 24,
              "display_name": "数学",
              "type": "forum",
              "parentid": "201",
              "abbr": "数学",
              "tCount": {
                "digest": 0,
                "normal": 24
              },
              "description": "正在筹备",
              "moderators": [],
              "_id": "forums/202",
              "_rev": "45636177504547",
              "_key": "202"
            },
            {
              "class": null,
              "visibility": true,
              "count_posts_today": 16,
              "order": 20,
              "count_posts": 2063,
              "count_threads": 134,
              "display_name": "物理",
              "type": "forum",
              "parentid": "201",
              "abbr": "物理",
              "tCount": {
                "digest": 8,
                "normal": 134
              },
              "description": "正在筹备",
              "moderators": [
                "9510"
              ],
              "_id": "forums/204",
              "_rev": "45636232816931",
              "_key": "204"
            },
            {
              "class": null,
              "visibility": true,
              "count_posts_today": 0,
              "order": 30,
              "count_posts": 2396,
              "count_threads": 257,
              "display_name": "天文",
              "type": "forum",
              "parentid": "201",
              "tCount": {
                "digest": 8,
                "normal": 257
              },
              "description": "天文与空间科学研习区",
              "moderators": [],
              "_id": "forums/219",
              "_rev": "45636178815267",
              "_key": "219"
            },
            {
              "class": null,
              "visibility": true,
              "count_posts_today": 0,
              "order": 35,
              "count_posts": 3140,
              "count_threads": 255,
              "type": "forum",
              "parentid": "201",
              "tCount": {
                "digest": 13,
                "normal": 255
              },
              "display_name": "地球科学",
              "description": "地球自然科学，气象、海洋、地质研习区",
              "moderators": [],
              "_id": "forums/220",
              "_rev": "45636179077411",
              "_key": "220"
            }
          ]
        },
        {
          "parentforum": {
            "visibility": true,
            "isVisibleForNCC": true,
            "count_posts_today": 0,
            "order": 10,
            "parentid": "0",
            "icon_filename": "g-7",
            "tCount": {
              "digest": 0,
              "normal": 0
            },
            "display_name": "制造技术",
            "type": "category",
            "description": "把蓝图变成现实的相关技术：机械工程，工艺学。",
            "color": "#c589c5",
            "moderators": [],
            "_id": "forums/176",
            "_rev": "45636151159075",
            "_key": "176"
          },
          "forumgroup": [
            {
              "visibility": true,
              "count_posts_today": 5,
              "order": 1,
              "count_posts": 1805,
              "count_threads": 234,
              "type": "forum",
              "parentid": "176",
              "abbr": "3DP",
              "tCount": {
                "digest": 9,
                "normal": 234
              },
              "display_name": "三维打印",
              "description": "3D打印机、快速成型与增量制造技术",
              "color": "#888bca",
              "moderators": [
                "36917"
              ],
              "_id": "forums/174",
              "_rev": "45636214925603",
              "_key": "174"
            },
            {
              "visibility": true,
              "count_posts_today": 15,
              "order": 2,
              "count_posts": 10581,
              "count_threads": 590,
              "type": "forum",
              "parentid": "176",
              "abbr": "机械",
              "tCount": {
                "digest": 8,
                "normal": 590
              },
              "display_name": "机械工程与工艺",
              "description": "制造科学与技术，机械和工艺。",
              "moderators": [],
              "_id": "forums/120",
              "_rev": "45636230719779",
              "_key": "120"
            }
          ]
        },
        {
          "parentforum": {
            "visibility": true,
            "isVisibleForNCC": true,
            "count_posts_today": 0,
            "order": 12,
            "parentid": "0",
            "icon_filename": "g-6",
            "tCount": {
              "digest": 0,
              "normal": 0
            },
            "display_name": "计科院",
            "type": "category",
            "description": "计算机科学的基本理论、工程技术和前沿话题。",
            "color": "#e88039",
            "moderators": [],
            "_id": "forums/372",
            "_rev": "45636154501411",
            "_key": "372"
          },
          "forumgroup": [
            {
              "visibility": true,
              "count_posts_today": 22,
              "order": 6,
              "count_posts": 4773,
              "count_threads": 480,
              "type": "forum",
              "parentid": "372",
              "abbr": "软综",
              "tCount": {
                "digest": 35,
                "normal": 480
              },
              "display_name": "软件综合",
              "description": "Intelligence given, machines smarter.",
              "color": "#FFAA2B",
              "moderators": [
                "8518"
              ],
              "_id": "forums/134",
              "_rev": "45636226328867",
              "_key": "134"
            },
            {
              "class": null,
              "visibility": true,
              "count_posts_today": 2,
              "order": 7,
              "count_posts": 2,
              "type": "forum",
              "parentid": "372",
              "abbr": "硬件",
              "tCount": {
                "digest": 0,
                "normal": 0
              },
              "display_name": "计算机原理与电路",
              "description": "电子计算机原理，电子计算机硬件，电子计算机电路",
              "color": "#009966",
              "moderators": [],
              "_id": "forums/211",
              "_rev": "45636221741347",
              "_key": "211"
            },
            {
              "visibility": true,
              "count_posts_today": 8,
              "order": 15,
              "count_posts": 438,
              "count_threads": 60,
              "type": "forum",
              "parentid": "372",
              "abbr": "ML",
              "tCount": {
                "digest": 13,
                "normal": 60
              },
              "display_name": "机器学习/自控仿真",
              "description": "机器学习、建模仿真、自动控制、虚拟现实",
              "color": "#ea7b96",
              "moderators": [
                "35177"
              ],
              "_id": "forums/ml",
              "_rev": "45636212042019",
              "_key": "ml"
            },
            {
              "visibility": true,
              "count_posts_today": 6,
              "order": 16,
              "count_posts": 1200,
              "count_threads": 240,
              "type": "forum",
              "parentid": "372",
              "abbr": "视窗",
              "tCount": {
                "digest": 11,
                "normal": 240
              },
              "display_name": "Windows开发",
              "description": "Windows，DotNET和C#",
              "color": "#4b83d4",
              "moderators": [
                "8518"
              ],
              "_id": "forums/373",
              "_rev": "45636207585571",
              "_key": "373"
            },
            {
              "visibility": true,
              "count_posts_today": 0,
              "order": 100,
              "count_posts": 495,
              "count_threads": 31,
              "class": "null",
              "type": "forum",
              "parentid": "372",
              "abbr": "开源",
              "tCount": {
                "digest": 5,
                "normal": 31
              },
              "display_name": "UNIX开发",
              "description": "UNIX(Linux/BSD) ，兼自由开源软件。",
              "moderators": [],
              "_id": "forums/hw",
              "_rev": "45636180650275",
              "_key": "hw"
            }
          ]
        },
        {
          "parentforum": {
            "visibility": true,
            "isVisibleForNCC": true,
            "count_posts_today": 0,
            "order": 13,
            "parentid": "0",
            "icon_filename": "g-5",
            "tCount": {
              "digest": 0,
              "normal": 0
            },
            "display_name": "电子学院",
            "type": "category",
            "description": "电子学及其应用学科。包括模拟数字电路基础，射频电路，电子工艺，电子制作以及包括业余无线电在内的专门爱好。",
            "color": "#3D87B9",
            "moderators": [],
            "_id": "forums/361",
            "_rev": "45636154763555",
            "_key": "361"
          },
          "forumgroup": [
            {
              "visibility": true,
              "isVisibleForNCC": true,
              "count_posts_today": 30,
              "order": 1,
              "count_posts": 35856,
              "count_threads": 3227,
              "type": "forum",
              "parentid": "361",
              "abbr": "电子",
              "tCount": {
                "digest": 42,
                "normal": 3227
              },
              "display_name": "电子技术",
              "description": "电子、射频、通信综合交流区",
              "color": "#04A5EA",
              "moderators": [],
              "_id": "forums/37",
              "_rev": "45636232030499",
              "_key": "37"
            },
            {
              "visibility": true,
              "isVisibleForNCC": true,
              "count_posts_today": 63,
              "order": 10,
              "count_posts": 3679,
              "count_threads": 285,
              "type": "forum",
              "parentid": "361",
              "abbr": "仪表",
              "tCount": {
                "digest": 17,
                "normal": 286
              },
              "display_name": "仪表与测量",
              "description": "通用仪器与基准，科学仪器设计制造",
              "moderators": [],
              "_id": "forums/175",
              "_rev": "45636229409059",
              "_key": "175"
            },
            {
              "visibility": true,
              "isVisibleForNCC": true,
              "count_posts_today": 2,
              "order": 30,
              "count_posts": 3982,
              "count_threads": 329,
              "type": "forum",
              "parentid": "361",
              "abbr": "HAM",
              "tCount": {
                "digest": 11,
                "normal": 329
              },
              "display_name": "业余无线电",
              "description": "HAM' RADIO",
              "moderators": [],
              "_id": "forums/163",
              "_rev": "45636203915555",
              "_key": "163"
            }
          ]
        },
        {
          "parentforum": {
            "visibility": true,
            "isVisibleForNCC": true,
            "count_posts_today": 0,
            "order": 15,
            "parentid": "0",
            "icon_filename": "g-9",
            "tCount": {
              "digest": 0,
              "normal": 0
            },
            "display_name": "电气技术",
            "type": "category",
            "description": "以能量传输为目地的电学及其应用技术。包括电气工程，高电压技术，电力电子以及特斯拉线圈这样的专门爱好。",
            "color": "#44a588",
            "moderators": [],
            "_id": "forums/94",
            "_rev": "45636143622435",
            "_key": "94"
          },
          "forumgroup": [
            {
              "visibility": true,
              "count_posts_today": 15,
              "order": 6,
              "count_posts": 5299,
              "count_threads": 540,
              "type": "forum",
              "parentid": "94",
              "abbr": "PE",
              "tCount": {
                "digest": 17,
                "normal": 540
              },
              "display_name": "电力电子",
              "description": "电机驱动控制、换能逆变、开关电源等",
              "moderators": [],
              "_id": "forums/371",
              "_rev": "45636221085987",
              "_key": "371"
            },
            {
              "visibility": true,
              "count_posts_today": 13,
              "order": 10,
              "count_posts": 39326,
              "count_threads": 2487,
              "type": "forum",
              "parentid": "94",
              "abbr": "高压",
              "tCount": {
                "digest": 20,
                "normal": 2487
              },
              "display_name": "高压技术",
              "description": "特斯拉与富兰克林的爱情故事。[Ⅱ特]",
              "color": "#59a7b7",
              "moderators": [
                "14505",
                "12138"
              ],
              "_id": "forums/139",
              "_rev": "45636216105251",
              "_key": "139"
            },
            {
              "class": null,
              "visibility": true,
              "count_posts_today": 92,
              "order": 15,
              "count_posts": 33660,
              "count_threads": 2093,
              "type": "forum",
              "parentid": "94",
              "abbr": "电炮",
              "tCount": {
                "digest": 33,
                "normal": 2095
              },
              "display_name": "电炮技术",
              "description": "电磁枪与电磁炮，电磁加速方法研究",
              "moderators": [
                "17332",
                "14505"
              ],
              "_id": "forums/367",
              "_rev": "45636230588707",
              "_key": "367"
            },
            {
              "class": null,
              "visibility": true,
              "count_posts_today": 15,
              "order": 99,
              "count_posts": 9886,
              "count_threads": 552,
              "type": "forum",
              "parentid": "94",
              "abbr": "TC",
              "tCount": {
                "digest": 28,
                "normal": 552
              },
              "display_name": "特斯拉线圈",
              "description": "TC/DRSSTC/QCW/SKP等谐振电源",
              "color": "#46a947",
              "moderators": [
                "14505",
                "12138"
              ],
              "_id": "forums/206",
              "_rev": "45636231768355",
              "_key": "206"
            }
          ]
        },
        {
          "parentforum": {
            "visibility": true,
            "isVisibleForNCC": true,
            "count_posts_today": 0,
            "order": 20,
            "parentid": "0",
            "icon_filename": "g-8",
            "tCount": {
              "digest": 0,
              "normal": 0
            },
            "display_name": "航空航天",
            "type": "category",
            "description": "探索大气层内外的奥秘",
            "color": "#d05b5b",
            "moderators": [],
            "_id": "forums/74",
            "_rev": "45636151683363",
            "_key": "74"
          },
          "forumgroup": [
            {
              "class": null,
              "visibility": true,
              "count_posts_today": 62,
              "order": 1,
              "count_posts": 53910,
              "count_threads": 3664,
              "type": "forum",
              "parentid": "74",
              "abbr": "火箭",
              "tCount": {
                "digest": 217,
                "normal": 3664
              },
              "display_name": "火箭综合区",
              "description": "总体、发动机、控制等，燃料除外。",
              "color": "#ef7d54",
              "moderators": [
                "6688"
              ],
              "_id": "forums/89",
              "_rev": "45636232423715",
              "_key": "89"
            },
            {
              "visibility": true,
              "count_posts_today": 4,
              "order": 5,
              "count_posts": 587,
              "count_threads": 72,
              "type": "forum",
              "parentid": "74",
              "abbr": "空间",
              "tCount": {
                "digest": 6,
                "normal": 72
              },
              "display_name": "空间技术",
              "description": "人造卫星、宇宙飞船、太空探索",
              "color": "#ef869b",
              "moderators": [
                "6688"
              ],
              "_id": "forums/366",
              "_rev": "45636215056675",
              "_key": "366"
            },
            {
              "visibility": true,
              "count_posts_today": 0,
              "order": 50,
              "count_posts": 3130,
              "count_threads": 214,
              "type": "forum",
              "parentid": "74",
              "abbr": "航空",
              "tCount": {
                "digest": 4,
                "normal": 214
              },
              "display_name": "航空技术",
              "description": "大气层中的飞行技术和救生技术。",
              "moderators": [],
              "_id": "forums/165",
              "_rev": "45636179208483",
              "_key": "165"
            }
          ]
        },
        {
          "parentforum": {
            "visibility": true,
            "isVisibleForNCC": true,
            "count_posts_today": 0,
            "order": 25,
            "parentid": "0",
            "icon_filename": "g-4",
            "tCount": {
              "digest": 0,
              "normal": 0
            },
            "display_name": "化学院",
            "type": "category",
            "description": "化学是研究分子尺度物理规律的学科。本学院包括化学及其应用技术，化学工程和工艺学，以及像火炸药这样的专门研究领域。本院的大部分学科需要通过论坛的统一考试才能加入。",
            "color": "#ea9b3d",
            "moderators": [],
            "_id": "forums/113",
            "_rev": "45636150503715",
            "_key": "113"
          },
          "forumgroup": [
            {
              "visibility": true,
              "count_posts_today": 14,
              "order": 1,
              "count_posts": 20455,
              "count_threads": 1638,
              "type": "forum",
              "parentid": "113",
              "abbr": "化学",
              "tCount": {
                "digest": 42,
                "normal": 1638
              },
              "display_name": "化学化工",
              "description": "化学、化工爱好者烧香/续命/报平安专区。",
              "color": "#AC049F",
              "moderators": [
                "29629"
              ],
              "_id": "forums/83",
              "_rev": "45636227967267",
              "_key": "83"
            }
          ]
        },
        {
          "parentforum": {
            "class": null,
            "visibility": true,
            "isVisibleForNCC": true,
            "count_posts_today": 0,
            "order": 26,
            "icon_filename": "g-1",
            "tCount": {
              "digest": 0,
              "normal": 0
            },
            "display_name": "生科院",
            "type": "category",
            "description": "与生物和生命活动相关的科学技术领域，包括化学基础，分子生物学，细胞生物学，动植物学，遗传学，动植物保护，农艺学等相关学科，也包括像动物养殖、花卉栽培这样的专门爱好。对于相关技术尤其是现代电子技术、自动控制技术、科学仪器领域的新手段等在生物与农业中的应用需重点关注。",
            "color": "#5cb55a",
            "moderators": [],
            "_id": "forums/208",
            "_rev": "45636151552291",
            "_key": "208"
          },
          "forumgroup": [
            {
              "class": null,
              "visibility": true,
              "count_posts_today": 0,
              "order": 1,
              "count_posts": 824,
              "count_threads": 56,
              "display_name": "生物",
              "type": "forum",
              "parentid": "208",
              "abbr": "生物",
              "tCount": {
                "digest": 2,
                "normal": 56
              },
              "description": "生物版开张啦！",
              "moderators": [
                "3613"
              ],
              "_id": "forums/210",
              "_rev": "45636180912419",
              "_key": "210"
            },
            {
              "class": null,
              "visibility": true,
              "count_posts_today": 19,
              "order": 50,
              "count_posts": 3567,
              "count_threads": 253,
              "display_name": "农业",
              "type": "forum",
              "parentid": "208",
              "tCount": {
                "digest": 21,
                "normal": 253
              },
              "description": "农业学大寨",
              "color": "#c5b43c",
              "moderators": [
                "138"
              ],
              "_id": "forums/209",
              "_rev": "45636223314211",
              "_key": "209"
            },
            {
              "class": null,
              "visibility": true,
              "isVisibleForNCC": true,
              "count_posts_today": 37,
              "count_posts": 70,
              "count_threads": 2,
              "order": "51",
              "display_name": "健康",
              "type": "forum",
              "parentid": "208",
              "abbr": "健康",
              "tCount": {
                "digest": 1,
                "normal": 2
              },
              "description": "健康知识，医学与医疗技术，公共卫生方面的话题。",
              "color": "#DF4252",
              "moderators": [],
              "_id": "forums/221",
              "_rev": "45636210731299",
              "_key": "221"
            }
          ]
        },
        {
          "parentforum": {
            "visibility": true,
            "isVisibleForNCC": true,
            "count_posts_today": 0,
            "order": 28,
            "parentid": "0",
            "icon_filename": "g-10",
            "tCount": {
              "digest": 0,
              "normal": 0
            },
            "display_name": "商学院",
            "type": "category",
            "description": "与科研和技术相关的经济学和商业活动。也包括项目发标，新产品发布，套件销售和服务，人才招聘、求职就业等方面的信息。",
            "color": "#A770DC",
            "moderators": [],
            "_id": "forums/159",
            "_rev": "45636226722083",
            "_key": "159"
          },
          "forumgroup": [
            {
              "class": null,
              "visibility": true,
              "count_posts_today": 0,
              "order": 1,
              "count_posts": 319,
              "count_threads": 22,
              "type": "forum",
              "parentid": "159",
              "abbr": "商业",
              "tCount": {
                "digest": 6,
                "normal": 22
              },
              "display_name": "商业纵横",
              "description": "工商业综合交流研讨区",
              "moderators": [],
              "_id": "forums/217",
              "_rev": "45636227115299",
              "_key": "217"
            },
            {
              "class": null,
              "count_posts_today": 6,
              "order": 3,
              "count_posts": 12064,
              "count_threads": 975,
              "type": "forum",
              "parentid": "159",
              "abbr": "经济",
              "tCount": {
                "digest": 0,
                "normal": 1
              },
              "display_name": "经济学",
              "description": "交流经济学的基本原理，发布经济学的专业文章和话题。",
              "moderators": [
                "138"
              ],
              "_id": "forums/96",
              "_rev": "45636229933347",
              "_key": "96"
            },
            {
              "class": null,
              "visibility": true,
              "count_posts_today": 53,
              "order": 5,
              "count_posts": 31454,
              "count_threads": 2987,
              "type": "forum",
              "parentid": "159",
              "abbr": "货场",
              "tCount": {
                "digest": 0,
                "normal": 2987
              },
              "display_name": "自由市场",
              "description": "请给我来一瓶74年的硫酸。那边那位女士也来一瓶。",
              "color": "#70a6dc",
              "moderators": [],
              "_id": "forums/97",
              "_rev": "45636226853155",
              "_key": "97"
            },
            {
              "visibility": true,
              "count_posts_today": 22,
              "order": 7,
              "count_posts": 3262,
              "count_threads": 138,
              "type": "forum",
              "parentid": "159",
              "abbr": "产品",
              "tCount": {
                "digest": 1,
                "normal": 138
              },
              "display_name": "产品发布",
              "description": "DIY套件、产品的发布、交易；量产前众筹。",
              "moderators": [],
              "_id": "forums/182",
              "_rev": "45636230981923",
              "_key": "182"
            },
            {
              "visibility": true,
              "count_posts_today": 0,
              "order": 10,
              "count_posts": 179,
              "count_threads": 29,
              "type": "forum",
              "parentid": "159",
              "abbr": "需求",
              "tCount": {
                "digest": 0,
                "normal": 29
              },
              "display_name": "合作洽谈",
              "description": "开发产品或服务的需求可以在这里发包，包括团队征集和人员招聘。",
              "moderators": [],
              "_id": "forums/365",
              "_rev": "45636177635619",
              "_key": "365"
            }
          ]
        },
        {
          "parentforum": {
            "visibility": true,
            "isVisibleForNCC": true,
            "count_posts_today": 0,
            "order": 35,
            "parentid": "0",
            "tCount": {
              "digest": 0,
              "normal": 0
            },
            "display_name": "配套区",
            "type": "category",
            "description": "为没人注意但影响不可忽视的问题提供服务。例如心理问题、民科问题等。",
            "color": "#383838",
            "moderators": [],
            "_id": "forums/126",
            "_rev": "45636148668707",
            "_key": "126"
          },
          "forumgroup": [
            {
              "class": null,
              "visibility": true,
              "count_posts_today": 47,
              "order": 3,
              "count_posts": 9411,
              "count_threads": 786,
              "type": "forum",
              "parentid": "126",
              "abbr": "江科",
              "tCount": {
                "digest": 1,
                "normal": 786
              },
              "display_name": "江湖科学",
              "description": "真理不辩不明，真相不捅不穿。江湖科学帖和一切“民科”帖请在此发表！",
              "moderators": [],
              "_id": "forums/115",
              "_rev": "45636232948003",
              "_key": "115"
            }
          ]
        }
      ],
      "replytarget": "t/82376",
      "ads": [
        "82312",
        "82340",
        "82333",
        "82282",
        "80787",
        "65452"
      ],
      "userThreads": []
    };
    await next();
  })
  .use('/:tid', operationRouter.routes(), operationRouter.allowedMethods());
module.exports = threadRouter;
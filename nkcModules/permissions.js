

var operations = require('./api_operations');
var table = operations.table;

var permissions = {};

var timeHour = 3600*1000;
var timeDay = timeHour*24;
var timeMonth = timeDay*30;
var timeYear = timeDay*365;

//证书，每张证书将包含不同的权限
var certificates={
  dev:{
    display_name:'运维',
    inheritFrom:['editor'],

    permittedOperations:{
      deleteElseQuestions:true,
      postsysinfo: true,
    },
    // see end of api_operations.js
  },
  editor:{
    display_name:'编辑',
    inheritFrom:['senior_moderator'],

    contentClasses:{
      administrative:true
    },

    permittedOperations:{
      viewQuestions:true,
      addQuestion:true,
      deleteQuestion:true,
      getQuestion:true,

      listAllQuestions:true, //important, with this you can modify categories of questions

      elseModifyTimeLimit:timeYear*20, //20y
      selfModifyTimeLimit:timeYear*20, //20y

      toggleDigestAllThreads:true,
      toggleToppedAllThreads:true,
      kamikaze:true,

      banUser:true,
      unbanUser:true,

      modifyThreadType:true,
      popPFSwitch: true,
      adSwitch: true
    }
  },

  qc:{
    display_name:'题委',

    permittedOperations:{
      viewQuestions:true,

      addQuestion:true,

      getQuestion:true,
    }
  },

  senior_moderator:{
    display_name:'责任版主',
    inheritFrom:['moderator'],

    permittedOperations:{
      moveAllThreads:true,
      toggleAllPosts:true,
      editAllThreads:true,
    }
  },

  moderator:{
    display_name:'版主',
    inheritFrom:['scholar'],

    contentClasses:{
      classified:true,
    },

    permittedOperations:{
      viewBehaviorLogs: true,
      viewNewUsers: true,

      moveToPersonalForum: true,
      addThreadToCart:true,
      addPostToCart:true,
      setDigest:true,

      selfModifyTimeLimit:timeYear*20, //20y
      elseModifyTimeLimit:timeYear*20, //20y

      viewExperimental:true,

      disablePost:true,
      enablePost:true,

      toggleOwnedPosts:true,
      toggleDigestOwnedThreads:true,
      toggleToppedOwnedThreads:true,

      moveThread:true,
      moveOwnedThreads:true,


      pullNewPosts24h:true,
      setTopped:true,

      banUser:true,

      addCredit:true,
    }
  },

  scholar:{ //学者，1学分为限。
    display_name:'学者',
    inheritFrom:['examinated','qc'],

    contentClasses:{
      sensitive:true,
    },

    permittedOperations:{
      selfModifyTimeLimit:timeYear*3,//3y
      //elseModifyTimeLimit:timeMonth*2,//2m

      viewPostHistory:true,
    }
  },

  examinated:{
    display_name:'进士',
    inheritFrom:['default'],
    contentClasses:{
      professional:true,
    },
    permittedOperations:{
      getPostContent:true,
      testExaminated:true,
      selfModifyTimeLimit:timeMonth*3, //3m
      //elseModifyTimeLimit:timeHour*4,//4h

      getStatDaily:true,

      getLatestPosts:true,
    }
  },

  mobile:{
    display_name:'机友',
    inheritFrom:['default'],
    contentClasses:{

    },
    permittedOperations:{
      getPostContent:true,
      selfModifyTimeLimit:timeHour*1,
    }
  },

  mail:{
    display_name:'笔友',
    inheritFrom:['default'],
    contentClasses:{

    },
    permittedOperations:{
      //postTo:true,  //发帖
      getPostContent:true,
      selfModifyTimeLimit:timeHour*1,
    }
  },

  default:{ //default cert every user share
    display_name:'会员',
    inheritFrom:['visitor'],

    contentClasses:{
      images:true,
      non_images:true,
      non_public:true,
      non_broadcast:true,
    },
    permittedOperations:{
      postTo:true,
      postNewMessage: true,
      getMcode3: true,
      bindMobile: true,
      switchTInPersonalForum: true,
      switchDInPersonalForum: true,
      switchVInPersonalForum: true,
      configPersonalForum: true,
      viewSMS:true,
      sendShortMessageByUsername:true,

      listCart:true,
      clearCart:true,
      recommendPost: true,
      unrecommendPost: true,
      subscribeUser: true,
      unsubscribeUser: true,
      subscribeForum: true,
      unsubscribeForum: true,
      //postTo:true, //////////////////////////////////// may cancel in the future
      //getPostContent:true,/////////////////////////////

      selfModifyTimeLimit:timeHour*0.5, //30min

      getPost:true,

      viewMe:true,

      userLogout:true,


      userRegister:false,

      getResourceOfCurrentUser:true,

      changePassword:true,

      viewPersonal:true,

      submitPersonalSetting:true,

      viewSelf:true,

      addThreadToCollection:true,
      listMyCollectionOfCategory:true,
      listMyCategories:true,
      removeCollectionItem:true,
      moveCollectionItemToCategory:true,

      getForumCategories:true,
      getForumsOfZone:true,
      viewSubscribe:true,//查看订阅与被订阅页面
    },
  },

  visitor:{ //public
    display_name:'陆游',
    contentClasses:{
      null:true,
      images:true,
      non_images:false,
      non_public:false,
    },
    permittedOperations:{
      viewLatest: true,
      viewPersonalActivities: true,
      viewEditor:true,
      viewThread:true,
      viewForum:true,
      viewHome:true,
      viewUser:true,
      viewPersonalForum:true, ////////////////these are for test purpose only
      //move to visitor afterwards

      useSearch:true,
      viewLocalSearch:true,
      //localSearch:true,  //搜索

      viewExam:true,
      submitExam:true,

      viewRegister:true,
      viewRegister2:true,  //访问邮箱注册页面
      userRegister:true,

      userLogin:true,
      viewLogin:true,

      viewLogout:true,

      viewPanorama:true,
      viewCollectionOfUser:true,

      getResourceThumbnail:true,
      getResource:true,

      exampleOperation:true,

      getGalleryRecent:true,
      getForumsList: true,

      viewPage:true,
      viewTemplate:true,

      receiveMobileMessage:true,
      getRegcodeFromMobile:true,

      forgotPassword:true,
      newPasswordWithToken:true,
      pchangePassword:true,  //手机号修改密码
      viewForgotPassword:true,
      viewForgotPassword2:true,  //手机找回密码

      getMcode:true,  //注册获取手机验证码
      getMcode2:true,  //找回密码的手机验证码
      userPhoneRegister:true,  //手机用户注册
      userMailRegister:true,  //邮箱注册
      refreshicode:true,  //刷新图片验证码
      refreshicode3:true,  //刷新图片验证码
      viewActiveEmail:true,  //邮箱激活
    }
  },

  banned:{
    display_name:'开除学籍',
    inheritFrom:['visitor'],

    contentClasses:{
      non_public:false,
      non_images:false,
      non_public:false,
    },
    submitPersonalSetting:false,
    permittedOperations:{
      postTo:false,
      viewExam:false,
      submitExam:false,
      viewMe:true,
    },
  },
};

function getDisplayNameOfCert(cert){
  return (certificates[cert]?certificates[cert].display_name:'')
}
permissions.getDisplayNameOfCert = getDisplayNameOfCert

//certs is [] of certificate names
var getPermissionsFromCerts = (certsArray)=>{
  var permittedOperations={};
  var contentClasses={};

  if(certsArray.indexOf('banned')>=0){
    certsArray = ['banned'];
  }

  for(i in certsArray)
  {
    var certName = certsArray[i]
    //local ver of permittedOperations and contentClasses
    var lpo = {}
    var lcc = {}

    var certificate = certificates[certName];

    if(!certificate)continue; //ignore undefined certificates

    //recursive inheritance.
    if(certificate.inheritFrom){
      var c = getPermissionsFromCerts(certificate.inheritFrom)

      Object.assign(lpo,c.permittedOperations)
      Object.assign(lcc,c.contentClasses)
    }

    Object.assign(lpo,certificate.permittedOperations)
    Object.assign(lcc,certificate.contentClasses)

    //obj assign equivalent
    for(name in lpo){
      if((typeof permittedOperations[name]) == 'number'){

        permittedOperations[name] =
        Math.max(permittedOperations[name] ,lpo[name])

        //obtain max of numbers, if is number.
      }
      else{
        permittedOperations[name] = lpo[name]
      }
    }

    Object.assign(contentClasses,lcc)
  }

  if(contentClasses['null']){
    contentClasses['']=true
  }
  return {
    permittedOperations,
    contentClasses,
  }
};

permissions.getPermissionsFromCerts = getPermissionsFromCerts

permissions.getPermissionsFromUser = function(user){
  var certs = calculateThenConcatCerts(user)
  return getPermissionsFromCerts(certs)
}

permissions.listAllCertificates = ()=>{
  var all = []
  for(i in certificates){
    all.push(i)
  }
  return all;
}

permissions.testModifyTimeLimit = function(params,ownership,toc){

  var smtl = params.permittedOperations.selfModifyTimeLimit
  var emtl = params.permittedOperations.elseModifyTimeLimit

  smtl = smtl||0
  emtl = emtl||0

  // if you can modify others in 1y,
  // you should be able to do that to yourself,
  // regardless of settings. // wtf r u talking about   wtf r u talking about!!!! --lzszone
  if(smtl<emtl){
    smtl = emtl
  }

  //--test ownership--
  if(ownership){
    // if he own the post
    if(Date.now() < toc + smtl){
      //not exceeding
    }else{
      throw('You can only modify your post within '+ (smtl/1000/60).toFixed(2) + ' hour(s)')
    }
  }else{
    if(Date.now() < toc + emtl){
      //not exceeding
    }else{
      throw('You can only modify others\' post within '+ (emtl/1000/60).toFixed(2) + ' hour(s)')
    }
  }
}

var calculateThenConcatCerts = function(user){
  if(!user)return ['visitor']

  if(!user.certs){
    user.certs =  []
  }

  var certs = ['default'].concat(user.certs)
  //-----------------------below are calculated permissions
  if(user.xsf > 0){
    certs.push('scholar')
  }

  return certs
}

let getContentClassesByCert = cert => {
  let classes = [];
  let certificate = certificates[cert];
  if(certificate.contentClasses) {
    let contentClasses = certificate.contentClasses;
    for(attr in contentClasses) {
      if(contentClasses[attr]) {
        classes.push(attr)
      }
    }
  }
  if(certificate.inheritFrom) {
    let inheritClasses = getContentClassesByCerts(certificate.inheritFrom);
    classes = classes.concat(inheritClasses)
  }
  return classes;
};

let getContentClassesByCerts = certs => {
  let classes = [];
  let arr = certs.map(cert => getContentClassesByCert(cert));
  for(let contentClasses of arr) {
    classes = classes.concat(contentClasses);
  }
  return classes;
};

permissions.getContentClassesByCerts = getContentClassesByCerts;

permissions.calculateThenConcatCerts = calculateThenConcatCerts

permissions.certificates = certificates
module.exports = permissions;

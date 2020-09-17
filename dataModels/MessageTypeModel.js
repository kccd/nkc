const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: String,
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  /* templates模板对象格式
  {
    type: "digestThread",
    content: "您的文章[link=threadURL(threadTitle)]已被列入精选。",
    parameters: [
      "threadTitle",
      "threadID",
      "threadURL"
    ]
  }
  * */
  templates: []
}, {
  collection: "messageTypes"
});

/*
* 加载消息模板信息
* */

const getDomByType = (t) => {
  let prefix = "item.c.";
  if(t === "threadTitle") {
    return "item.c.thread.firstPost.t"
  } else if(t === "threadURL") {
    return "'/t/' + item.c.thread.tid"
  } else if(t === "threadID") {
    return "item.c.thread.tid"
  } else if(t === "postContent") {
    return "item.c.post.c"
  } else if(t === "postURL") {
    return "item.c.post.url"
  } else if(t === "postID") {
    return "item.c.post.pid"
  } else if(t === "reason") {
    return "item.c.rea"
  } else if(t === "userID") {
    return "item.c.user?item.c.user.uid:''"
  } else if(t === "userURL") {
    return "item.c.user?'/u/' + item.c.user.uid: ''"
  } else if(t === "username") {
    return "item.c.user?item.c.user.username:'匿名用户'"
  } else if(t === "editPostURL") {
    return "'/editor?type=post&id=' + item.c.post.pid"
  } else if(t === "editThreadURL") {
    return "'/editor?type=post&id=' + item.c.thread.oc"
  } else if(t === "deadline") {
    return "item.c.deadline"
  } else if(t === "userAuthApplyURL") {
    return "'/u/' + item.c.user.uid + '/auth'";
  } else if(t === "sellerOrderListURL") {
    return "'/shop/manage/order'";
  } else if(t === "buyerOrderURL") {
    return "'/shop/order/' + item.c.order.orderId + '/detail'";
  } else if(t === "orderID") {
    return "item.c.order.orderId";
  } else if(t === "sellerOrderURL") {
    return "'/shop/manage/' + item.c.user.uid + '/order/detail?orderId=' + item.c.order.orderId"
  } else if(t === "buyerOrderRefundURL") {
    return "'/shop/order/' + item.c.order.orderId + '/refund'";
  } else if(t === "sellerOrderRefundURL") {
    return "'/shop/manage/' + item.c.user.uid + '/order/refund?orderId=' + item.c.order.orderId"
  } else if(t === "postContent") {
    return "item.c.post.c"
  } else if(t === "reviewLink") {
    return "item.c.post.pid === item.c.thread.oc?item.c.thread.url:item.c.post.url"
  } else if(t === "applicationFormURL") {
    return "item.c.applicationForm.url"
  } else if(t === "applicationFormID") {
    return "item.c.applicationForm._id"
  } else if(t === "applicationFormCode") {
    return "item.c.applicationForm.code"
  } else if(t === "xsfCount") {
    return "item.c.num"
  } else if(t === "columnContributeURL") {
    return "'/m/' + item.c.column._id + '/settings/contribute'";
  } else if(t === "userContributeURL") {
    return "'/account/contribute'"
  } else if(t === "columnURL") {
    return "'/m/' + item.c.column._id"
  } else if(t === "columnName") {
    return "item.c.column.name"
  } else if(t === "columnInfoType") {
    return "{'notice': '公告通知', 'otherLinks': '友情链接', 'blocks': '自定义内容', " +
      "'name': '专栏名', 'abbr': '专栏简介', 'logo': 'logo', 'banner': 'banner'}[item.c.columnInfoType]"
  } else if(t === "activityUrl") {
    return "'/activity/single/' + item.c.activity.acid"
  } else if(t === "activityTitle") {
    return "item.c.activity.activityTitle"
  } else if(t === "noticeContent") {
    return "item.c.content"
  } else if(t === "cTitle") {
    return "item.c.cTitle"
  } else if (t === "problemURL") {
    return "'/u/' + item.c.problem.uid + '/myProblems/' + item.c.problem._id"
  } else if (t === "problemTitle") {
    return "item.c.problem.t"
  } else if (t === "restorerURL") {
    return "'/u/' + item.c.restorer.uid"
  } else if (t === "restorerName") {
    return "item.c.restorer.username"
  }

  // kcb鼓励相关
  else if(t === "scoreNumber") {
    return "item.c.number / 100"
  } else if(t === "username") {
    return "item.c.user.username"
  } else if(t === "description") {
    return "item.c.description"
  } else if(t === "scoreName") {
    return "item.c.scoreName"
  }

  // 新增点赞相关
  else if(t === "partOfUsernames") {
    return "item.c.partOfUsernames";
  } else if(t === "total") {
    return "item.c.total";
  }

  // 投诉处理通知相关
  else if(t === "CRType") {
    return prefix + "CRType";
  } else if(t === "CRTarget") {
    return prefix + "CRTarget";
  } else if(t === "CRTargetDesc") {
    return prefix + "CRTargetDesc";
  } else if(t === "CRReason") {
    return prefix + "reasonDescription";
  } else if(t === "CRResult") {
    return prefix + "result";
  }
};
const getAppVueDom = (template) => {
  let {content, parameters} = template;
  content = content.replace(/\n/ig, "<br>");
  content = content.replace(/\s/ig, "&nbsp;");
  content = content.replace(/\[url=(.*?)\((.*?)\)]/ig, (v1, v2, v3) => {
    let url, name;
    if(!parameters.includes(v2)) {
      url = `'${v2}'`;
    } else {
      url = getDomByType(v2);
    }
    if(!parameters.includes(v3)) {
      name = `'${v3}'`;
    } else {
      name = getDomByType(v3);
    }
    return `&nbsp;<a @click="openNewTarget(${url})" target="_blank" style="color:#2b90d9"><b>{{${name}}}</b></a>&nbsp;`
  });
  content = content.replace(/\[text=(.*?)]/ig, (v1, v2) => {
    let text;
    if(!parameters.includes(v2)) {
      text = `'${v2}'`;
    } else {
      text = getDomByType(v2);
    }
    return `&nbsp;<b>{{${text}}}</b>&nbsp;`
  });
  return content;
};
const getWebVueDom = (template) => {
  let {content, parameters} = template;
  content = content.replace(/\n/ig, "<br>");
  content = content.replace(/\s/ig, "&nbsp;");
  content = content.replace(/\[url=(.*?)\((.*?)\)]/ig, (v1, v2, v3) => {
    let url, name;
    if(!parameters.includes(v2)) {
      url = `'${v2}'`;
    } else {
      url = getDomByType(v2);
    }
    if(!parameters.includes(v3)) {
      name = `'${v3}'`;
    } else {
      name = getDomByType(v3);
    }
    return `&nbsp;<a :href="${url}" target="_blank"><b>{{${name}}}</b></a>&nbsp;`
  });
  content = content.replace(/\[text=(.*?)]/ig, (v1, v2) => {
    let text;
    if(!parameters.includes(v2)) {
      text = `'${v2}'`;
    } else {
      text = getDomByType(v2);
    }
    return `&nbsp;<b>{{${text}}}</b>&nbsp;`
  });
  return content;
};


schema.statics.getTemplates = async (type) => {
  const MessageTypeModel = mongoose.model("messageTypes");
  const messageTypes = await MessageTypeModel.find();
  const results = [];
  for(const messageType of messageTypes) {
    const {_id, templates, description, name} = messageType;
    const obj = {
      _id,
      name,
      description,
      templates: []
    };
    for(const t of templates) {
      obj.templates.push({
        type: t.type,
        dom: type==="web"?getWebVueDom(t):getAppVueDom(t)
      });
    }
    results.push(obj);
  }
  return results;
};

schema.statics.getValue = (key, c) => {
  try{
    switch(key) {
      case 'threadTitle':
        return c.thread.firstPost.t
      case 'threadURL':
        return `/t/${c.thread.tid}`
      case 'threadID':
        return c.thread.tid
      case 'postContent':
        return c.post.c
      case 'postURL':
        return c.post.url
      case 'postID':
        return c.post.pid
      case 'reason':
        return c.rea
      case 'userID':
        return c.user? c.user.uid: ''
      case 'userURL':
        return c.user? `/u/${c.user.uid}`: ''
      case 'username':
        return c.user? c.user.username || c.user.uid: '匿名用户'
      case 'editPostURL':
        return `/editor?type=post&id=${c.post.pid}`
      case 'editThreadURL':
        return `/editor?type=post&id=${c.thread.oc}`
      case 'deadline':
        return c.deadline
      case 'userAuthApplyURL':
        return `/u/${c.user.uid}/auth`
      case 'sellerOrderListURL':
        return `/shop/manage/order`
      case 'buyerOrderURL':
        return `/shop/order/${c.order.orderId}/detail`
      case 'orderID':
        return c.order.orderId
      case 'sellerOrderURL':
        return `/shop/manage/${c.user.uid}/order/detail?orderId=${c.order.orderId}`
      case 'buyerOrderRefundURL':
        return `/shop/order/${c.order.orderId}/refund`
      case 'sellerOrderRefundURL':
        return `/shop/manage/${c.user.uid}/order/refund?orderId=${c.order.orderId}`
      case 'reviewLink':
        return c.post.pid === c.thread.oc?c.thread.url:c.post.url
      case 'applicationFormURL':
        return c.applicationForm.url
      case 'applicationFormID':
        return c.applicationForm._id
      case 'applicationFormCode':
        return c.applicationForm.code
      case 'xsfCount':
        return c.num
      case 'columnContributeURL':
        return `/m/${c.column._id}/settings/contribute`
      case 'userContributeURL':
        return `/account/contribute`
      case 'columnURL':
        return `/m/${c.column._id}`
      case 'columnName':
        return c.column.name
      case 'columnInfoType':
        return {
          'notice': '公告通知',
          'otherLinks': '友情链接',
          'blocks': '自定义内容',
          'name': '专栏名',
          'abbr': '专栏简介',
          'logo': 'logo',
          'banner': 'banner'
        }[c.columnInfoType]
      case 'activityUrl':
        return `/activity/single/${c.activity.acid}`
      case 'activityTitle':
        return c.activity.activityTitle
      case 'noticeContent':
        return c.content
      case 'cTitle':
        return c.cTitle
      case 'problemURL':
        return `/u/${c.problem.uid}/myProblems/${c.problem._id}`
      case 'problemTitle':
        return c.problem.t
      case 'restorerURL':
        return `/u/${c.restorer.uid}`
      case 'restorerName':
        return c.restorer.username

      // kcb鼓励相关
      case 'scoreNumber':
        return c.number / 100
      case 'description':
        return c.description
      case 'scoreName':
        return c.scoreName

      //点赞相关
      case 'partOfUsernames':
        return c.partOfUsernames
      case 'total':
        return c.total

      // 投诉相关
      case 'CRType':
        return c.CRType
      case 'CRTarget':
        return c.CRTarget
      case 'CRTargetDesc':
        return c.CRTargetDesc
      case 'CRReason':
        return c.reasonDescription
      case 'CRResult':
        return c.result
      default: return key;
    }
  } catch(err) {
    return `${key}:${err.message || err}`;
  }
}

module.exports = mongoose.model("messageTypes", schema);

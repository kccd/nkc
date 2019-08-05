const mongoose = require('mongoose');
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
/*
if(app) {
  if(t === "threadTitle") {
    return "item.c.thread.firstPost.t"
  } else if(t === "threadURL") {
    return "openThread(item.c.thread.tid)";
  } else if(t === "threadID") {
    return "item.c.thread.tid"
  } else if(t === "postContent") {
    return "item.c.post.c"
  } else if(t === "postURL") {
    return "openThread(item.c.post.tid)";
  } else if(t === "postID") {
    return "item.c.post.pid"
  } else if(t === "reason") {
    return "item.c.rea"
  } else if(t === "userID") {
    return "item.c.user.uid"
  } else if(t === "userURL") {
    return "openUserHome(item.c.user.uid)";
  } else if(t === "username") {
    return "item.c.user.username"
  } else if(t === "editPostURL") {
    return "openThread(item.c.post.tid)";
  } else if(t === "editThreadURL") {
    return "openThread(item.c.thread.tid)";
  } else if(t === "deadline") {
    return "item.c.deadline";
  } else if(t === "userAuthApplyURL") {
    return "openUserHome(item.c.user.uid)";
  } else if(t === "sellerOrderListURL") {
    return "";
  } else if(t === "buyerOrderURL") {
    return "";
  } else if(t === "orderID") {
    return "item.c.order.orderId";
  } else if(t === "sellerOrderURL") {
    return ""
  } else if(t === "buyerOrderRefundURL") {
    return "";
  } else if(t === "sellerOrderRefundURL") {
    return ""
  } else if(t === "postContent") {
    return "item.c.post.c"
  } else if(t === "reviewLink") {
    return "openThread(item.c.thread.tid)"
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
    return "'/u/' + item.r + '/contribute'"
  } else if(t === "columnURL") {
    return "'/m/' + item.c.column._id"
  } else if(t === "columnName") {
    return "item.c.column.name"
  }
}

*/
const getDomByType = (t) => {
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
    return "item.c.user.uid"
  } else if(t === "userURL") {
    return "'/u/' + item.c.user.uid"
  } else if(t === "username") {
    return "item.c.user.username"
  } else if(t === "editPostURL") {
    return "'/editor?type=post&id=' + item.c.post.pid"
  } else if(t === "editThreadURL") {
    return "'/editor?type=post&id=' + item.c.thread.oc"
  } else if(t === "deadline") {
    return "item.c.deadline"
  } else if(t === "userAuthApplyURL") {
    return "'/u/' + item.c.user.uid + '/auth'";
  } else if(t === "sellerOrderListURL") {
    return "'/shop/manage/' + item.c.user.uid + '/order'";
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
  }
};
// const getAppVueDom = (template) => {
//   let {content, parameters} = template;
//   content = content.replace(/\n/ig, "<br>");
//   content = content.replace(/\s/ig, "&nbsp;");
//   content = content.replace(/\[url=(.*?)\((.*?)\)]/ig, (v1, v2, v3) => {
//     let url, name;
//     if(!parameters.includes(v2)) {
//       url = `'${v2}'`;
//     } else {
//       url = getDomByType(v2, true);
//     }
//     if(!parameters.includes(v3)) {
//       name = `'${v3}'`;
//     } else {
//       name = getDomByType(v3, true);
//     }
//     return `&nbsp;<a style="color: #2b90d9;" @click="${url}" target="_blank"><b>{{${name}}}</b></a>&nbsp;`
//   });
//   content = content.replace(/\[text=(.*?)]/ig, (v1, v2) => {
//     let text;
//     if(!parameters.includes(v2)) {
//       text = `'${v2}'`;
//     } else {
//       text = getDomByType(v2, true);
//     }
//     return `&nbsp;<b>{{${text}}}</b>&nbsp;`
//   });
//   return content;
// };
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


module.exports = mongoose.model("messageTypes", schema);
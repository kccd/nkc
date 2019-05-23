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
  }

};
const getAppVueDom = () => {};
const getWebVueDom = (template) => {
  let {content, parameters} = template;
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
    return `<a :href="${url}" target="_blank">{{${name}}}</a>`
  });
  content = content.replace(/\[text=(.*?)]/ig, (v1, v2) => {
    let text;
    if(!parameters.includes(v2)) {
      text = `'${v2}'`;
    } else {
      text = getDomByType(v2);
    }
    return `<b>{{${text}}}</b>`
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
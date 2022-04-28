import {fileToBase64, blobToFile} from "../lib/js/file";
import {getDataById, resourceToHtml, strToObj} from "../lib/js/dataConversion";
import {getState} from '../lib/js/state';
import {
  RNVisitUrlAndClose,
  RNUpdateMusicListAndPlay,
  RNToast,
  RNConsoleLog,
  RNReloadWebview,
  RNSelectLocation, RNCloseWebview, RNWechatPay,
} from "../lib/js/reactNative";
import {visitUrl} from '../lib/js/pageSwitch';
import {logout, toLogin} from "../lib/js/account";
import {toChat} from "../lib/js/chat";
import {sweetAlert} from "../lib/js/sweetAlert";

var NKC = {
  methods: {},
  modules: {},
  instance: {},
  configs: {
    imageExt: ["jpg", "jpeg", "png", "svg", "gif", "webp"],
    audioExt: ["mp3"],
    videoExt: ["mp4"]
  },
  events: {},
  eventsLog: {},
  /*
  * 注册事件
  * @param {String} eventName 事件名称
  * @param {Function} callback 事件触发后执行该函数
  *   callback: @param {Data} 任何类型的数据，却决于NKC.emit发送的数据
  *             @param {Function} next 执行下一个注册此事件的函数
  * 例如：
  * 注册一个事件，在接受数据后触发
  * NKC.on("getData", function(data, next) {
  *   console.log(1);
  *   next();
  * });
  * NKC.on("getData", function(data, next) {
  *   console.log(2);
  *   next();
  * });
  * 触发事件
  * nkcAPI(url, GET)
  *   .then(function(data) {
  *     NKC.emit("getData", data);
  *   })
  *
  * */
  // 注册事件
  on: function(eventName, callback) {
    if(!NKC.events[eventName]) NKC.events[eventName] = [];
    NKC.events[eventName].push(callback);
  },
  //
  remove: function(eventName, callback) {
    var events = NKC.events[eventName] || [];
    for(var i = 0; i < events.length; i++) {
      var event = events[i];
      if(callback === event) {
        return events.splice(i, 1);
      }
    }
  },
  // 注册事件，只触发一次
  one: function(eventName, callback) {
    var _func = function(data, next) {
      callback(data, next);
      NKC.remove(_func);
    };
    NKC.on(eventName, _func);
  },
  // 注册事件，只触发一次
  // 如果事件在注册前已经触发过
  // 那么此事件在注册时会立即触发。
  oneAfter: function(eventName, callback) {
    if(NKC.eventsLog[eventName]) return callback(undefined, function(){});
    NKC.one(eventName, callback);
  },
  /*
  * 触发事件
  * @param {String} eventName 事件名
  * @param {Data} 发送的数据
  * */
  emit: function(eventName, data) {
    NKC.eventsLog[eventName] = true;
    var events = NKC.events[eventName] || [];
    var _events = events.concat([]);

    var func = function(arr, i) {
      if(i >= arr.length) return;
      var callback = arr[i];
      callback(data, function() {
        func(arr, i+1)
      });
    };
    func(_events, 0);
  }
};

const state = getState();

Object.assign(NKC.configs, state);

NKC.methods.getLoginStatus = function() {
  if(NKC.configs.isApp) {
    if(NKC.configs.platform === "apiCloud") {
      return !!appGetFromLocal("user");
    } else if(NKC.configs.platform === 'reactNative') {
      return !!NKC.configs.uid;
    }
  } else {
    return !!NKC.configs.uid;
  }
};

/*
* 判断运行环境
* */
NKC.methods.getRunType = function() {
  if(NKC.configs.isApp) {
    return "app"
  } else {
    return "web"
  }
};

/*
* 打开链接 兼容APP
* @param {String} url 链接
* @param {Boolean} blank 是否在后台打开
* @author pengxiguaa 2019-7-26
* */
NKC.methods.visitUrl = visitUrl;
/*
* 打开一个新页面并关闭当前页面，用于app发表内容后的跳转，跳转到新页面并关闭编辑器页。
* @param {String} url 链接
* */
NKC.methods.visitUrlAndClose = RNVisitUrlAndClose;

/*
* 根据年份和月份计算出当月的天数
* @param {Number} year 年份
* @param {Number} month 月份
* @return {Number} 当月天数
* @author pengxiguaa 2019-7-26
* */
NKC.methods.getDayCountByYearMonth = function(year, month) {
  year = parseInt(year);
  month = parseInt(month);
  var count;
  if(month === 2) {
    if((year%4 === 0 && year%100 !== 0) || year%400 === 0) {
      count = 29;
    } else {
      count = 28;
    }
  } else if([4,6,9,11].indexOf(month) !== -1) {
    count = 30
  } else {
    count = 31
  }
  return count;
};

/*
* base64转文件数据
* @param {Base64} data base64数据
* @return {Data} 文件数据
* @author pengxiguaa 2019-7-29
* */
NKC.methods.base64ToBlob = function(data) {
  var arr = data.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};
/*
* 文件数据转文件
* @param {Blob} blob 文件数据
* @param {String} fileName 文件名
* @return {File} 文件
* @author pengxiguaa 2019-7-29
* */
NKC.methods.blobToFile = blobToFile;
/*
* base64转文件对象
* @param {Base64} data base64数据
* @param {String} fileName 文件名
* @return {File} 文件对象
* @author pengxiguaa 2019-7-26
* */
NKC.methods.base64ToFile = function(data, fileName) {
  return NKC.methods.blobToFile(NKC.methods.base64ToBlob(data), fileName);
};

NKC.methods.fileToUrl = fileToBase64;

NKC.methods.strToObj = strToObj;
/*
* 获取藏在指定dom中的数据 数据由pug渲染函数objToStr组装
* @param {String} id dom元素的id
* @return {Object} 数据对象
* @author pengxiguaa 2019-7-29
* */
NKC.methods.getDataById = getDataById;
/*
* 滚动到指定元素
* @param {Dom} dom jquery dom
* @author pengxiguaa 2019-7-31
* */
NKC.methods.scrollToDom = function(dom) {
  if(!dom.length) return;
  var top = dom.offset().top;
  setTimeout(function() {
    $("html,body").animate({scrollTop: top-300}, 500);
  });
};
/*
* 给指定元素设置背景颜色 高亮
* @param {Dom} dom jquery dom
* @author pengxiguaa 2019-7-31
* */
NKC.methods.markDom = function(dom) {
  if(!dom.length) return;
  dom.css("background-color", "rgba(255, 251, 221, 1)");
  var colorValue = 2;
  var colorTimeout = setInterval(function() {
    colorValue -= 0.1;
    if(colorValue < 0) clearInterval(colorTimeout);
    dom.css("background-color", "rgba(255, 251, 221, "+(colorValue<1?colorValue:1)+")");
  }, 1000);
};
/*
* 字符串转base64
* @param {String} str 字符串
* @return {Base64} base64数据
* @author pengxiguaa 2019-8-12
* */
NKC.methods.strToBase64 = function(str) {
  return window.btoa(encodeURIComponent(str));
};
/*
* base64转字符串
* @param {Base64} base64数据
* @return {String} str 字符串
* @author pengxiguaa 2019-8-12
* */
NKC.methods.base64ToStr = function(base64) {
  return decodeURIComponent(window.atob(base64))
};
/*
* 退出登录
* 若游客有权限访问当前页面则退出后刷新当前页面，否则跳转到首页
* */
NKC.methods.logout = logout;
/* 返回查询IP信息的url
* @param {String} ip 需要查询的IP地址
* @return {String} 查询地址url
* @author pengxiguaa 2019-8-14
* */
NKC.methods.ipUrl = function(ip) {
  return "http://www.ip138.com/ips138.asp?ip="+ip+"&action=2";
};
/*
* 文件大小转换
* @param {Number} size 文件大小b
* @param {Number} digits 保留小数点后的位数
* @return {String} 转换后的值
* @author pengxiguaa 2019-8-27
* */
NKC.methods.getSize = function(size, digits) {
  return NKC.methods.tools.getSize(size, digits);
};
/*
* 获取随机颜色
* @return {String} 颜色16进制带#
* @author pengxiguaa 2019-29-25
* */
NKC.methods.getRandomColor = function() {
  var str = "0123456789abcdef";
  var color = "#";
  for(var i = 0; i < 6; i++) {
    var index = Math.round(Math.random()*15);
    color += str.slice(index, index + 1);
  }
  return color;
};
/*
* 资源对象转html
* @param {Object} resource 资源对象
* @return {String} html字符串
* @author pengxiguaa 2019-9-25
* */
NKC.methods.appResourceToHtml = function(resource) {
  // 兼容代码 为了兼容旧版app
  return nkcAPI("/r/" + resource.rid + "?d=object", 'GET')
    .then(function(data) {
      resource = data.resource;
      var mediaType = resource.mediaType;
      var type;
      if(mediaType === "mediaPicture") {
        type = "picture";
      } else if(mediaType === "mediaVideo") {
        type = "video";
      } else if(mediaType === "mediaAudio") {
        type = "audio";
      } else {
        type = "attachment";
      }
      return NKC.methods.resourceToHtml(type, resource.rid, resource.oname);
    })
    .catch(sweetError);
};
NKC.methods.resourceToHtml = resourceToHtml;


/*toAppLogin
* 跳转到登录/注册。手机端打开登录window，网页端打开登录弹窗。
* @param {String} type register: 打开注册页, login: 打开登录页。仅针对网页端，app无效。
* @author pengxiguaa 2019-9-25
* */
NKC.methods.toLogin = toLogin;

/*
  滚动页面
  @param {Object} optons
    @param {Number} top
    @param {Number} left
    @param {Dom} 设置滚动的dom元素, 默认window
    @param {String} behavior smooth: 平滑滚动, instant: 瞬间滚动（默认）
  @author pengxiguaa 2019-10-28
*/
NKC.methods.scrollTop = function(dom, distance) {
  if(dom) {
    if(typeof dom.scrollTo === "undefined") {
      dom = $(dom);
      dom.scrollTop(distance);
    } else {
      dom.scrollTo(0, distance);
    }
  } else {
    window.scrollTo(0, distance);
  }
};
/*
  本地存储
  @param {String} name 键名
  @param {Object} data 数据
  @author pengxiguaa 2019-10-29
*/
NKC.methods.saveToLocalStorage = function(name, data) {
  window.localStorage.setItem(name, JSON.stringify(data));
};
/*
  从本地存储中读取
  @param {String} name 键名
  @return {Object} 数据
  @author pengxiguaa 2019-10-29
*/
NKC.methods.getFromLocalStorage = function(name) {
  var data = window.localStorage.getItem(name);
  if(!data) return {};
  return JSON.parse(data);
};

/*
  从多个数组中取值，组成与原数组长度相同的不重复的新数组
  @param arr 原数组：
  [
    ['a', 'b', 'c'],
    [1, 2, 3],
    ['A', 'B', 'C'],
    ...
  ]
  @return 新数组：
  [
    ['a', 1, 'A'],
    ['a', 1, 'B'],
    ['a', 1, 'C'],
    ['a', 2, 'A'],
    ['a', 2, 'B'],
    ['a', 2, 'C'],
    ...
  ]
  @author https://www.cnblogs.com/liugang-vip/p/5985210.html
*/
NKC.methods.doExchange = function(arr) {
  var len = arr.length;
  // 当数组大于等于2个的时候
  if(len >= 2){
    // 第一个数组的长度
    var len1 = arr[0].length;
    // 第二个数组的长度
    var len2 = arr[1].length;
    // 2个数组产生的组合数
    var lenBoth = len1 * len2;
    //  申明一个新数组
    var items = new Array(lenBoth);
    // 申明新数组的索引
    var index = 0;
    for(var i = 0; i < len1; i++) {
      for(var j = 0; j < len2; j++) {
        if(arr[0][i] instanceof Array){
          items[index] = arr[0][i].concat(arr[1][j]);
        } else {
          items[index] = [arr[0][i]].concat(arr[1][j]);
        }
        index++;
      }
    }
    var newArr = new Array(len -1);
    for(var i = 2; i < arr.length; i++) {
      newArr[i-1] = arr[i];
    }
    newArr[0] = items;
    return NKC.methods.doExchange(newArr);
  }else if(len === 1) {
    return arr[0];
  } else {
    return arr;
  }
};

/*
* 批量 屏蔽或退修 post回复或文章
* @param {String/Array} pid postId或postId组成的数组
* */
NKC.methods.disabledPosts = function(pid) {
  var postsId = pid;
  if(typeof pid === "string"){
    postsId = [pid]
  }
  if(!pid || !postsId.length) return;
  if(!window.DisabledPost) {
    window.DisabledPost = new NKC.modules.DisabledPost();
  }
  window.DisabledPost.open(function(data) {
    var body = {
      postsId: postsId,
      reason: data.reason,
      remindUser: data.remindUser,
      violation: data.violation
    };
    var url;
    if(data.type === "toDraft") {
      url = "/threads/draft";
    } else {
      url = "/threads/recycle";
    }
    nkcAPI(url, "POST", body)
      .then(function() {
        screenTopAlert("操作成功");
        DisabledPost.close();
        DisabledPost.unlock();
      })
      .catch(function(data) {
        sweetError(data);
        DisabledPost.unlock();
      })
  });
};

/*
* 批量 屏蔽或退修 article回复或文章
* @param {String/Array} commentsId commentId或commentId组成的数组
* */
NKC.methods.disabledDocuments = function(id) {
  let comments = id;
  if(typeof id === "string" || typeof id === "number"){
    comments = [id];
  }
  if(!id || !comments.length) return;
  if(!window.DisabledPost) {
    window.DisabledPost = new NKC.modules.DisabledPost();
  }
  let commentArr = [];
  window.DisabledPost.open(function(data) {
    for(let i = 0; i < comments.length; i ++) {
      const docId = comments[i];
      commentArr.push({
        delType: data.type === 'toDraft'?'faulty':'disabled',
        docId,
        type: 'document',
        reason: data.reason,
        remindUser: data.remindUser,
        violation: data.violation
      });
    }
    submit(commentArr, 0)
      .then(() => {
        DisabledPost.close();
        DisabledPost.unlock();
      })
      .catch(() => {
        DisabledPost.unlock();
      });
    function submit(arr, index) {
      let d = arr[index];
      if(!d) return;
      return nkcAPI('/review', "PUT", d)
        .then(function() {
          screenTopAlert("操作成功");
          submit(commentArr, index + 1);
        })
        .catch(function(data) {
          sweetError(data);
          submit(commentArr, index + 1);
        })
    }
  });
};

/*
* 页面折叠记录位置
* 创建实例的时候记录位置
* 执行方法restore时跳转到之前记录的位置
* @author pengxiguaa 2020-3-4
* */
NKC.modules.PagePosition = function() {
  var self = this;
  self.fromTheBottom = $(document).height() - $(document).scrollTop();
  self.restore = function() {
    setTimeout(function() {
      var distance = $(document).height() - self.fromTheBottom;
      window.scrollTo(0, distance);
    }, 100);
  }
};

/*
* 发送短信验证码
* @param {String} type 验证码类型
* @return {Promise}
* @author pengxiguaa 2020-3-4
* */

NKC.methods.sendMobileCode = function(type) {
  return nkcAPI("/sendMessage/" + type, "POST")
};
/*
* 发送邮件验证码
* @param {String} type 验证码类型
* @return {Promise}
* @author pengxiguaa 2020-3-4
* */
NKC.methods.sendEmailCode = function(type) {
  return nkcAPI("/u/" + NKC.configs.uid + "/settings/email", "POST", {
    operation: type
  });
};


/**
 * ajax获取ip信息
 */
NKC.methods.getIpInfo = function(ip) {
	return nkcAPI("/ipinfo?ip=" + ip, "GET")
		.then(function(res) {return res.ipInfo})
		.then(function(info){
			if(!info) return sweetError("获取ip信息失败");
			return asyncSweetCustom("<p style='font-weight: normal;'>ip: "+ info.ip +"<br>位置: "+ info.location +"</p>")
		})
    .catch(sweetError)
};




// 处理emoji 20200401
// 将正文中的twemoji部分替换成emoji字符
NKC.methods.replaceTwemoji = function(content) {
  var parser = document.createElement("div");
  parser.innerHTML = content;
  $(parser)
    .find("[data-tag='nkcsource'][data-type='twemoji']")
    .each(function(index, imgElem) {
      $(imgElem).replaceWith(imgElem.dataset.char);
    });
  return parser.innerHTML;
};
// 将正文中的emoji字符替换成twemoji Img标签
// 依赖twemoji模块
NKC.methods.replaceEmojiChar = function(content) {
  return twemoji.replace(content, function(char) {
    var id = twemoji.convert.toCodePoint(char);
    return "<img data-tag='nkcsource' data-type='twemoji' data-id='"+ id +"' data-char='"+ char +"' src=\"/twemoji/2/svg/"+ id +".svg\">"
  })
};
// 将学术分隐藏的data-message属性加上
NKC.methods.addXsfDataMessage = function(content) {
  var parser = document.createElement("div");
  parser.innerHTML = content;
  $(parser)
    .find("[data-tag='nkcsource'][data-type='xsf']")
    .each(function(index, el){
      var id = $(el).attr("data-id");
      $(el).attr("data-message", "浏览这段内容需要" + id + "学术分(双击修改)");
    });
  return parser.innerHTML;
};

// 将指定 dom 中的文本节点中链接替换为 a 标签
// 输入空格或换行识别链接的代码在 /public/ueditor/ueditor.all.js 的 17905 行
NKC.methods.replaceDomTextUrl = function(dom) {
  if(dom.tagName.toLowerCase() === 'a') return;
  for(let i = 0; i < dom.childNodes.length; i++) {
    const node = dom.childNodes[i];
    if(node.nodeType === 1) {
      NKC.methods.replaceDomTextUrl(node);
    } else {
      NKC.methods.replaceTextNodeUrl(node);
    }
  }
};
// 将文本节点中链接替换为 a 标签
NKC.methods.replaceTextNodeUrl = function(textNode) {
  const urlReg = /(https?:\/\/)?([-0-9a-zA-Z]{1,256}\.)+([a-zA-Z]{2,6})\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i;
  const parentNode = textNode.parentNode;

  const findAElement = function(node, tagName) {
    if(!node) {
      return false;
    } else if(node.tagName && node.tagName.toLocaleString() === tagName) {
      return true;
    } else {
      return findAElement(node.parentNode)
    }
  };

  const matchUrl = function(node) {
    const textContent = node.textContent;
    var result = textContent.match(urlReg);
    if(result === null) return;
    var url = result[0];
    var domText = url;
    var index = result.index;

    var targetNode = node.splitText(index);
    var nextNode;
    if(targetNode.length > url.length) {
      nextNode = targetNode.splitText(url.length);
    }
    var urlDom = document.createElement('a');
    if(!/^https?:\/\//ig.test(url)) {
      url = 'http://' + url;
    }
    urlDom.setAttribute('href', url);
    urlDom.setAttribute('data-text', domText);
    urlDom.innerText = domText;
    parentNode.replaceChild(urlDom, targetNode);
    if(nextNode) {
      matchUrl(nextNode);
    }
  }

  matchUrl(textNode);
}

/**
 * ueditor设置内容和获取内容
 */
NKC.methods.ueditor = {
  // ueditor执行getContent时
  getContent: function(content){
    content = NKC.methods.replaceTwemoji(content);
    return content;
  },
  // ueditor执行setContent时
  setContent: function(html) {
    html = NKC.methods.replaceEmojiChar(html);
    html = NKC.methods.addXsfDataMessage(html);
    return html;
  },
  insertContent: function(html) {
    html = $("<div>"+html+"</div>");
    var span = html.find("span.nkc-hl");
    span.css({
      "background-color": "",
      "border-bottom": ""
    }).removeClass("nkc-hl");
    // 将文本节点中的链接替换成 a 标签
    NKC.methods.replaceDomTextUrl(html[0]);
    html = html.html();
    return html;
  },
  initDownloadEvent: function(editor) {
    window.socket.on('fileTransformProcess', (data) => {
      if(!editor || !editor.fireEvent) return;
      editor.fireEvent('updateImageState', {
        id: data.rid,
        state: data.state === 'fileProcessFinish',
        src: NKC.methods.tools.getUrl('resource', data.rid)
      });
    });
  }
};

/*
* 打开聊天页面
* */

NKC.methods.toChat = toChat;


/*
* app toast
* */

NKC.methods.appToast = function(data) {
  const content = data.message || data.error || data;
  const {isApp} = getState();
  if(isApp) {
    RNToast({content});
  } else {
    sweetAlert(content);
  }
}
/*
* app console.log
* */
NKC.methods.appConsoleLog = RNConsoleLog;
/*
* app reload webView
* */
NKC.methods.appReloadPage = function() {
  if(state.isApp) {
    RNReloadWebview();
  } else {
    window.location.reload();
  }
}

/*
* app select location
* */
NKC.methods.appSelectLocation = RNSelectLocation;
/*
*  close webView
* */
NKC.methods.appClosePage = RNCloseWebview;

/*
* 添加用户到黑名单
* @param {String} tUid 被拉黑用户的ID
* @param {String} form 拉黑途径 message, userCard, post
* @param {String} pid from=post时所对应的post ID
* */
NKC.methods.addUserToBlacklist = function(tUid, from, pid) {
  var isFriend = false, subscribed = false;
  return Promise.resolve()
    .then(function() {
      return nkcAPI('/blacklist?tUid=' + tUid,  'GET')
    })
    .then(function(data) {
      isFriend = data.isFriend;
      subscribed = data.subscribed;
      var bl = data.bl;
      if(bl) throw '对方已在黑名单中';
      var info;
      if(isFriend) {
        info = '该会员在你的好友列表中，确定放入黑名单吗？';
      } else if(subscribed) {
        info = '该会员在你的关注列表中，确定放入黑名单吗？';
      }
      if(info) return sweetQuestion(info);
    })
    .then(function() {
      if(isFriend) {
        return nkcAPI(`/message/friend?uid=` + tUid, 'DELETE', {})
      }
    })
    .then(function() {
      if(subscribed) {
        return SubscribeTypes.subscribeUserPromise(tUid, false);
      }
    })
    .then(function() {
      return nkcAPI('/blacklist', 'POST', {
        tUid: tUid,
        from: from,
        pid: pid
      })
    })
    .then(function(data) {
      sweetSuccess('操作成功');
      return data;
    })
    .catch(sweetError);
}

/*
* 将用户从黑名单中移除
* @param {String} tUid 需要移除用户的ID
* */
NKC.methods.removeUserFromBlacklist = function(tUid) {
  return Promise.resolve()
    .then(function() {
      return nkcAPI('/blacklist?tUid=' + tUid, 'GET')
    })
    .then(function(data) {
      if(!data.bl) throw '对方未在黑名单中';
      return nkcAPI('/blacklist?tUid=' + tUid, 'DELETE');
    })
    .then(function(data) {
      sweetSuccess('操作成功');
      return data;
    })
    .catch(sweetError);
}

/*
* 判断是否为手机浏览器
* @return {Boolean}
* */
NKC.methods.isPhone = function() {
  return /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
}

/*
* 页面导航上的搜索
* */
NKC.methods.search = function(inputId) {
  var input = $('#' + inputId);
  if(!input.length) return;
  var c = input.val();
  window.open("/search?c=" + encodeURI(c));
}


/**
 * 发送原生消息提示
 */
NKC.methods.showNotification = function(title, body, time) {
  if(!("Notification" in window)) return;
  var siteIconUrl = $(document.head).find("[rel='shortcut icon']").attr("href");
  function toShow() {
    return new Promise(function(resolve, reject) {
      var notification = new Notification(title, {body: body, icon: siteIconUrl});
      notification.onclick = function() {resolve({action: "click"})}
      notification.onclose = function() {resolve({action: "close"})}
      setTimeout(function() {
        notification.close()
      }, time || 10000);
    })
  }
  if(Notification.permission !== "granted") {
    return Notification.requestPermission()
      .then(function(status) {
        return new Promise(function(resolve, reject) {
          if(status === "granted") {
            return toShow();
          } else {
            reject("用户拒绝通知")
          }
        })
      })
  } else {
    return toShow();
  }
}
/*
* 获取本地数据键名，区分uid
* @param {String} 数据键名
* @return {String}
* @author pengxiguaa 2020-12-11
* */
NKC.methods.getLocalStorageKey = function(key) {
  var uid = NKC.configs.uid || 'visitor';
  return {
    forumThreadList: 'forumThreadList_' + uid
  }[key]
};
/*
* 获取本地数据并反序列化
* @param {String} key 键名
* @return {Object} {tid1: count, tid2: count} 键值对 tid: count
* @author pengxiguaa 2020-12-11
* */
NKC.methods.getObjectDataFromLocalStorage = function(key) {
  var data = localStorage.getItem(key);
  if(data === null) {
    data = {};
  } else {
    data = JSON.parse(data);
  }
  if(typeof data === 'string') data = {};
  return data;
};
/*
* 将数据序列化 然后存到本地
* @param {String} key 键名
* @param {Object} data {tid1: count, tid2: count, ...} 键值对 tid: count
* @author pengxiguaa 2020-12-11
* */
NKC.methods.setObjectDataToLocalStorage = function(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
};
/*
* 从本地数据中获取指定文章的未读数
* @param {String} tid
* @return {Number} 未读数
* @author pengxiguaa 2020-12-11
* */
NKC.methods.getThreadListNewPostCount = function(tid) {
  var key = NKC.methods.getLocalStorageKey('forumThreadList');
  var data = NKC.methods.getObjectDataFromLocalStorage(key);
  return data[tid] || 0;
}
/*
* 设置本地数据中的指定文章的未读数
* @param {String} tid 文章ID
* @param {Number} count 未读数
* @author pengxiguaa 2020-12-11
* */
NKC.methods.setThreadListNewPostCount = function(tid, count) {
  var key = NKC.methods.getLocalStorageKey('forumThreadList');
  var data = NKC.methods.getObjectDataFromLocalStorage(key);
  data[tid] = count;
  NKC.methods.setObjectDataToLocalStorage(key, data);
}
/*
* 清除本地数据
* @param {String} 数据键名
* @author pengxiguaa 2020-12-11
* */
NKC.methods.removeLocalStorageByKey = function(key) {
  key = NKC.methods.getLocalStorageKey(key);
  localStorage.removeItem(key);
};

/*
* 判断是否为手机浏览器
* */
NKC.methods.isMobilePhoneBrowser = function() {
  var reg = /(iPhone|iPad|iPod|iOS|Android)/i;
  return reg.test(window.navigator.userAgent) && NKC.configs.platform !== 'reactNative';
}
/*
* 判断是否为电脑浏览器
* */
NKC.methods.isPcBrowser = function() {
  return NKC.configs.platform !== 'reactNative' && !NKC.methods.isMobilePhoneBrowser();
}

NKC.methods.toPay = function(paymentType, info, newWindow) {
  if(paymentType === 'aliPay') {
    const {url} = info;
    if(NKC.configs.isApp) {
      NKC.methods.visitUrl(url, true);
    } else {
      newWindow.location = url;
    }
  } else if(paymentType === 'wechatPay') {
    const {paymentId, url: h5Url} = info;
    const url = `/payment/wechat/${paymentId}`;
    if(NKC.methods.isPcBrowser()) {
      newWindow.location = url;
    } else if(NKC.methods.isMobilePhoneBrowser()) {
      newWindow.location = h5Url;
    } else {
      RNWechatPay({
        url: window.location.origin + url,
        H5Url: h5Url,
        referer: window.location.origin
      });
    }
  }
}


/*
* 获取当前页面的音频链接去更新 APP 音乐列表并播放新列表中的音乐
* @param {String} targetRid 待播放的音乐 rid
* */
NKC.methods.updateAppMusicListAndPlay = function(targetRid) {
  var elements = $('span[data-tag="nkcsource"][data-type="audio"]');
  var audiosId = [], audiosTitle = [];
  var urls = [];
  for(var i = 0; i < elements.length; i ++) {
    var e = elements.eq(i);
    var rid = e.attr('data-id');
    var title = e.find('.app-audio-title');
    var url = title.attr('data-url');
    if(title.length) title = title.text();
    if(audiosId.indexOf(rid) === -1) {
      audiosId.push(rid);
      audiosTitle.push(title);
      urls.push(url);
    }
  }
  var index = audiosId.indexOf(targetRid);
  if(index > 0) {
    var _audiosId = audiosId.splice(0, index);
    var _audiosTitle = audiosTitle.splice(0, index);
    var _urls = urls.splice(0, index);
    audiosId = audiosId.concat(_audiosId);
    audiosTitle = audiosTitle.concat(_audiosTitle);
    urls = urls.concat(_urls);
  }
  var list = [];
  for(let i = 0; i < audiosId.length; i ++) {
    var url = urls[i];
    if(url.indexOf('http') !== 0) {
      url = window.location.origin + url;
    }
    list.push({
      url,
      name: audiosTitle[i],
      from: window.location.href,
    });
  }
  RNUpdateMusicListAndPlay(list);
}

window.NKC = NKC;

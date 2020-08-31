var NKC = {
  methods: {},
  modules: {},
  configs: {
    imageExt: ["jpg", "jpeg", "png", "svg", "gif"],
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
NKC.methods.visitUrl = function(url, blank) {
  if(!blank) {
    return window.location.href = url;
  } else {
    if(NKC.configs.isApp) {
      if(NKC.configs.platform === 'apiCloud') {
        NKC.methods.openOnlinePage(url);
      } else {
        if(url.indexOf('http') !== 0) {
          url = location.origin + url;
        }
        NKC.methods.rn.emit('openNewPage', {
          href: url
        });
      }
    } else {
      window.open(url);
    }
  }
};
/*
* 打开一个新页面并关闭当前页面，用于app发表内容后的跳转，跳转到新页面并关闭编辑器页。
* @param {String} url 链接
* */
NKC.methods.visitUrlAndClose = function(url) {
  NKC.methods.rn.emit('openNewPageAndClose', {href: location.origin + url})
};
/*
* app打开在线网页
* */
NKC.methods.openOnlinePage = function(url) {
  url = url.replace(/\/f\/([0-9]+)[?#]?.*/ig, function(c, v1) {
    return "/f/" + v1 + "/latest";
  });
  emitEvent("openOnlinePage", {
    url: url
  });
};

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
NKC.methods.blobToFile = function(blob, fileName) {
  blob.lastModifiedDate = new Date();
  blob.name = fileName || Date.now() + '.png';
  return blob;
  /*return new File([blob], fileName || Date.now() + '.png', {
    lastModified: Date.now()
  });*/
};
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
/*
* 返回文件在本地的URL
* @param {File} file 文件对象
* @param {String} URL
* @author pengxiguaa 2019-7-26
* */
NKC.methods.fileToUrl = function(file) {
  return new Promise(function(resolve, reject) {
    var reads = new FileReader();
    reads.readAsDataURL(file);
    reads.onload = function (e) {
      resolve(this.result);
    };
  });
};
/*
* 字符串转对象，对应pug渲染函数objToStr
* @param {String} str 对象字符串
* @return {Object}
* @author pengxiguaa 2019-7-26
* */
NKC.methods.strToObj = function(str) {
  return JSON.parse(decodeURIComponent(str));
};
/*
* 获取藏在指定dom中的数据 数据由pug渲染函数objToStr组装
* @param {String} id dom元素的id
* @return {Object} 数据对象
* @author pengxiguaa 2019-7-29
* */
NKC.methods.getDataById = function(id) {
  var dom = document.getElementById(id);
  if(dom) {
    return NKC.methods.strToObj(dom.innerHTML);
  } else {
    return {};
  }
};
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
NKC.methods.logout = function() {
  var href = window.location.href;
  nkcAPI("/logout?t=" + Date.now(), "GET")
    .then(function () {
      return nkcAPI(href, "GET");
    })
    .then(function() {
      if(NKC.configs.platform === 'reactNative') {
        NKC.methods.rn.emit("logout");
      }
      window.location.reload();
    })
    .catch(function (data) {
      window.location.href = "/";
    })
};
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
  if(digits === undefined) digits = 2;
  if(size < 1024*1024) {
    size = (size/1024).toFixed(digits) + "KB";
  } else if(size < 1024*1024*1024) {
    size = (size/(1024*1024)).toFixed(digits) + "MB";
  } else {
    size = (size/(1024*1024*1024)).toFixed(digits) + "GB";
  }
  return size;
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
  return nkcAPI("/r/" + resource.rid + "?t=object", 'GET')
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
NKC.methods.resourceToHtml = function(type, rid, name) {
  var handles = {
    "picture": function() {
      return "<img data-tag='nkcsource' data-type='picture' data-id='"+ rid +"' src=\"/r/"+ rid +"\">";
    },
    "sticker": function() {
      return "<img data-tag='nkcsource' data-type='sticker' data-id='"+ rid +"' src=\"/sticker/"+ rid +"\">";
    },
    "video": function() {
      return '<p><br></p><p><video data-tag="nkcsource" data-type="video" data-id="'+ rid +'" src="/r/'+ rid +'" controls></video>'+ decodeURI("%E2%80%8E") +'</p>';
    },
    "audio": function() {
      return '<p><br></p><p><audio data-tag="nkcsource" data-type="audio" data-id="'+ rid +'" src="/r/'+ rid +'" controls></audio>'+ decodeURI("%E2%80%8E") +'</p>';
    },
    "attachment": function() {
      return '<p><a data-tag="nkcsource" data-type="attachment" data-id="'+ rid +'" href="/r/'+ rid +'" target="_blank" contenteditable="false">'+ name +'</a>&#8203;</p>'
    },
    "pre": function() {},
    "xsf": function() {
      return '<p><br></p><section data-tag="nkcsource" data-type="xsf" data-id="'+ rid +'" data-message="浏览这段内容需要'+ rid +'学术分(双击修改)"><p>&#8203;<br></p></section>';
    },
    "twemoji": function() {
      var emojiChar = twemoji.convert.fromCodePoint(rid);
      return "<img data-tag='nkcsource' data-type='twemoji' data-id='"+ rid +"' data-char='"+ emojiChar +"' src=\"/twemoji/2/svg/"+ rid +".svg\">";
    },
    "formula": function() {}
  };
  var hit = handles[type];
  return hit? hit() : "";
};

/*NKC.methods.resourceToHtml = function(resource, type) {
  var html = "";
  if(type === "sticker") {
    html = '<img src="' + NKC.methods.tools.getUrl('sticker', resource.rid) + '">';
  } else if(type === "emoji") {
    html = '<img src="' + NKC.methods.tools.getUrl('emoji', resource) + '">';
  } else {
    var name = resource.oname;
    var rid = resource.rid;
    var ext = resource.ext.toLowerCase();
    if(NKC.configs.imageExt.indexOf(ext) !== -1) {
      html = '<p><img src="' + '/r/' + rid + '" style="max-width:50%;"></p>';
    } else if(NKC.configs.audioExt.indexOf(ext) !== -1) {
      html = '<audio src="' + '/r/' + rid + '" controls>Your browser does not support the audio element</audio>';
    } else if(NKC.configs.videoExt.indexOf(ext) !== -1) {
      html = '<p><br></p><p><video src="' + '/r/' + rid + '" controls style="width: 50%;">video</video></p>';
    } else {
      html = '<p><a href="' + '/r/' + rid + '"><img src=' + '/default/default_thumbnail.png' + '>' + name + '</a></p>';
    }
  }

  return html;
};*/

/*toAppLogin
* 跳转到登录/注册。手机端打开登录window，网页端打开登录弹窗。
* @param {String} type register: 打开注册页, login: 打开登录页。仅针对网页端，app无效。
* @author pengxiguaa 2019-9-25
* */
NKC.methods.toLogin = function(type) {
  if(NKC.configs.isApp) {
    if(NKC.configs.platform === 'apiCloud') {
      emitEvent("openLoginPage", {
        type: type
      });
    } else if(NKC.configs.platform === 'reactNative') {
      NKC.methods.rn.emit("openLoginPage", {type: type});
    }
  } else {
    Login.open(type === "register"? "register": "login");
  }
};


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
* 批量 屏蔽或退修 回复或文章
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
			return asyncSweetCustom("<p style='font-weight: normal;'>ip: "+ info.ip +"<br>位置: "+ info.province + info.city +"</p>")
		})
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
    html = html.html();
    return html;
  }
};

/*
* 打开聊天页面
* */

NKC.methods.toChat = function(uid, name, type) {
  if(NKC.configs.platform === 'reactNative') {
    NKC.methods.rn.emit('toChat', {
      uid: uid,
      name: name,
      type: type || 'UTU'
    });
  } else {
    NKC.methods.visitUrl("/message?uid=" + uid, true);
  }
}


/*
* app toast
* */

NKC.methods.appToast = function(data) {
  var content = data.message || data.error || data;
  if(NKC.configs.platform === 'reactNative') {
    NKC.methods.rn.emit('toast', {
      content: content
    });
  } else {
    screenTopAlert(content);
  }
}

/*
* app reload webView
* */
NKC.methods.appReloadPage = function() {
  if(NKC.configs.platform === 'reactNative') {
    NKC.methods.rn.emit('reloadWebView');
  } else {
    window.location.reload();
  }
}

/*
* app select location
* */
NKC.methods.appSelectLocation = function() {
  if(NKC.configs.platform === 'reactNative') {
    return new Promise(function(resolve, reject) {
      NKC.methods.rn.emit('selectLocation', {}, function(data) {
        resolve(data);
      });
    })
  }
}
/*
*  close webView
* */
NKC.methods.appClosePage = function() {
  if(NKC.configs.platform === 'reactNative') {
    NKC.methods.rn.emit('closeWebView');
  }
}

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
        return nkcAPI('/friend/' + tUid, 'DELETE', {})
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

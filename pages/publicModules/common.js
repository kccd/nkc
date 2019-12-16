var NKC = {
  methods: {},
  modules: {},
  configs: {
    imageExt: ["jpg", "jpeg", "png", "svg", "gif"],
    audioExt: ["mp3"],
    videoExt: ["mp4"]
  }
};
/*
* 判断运行环境
* */
NKC.methods.getRunType = function() {
  if(localStorage.getItem("apptype") === "app") {
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
  if(NKC.methods.getRunType() === "app") {
    if(window.appOpenUrl) {
      window.appOpenUrl(url);
    }
  } else {
    if(blank) {
      window.open(url);
    } else {
      window.location.href = url;
    }
  }
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
  blob.name = fileName;
  return blob;
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
NKC.methods.resourceToHtml = function(resource) {
  var name = resource.oname;
  var rid = resource.rid;
  var ext = resource.ext.toLowerCase();
  var html = "";
  if(NKC.configs.imageExt.indexOf(ext) !== -1) {
    html = '<p><img src="' + '/r/' + rid + '" style="max-width:50%;"></p>';
  } else if(NKC.configs.audioExt.indexOf(ext) !== -1) {
    html = '<audio src="' + '/r/' + rid + '" controls>Your browser does not support the audio element</audio>';
  } else if(NKC.configs.videoExt.indexOf(ext) !== -1) {
    html = '<p><br></p><p><video src="' + '/r/' + rid + '" controls style="width: 50%;">video</video></p>';
  } else {
    html = '<p><a href="' + '/r/' + rid + '"><img src=' + '/default/default_thumbnail.png' + '>' + name + '</a></p>';
  }
  return html;
};

/*toAppLogin
* 跳转到登录/注册。手机端打开登录window，网页端打开登录弹窗。
* @param {String} type register: 打开注册页, login: 打开登录页。仅针对网页端，app无效。
* @author pengxiguaa 2019-9-25
* */
NKC.methods.toLogin = function(type) {
  var runType = NKC.methods.getRunType();
  if(runType === "app") {
    if(window.toAppLogin) {
      toAppLogin();
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
}
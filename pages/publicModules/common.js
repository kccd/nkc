var NKC = {
  methods: {},
  modules: {},
  configs: {}
};
/*
* 打开链接 兼容APP
* @param {String} url 链接
* @param {Boolean} blank 是否在后台打开
* @author pengxiguaa 2019-7-26
* */
NKC.methods.visitUrl = function(url, blank) {
  if(localStorage.getItem("apptype") === "app") {
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
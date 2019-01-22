if(!NKC) var NKC = {};
NKC.methods = {};
// 滚动到页面最顶部
NKC.methods.initScrollTo = function(options, callback) {
  var top = options.top;
  var bottom = options.bottom;
  window.onscroll = function() {
    var scrollY = window.scrollY;
    if(top) {
      if(scrollY > NKC.config.heightOfShowScrollButton && top) {
        NKC.methods.scrollToTopButton.show();
      } else {
        NKC.methods.scrollToTopButton.hide();
      }
    }
    if(callback) {
      callback(scrollY);
    }
  }
};
if(document.getElementById('scrollToTop')) {
  NKC.methods.scrollToTopButton = new mdui.Fab('#scrollToTop', {});
  if(window.scrollY > NKC.config.heightOfShowScrollButton) {
    NKC.methods.scrollToTopButton.show();
  } else {
    NKC.methods.scrollToTopButton.hide();
  }
}
/*
* 页面滚动到指定位置
* @param number 相对页顶的位置
* @param time 滚动执行的时间
* @author pengxiguaa 2019/1/15
* */
NKC.methods.scrollToTop = function(number, time) {
  if (!time) {
    document.body.scrollTop = document.documentElement.scrollTop = number;
    return number;
  }
  var spacingTime = 10;
  var spacingIndex = time / spacingTime;
  var nowTop = document.body.scrollTop + document.documentElement.scrollTop;
  var everTop = (number - nowTop) / spacingIndex;
  var scrollTimer = setInterval(function() {
    if (spacingIndex > 0) {
      spacingIndex--;
      NKC.methods.scrollToTop(nowTop += everTop);
    } else {
      clearInterval(scrollTimer);
    }
  }, spacingTime);
};

/*
*  @格式化是阿锦
* */
NKC.methods.format = function(m, t) {
  if(typeof moment === "undefined") throw 'moment is not loaded';
  return moment(t).format(m);
};
NKC.methods.fromNow = function(t) {
  if(typeof moment === "undefined") throw 'moment is not loaded';
  return moment(t).fromNow();
};

/*
* 通过vue渲染分页按钮，计算分页需要的关键数据
* @param paging对象 包含属性page, pageCount
* @return paging对象 包含属性page, pageCount, btnList(数组对象, 对象属性包括：text、page、active)
* @author pengxiguaa 2019/1/15
* */
NKC.methods.paging = function(paging) {
  if(!paging) paging = {
    page: 0,
    pageCount: 0
  };
  var page = paging.page, pageCount = paging.pageCount;
  var min, max;
  var reduce1 = page - 3, reduce2 = page + 3;
  if(reduce1 > 0) {
    if(reduce2 > pageCount) {
      max =  pageCount;
      if(reduce1 - (reduce2 - pageCount) < 0) {
        min = 0
      } else {
        min = reduce1 - (reduce2 - pageCount);
      }
    } else {
      max = reduce2;
      min = reduce1;
    }
  } else {
    min = 0;
    if(reduce2 < pageCount) {
      if(pageCount < reduce2 - reduce1) {
        max = pageCount;
      } else {
        max = reduce2 -reduce1;
      }
    } else {
      max = pageCount - 1;
    }
  }
  var arr = [];
  if(min !== 0) {
    arr.push({
      text: '1',
      page: 0
    });
    if(min >= 2) {
      arr.push({
        text: '...'
      });
    }
  }
  for(var i = min; i < pageCount; i++) {
    if(i <= max) {
      arr.push({
        text: i+1,
        page: i,
        active: page === i
      });
    }
  }
  if(max < pageCount - 2) {
    arr.push({
      text: '...'
    });
  }
  if(max < pageCount - 1) {
    arr.push({
      text: pageCount,
      page: pageCount - 1
    });
  }
  return {
    page: page,
    pageCount: pageCount,
    btnList: arr
  }
};


/*
* 渲染公式
* 异步获取内容渲染dom，需要手动执行该函数渲染公式
* @author pengxiguaa 2019/1/15
* */
NKC.methods.renderFormula = function() {
  if(window.MathJax) {
    window.MathJax.Hub.Queue(["Typeset", MathJax.Hub])
  }
};

/*
* 发起http请求
* @param url 请求地址
* @param method 请求类型
* @param data 请求附带的数据
* @return promise
* @author pengxiguaa 2019/1/15
* */
function kcAPI(url, method, data) {
  if(!data) data = {};
  var params = {};
  if(['get', 'delete'].indexOf(method.toLowerCase()) !== -1) {
    params = data;
  }
  var options = {
    method: method,
    url: url,
    data: data,
    params: params,
    headers: {
      'FROM': 'nkcAPI'
    }
  };
  return new Promise(function(resolve, reject) {
    axios(options)
      .then(function(data) {
        resolve(data.data);
      })
      .catch(function(data) {
        if(data.response) {
          if(data.response.data) {
            if(data.response.data.error) {
              reject(data.response.data.error);
            }
          }
        } else {
          reject(data.message || data);
        }
      })
  });
}

/*
* 上传文件
* @param url 请求地址
* @param method 请求类型
* @param formData 需要上传的formData数据
* @param onUploadProgress 上传状态的回调函数
* @return promise
* @author pengxiguaa 2019/1/15
* */
function uploadFileAPI(url, method, formData, onUploadProgress) {
  var options = {
    method: method,
    url: url,
    data: formData,
    headers: {
      'FROM': 'nkcAPI',
      'Content-Type':'multipart/form-data'
    }
  };
  if(onUploadProgress) options.onUploadProgress = onUploadProgress;
  return new Promise(function(resolve, reject) {
    axios(options)
      .then(function(data) {
        resolve(data.data);
      })
      .catch(function(data) {
        if(data.response) {
          if(data.response.data) {
            if(data.response.data.error) {
              reject(data.response.data.error);
            }
          }
        } else {
          reject(data.message || data);
        }
      })
  });
}

/*
* 页面顶部弹出提示
* @param data 需要显示的字符串
* @author pengxiguaa 2019/1/15
* */
function screenTopAlert(data) {
  mdui.snackbar({
    message: data,
    position: 'top'
  });
}

/*
* 页面顶部弹出提示
* @param data 需要显示的字符串，兼容对象：{message: 'blabla'}、{error: 'blabla'}
* @return null
* @author pengxiguaa 2019/1/15
* */
function screenTopWarning(data) {
  mdui.snackbar({
    message: data.message || data.error || data,
    position: 'top'
  });
}

/*
* 播放新信息提示音
* @param name 信息新类型，根据此类型播放相应的音频
* @author pengxiguaa 2019/1/18
* */
function beep(name) {
  var audio = document.getElementById('beep');
  if(audio) {
    if(audio.getAttribute('data-' + name) === 'true') {
      audio.setAttribute('src', "/default/" + name + '.wav' + '?t=' + Date.now());
      audio.play();
    }
  }
}
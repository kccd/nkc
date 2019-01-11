if(!NKC) var NKC = {};
NKC.methods = {};
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

NKC.methods.scrollToTop = function(number, time) {
  if (!time) {
    document.body.scrollTop = document.documentElement.scrollTop = number;
    return number;
  }
  const spacingTime = 10;
  let spacingIndex = time / spacingTime;
  let nowTop = document.body.scrollTop + document.documentElement.scrollTop;
  let everTop = (number - nowTop) / spacingIndex;
  let scrollTimer = setInterval(() => {
    if (spacingIndex > 0) {
      spacingIndex--;
      NKC.methods.scrollToTop(nowTop += everTop);
    } else {
      clearInterval(scrollTimer);
    }
  }, spacingTime);
};
NKC.methods.format = function(m, t) {
  if(typeof moment === "undefined") throw 'moment is not loaded';
  return moment(t).format(m);
};
NKC.methods.fromNow = function(t) {
  if(typeof moment === "undefined") throw 'moment is not loaded';
  return moment(t).fromNow();
};
// 发起请求
function kcAPI(url, method, data) {
  var options = {
    method: method,
    url: url,
    data: data,
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

// 上传文件
// 将文件添加到formData
// formData可添加其他需上传的数据，表明图片的属性
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

function screenTopAlert(data) {
  mdui.snackbar({
    message: data,
    position: 'top'
  });
}
function screenTopWarning(data) {
  mdui.snackbar({
    message: data.error || data,
    position: 'top'
  });
}

if(!NKC) var NKC = {};
NKC.methods = {};
NKC.modules = {};

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

function sweetSuccess(text) {
  Swal.fire({
    type: "success",
    confirmButtonText: "关闭",
    text: text.error || text
  });
}
function sweetError(text) {
  Swal.fire({
    type: "error",
    confirmButtonText: "关闭",
    text: text.error || text
  });
}
function sweetInfo(text) {
  Swal.fire({
    type: "info",
    confirmButtonText: "关闭",
    text: text
  });
}
function sweetWarning(text) {
  Swal.fire({
    type: "warning",
    confirmButtonText: "关闭",
    text: text
  });
}
function sweetConfirm(text) {
  return new Promise(function(resolve, reject) {
    Swal.fire({
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      text: text,
      showCancelButton: true,
      reverseButtons: true
    })
      .then(function(result) {
        if(result.value === true) {
          resolve();
        }
      })
  });
}

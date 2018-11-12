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
function uploadFileAPI(url, formData, onUploadProgress) {
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




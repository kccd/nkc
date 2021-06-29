/**
 * 请求封装
 * @description interface_common.js复制过来的
 */

/*
* 发起请求/上传文件
* @param {String} type 普通请求："post", 上传文件："upload"
* @param {String} url 服务器地址
* @param {String} method 请求方法
* @param {Object/FormData} data 发送的数据。上传文件时data必须为formData对象
* @param {Function} progress 上传文件时返回上传状态
*   @param {Object} e 原始上传进度对象
*   @param {String} percentage 进度百分比，例：87%
* @return promise
* @author pengxiguaa 2019-7-26
* */
export function generalRequest(type, url, method, data, progress) {
  data = data || {};
  return new Promise(function(resolve, reject) {
    var e_;
    var xhr = new XMLHttpRequest();
    if(type === "upload" && progress) {
      xhr.upload.onprogress = function(e) {
        e_ = e;
        var num = (e.loaded/e.total)*100;
        if(num >= 100) num = 100;
        var percentage = (num).toFixed(1);
        progress(e, Number(percentage));
      };
    }
    xhr.onreadystatechange = function(){
      var res;
      if (xhr.readyState === 4){
        try {
          res = JSON.parse(xhr.responseText);
        } catch(e) {
          res = xhr.responseText
        }
        if(xhr.status === 0) {
          reject('发起请求失败，请检查网络连接');
        } else if(xhr.status >= 400 || res.error || res instanceof Error) {
          reject(res);
        } else {
          if(progress && type === "upload" && e_) {
            progress(e_, 100);
          }
          resolve(res);
        }
      }
    };
    try{
      if(type === "upload") {
        xhr.open(method || "POST", url,true);
        xhr.setRequestHeader("FROM","nkcAPI");
        xhr.setRequestHeader("Accept", "*/*");
        xhr.send(data);
      } else {
        xhr.open(method, url,true);
        xhr.setRequestHeader("Content-type","application/json");
        xhr.setRequestHeader("FROM","nkcAPI");
        xhr.setRequestHeader("Accept", "*/*");
        xhr.send(JSON.stringify(data));
      }
    }catch(err){
      reject(err);
    }
  })
}

/*
* 发送请求
* @param {String} url 服务器地址
* @param {String} method 请求方法
* @param {Object} data 数据对象
* @return promise
* @author pengxiguaa 2019-7-26
* */
export function nkcAPI(url, method, data) {
  return generalRequest("post", url, method, data);
}

/*
* 上传文件
* @param {String} url 服务器地址
* @param {String} method 请求方法，默认POST
* @param {FormData} data 数据对象
* @param {Function} progress 进度
*   @param {Object} e 原始上传进度对象
*   @param {String} percentage 进度百分比，例：87.1%
* @return promise
* @author pengxiguaa 2019-7-26
* */
export function nkcUploadFile(url, method, data, progress) {
  return generalRequest("upload", url, method, data, progress);
}
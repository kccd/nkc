// 定义最后光标对象
var lastEditRange;
function geid(id){return document.getElementById(id);}
function gv(id){return geid(id).value;}
function ga(id,attr){return geid(id).getAttribute(attr);}
function hset(id,content){geid(id).innerHTML=content;}
function display(id){geid(id).style = 'display:inherit;'}

// 兼容代码，部分浏览器canvas对象没有toBlob方法
if (!HTMLCanvasElement.prototype.toBlob) {
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function (callback, type, quality) {

      var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
        len = binStr.length,
        arr = new Uint8Array(len);

      for (var i=0; i<len; i++ ) {
        arr[i] = binStr.charCodeAt(i);
      }

      callback( new Blob( [arr], {type: type || 'image/png'} ) );
    }
  });
}

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
function generalRequest(type, url, method, data, progress) {
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
        xhr.send(data);
      } else {
        xhr.open(method, url,true);
        xhr.setRequestHeader("Content-type","application/json");
        xhr.setRequestHeader("FROM","nkcAPI");
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
function nkcAPI(url, method, data) {
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
function nkcUploadFile(url, method, data, progress) {
  return generalRequest("upload", url, method, data, progress);
}

/*// nkcAPI接口核心
function generalRequest(obj,opt,callback){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    var res;
    if (xhr.readyState === 4){
      try {
        res = JSON.parse(xhr.responseText);
      } catch(e) {
        res = xhr.responseText
      }
      if(xhr.status === 0) {
        callback('发起请求失败，请检查网络连接');
      } else if(xhr.status >= 400 || res.error || res instanceof Error) {
        callback(res);
      } else {
        callback(null,res);
      }
    }
  };

  try{
    xhr.open(opt.method,opt.url,true);
	  xhr.setRequestHeader("Content-type","application/json");
    xhr.setRequestHeader("FROM","nkcAPI");
    xhr.send(JSON.stringify(obj));
  }catch(err){
    callback(err);
  }
}
// nkcAPI接口核心 promise
function nkcOperationAPI(obj){
  return new Promise(function(resolve,reject){
    generalRequest(obj,{
      method:obj.method,
      url:obj.url
    },
    function(err,back){
      if(err){
        return reject(err);
      }
      resolve(back);
    });
  })
}
function nkcAPI(operationName,method,remainingParams){  //操作名，参数
  remainingParams = remainingParams || {};
  remainingParams.url = operationName;
  remainingParams.method = method;
  return nkcOperationAPI(remainingParams)
}*/


/***********************各种弹出框*******************************************/
function jalert(obj){
  if(screenTopAlert){
    return screenTopAlert(JSON.stringify(obj))
  }
  else {
    alert(JSON.stringify(obj))
  }
}

function jwarning(obj){
  if(screenTopWarning){
    return screenTopWarning(JSON.stringify(obj))
  }
  else {
    alert(JSON.stringify(obj))
  }
}

function sweetAlert(text) {
  text = (text.error || text) + "";
  Swal({
    confirmButtonText: "关闭",
    text: text
  });
}

function sweetSuccess(text, options) {
  options = options || {
    autoHide: true,
    timer: 2000
  };
  text = text + "";
  if(options.autoHide) {
    Swal({
      type: "success",
      confirmButtonText: "关闭",
      timer: options.timer,
      text: text
    });
  } else {
    Swal({
      type: "success",
      confirmButtonText: "关闭",
      text: text
    });
  }
}
function sweetError(text) {
  text = text.error || text;
  text = text + "";
  Swal({
    type: "error",
    confirmButtonText: "关闭",
    text: text.error || text
  });
}
function sweetInfo(text) {
  text = text + "";
  Swal({
    type: "info",
    confirmButtonText: "关闭",
    text: text
  });
}
function sweetWarning(text) {
  text = text + "";
  Swal({
    type: "warning",
    confirmButtonText: "关闭",
    text: text
  });
}
function sweetConfirm(text) {
  text = text + "";
  return new Promise(function(resolve, reject) {
    Swal({
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
function sweetQuestion(text) {
  text = text + "";
  return new Promise(function(resolve, reject) {
    Swal({
      type: "question",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      text: text,
      showCancelButton: true,
      reverseButtons: true
    })
      .then(function(result) {
        if(result.value === true) {
          resolve();
        } else {
          // reject();
        }
      })
  });
}
// html内容弹窗
function asyncSweetCustom(html) {
  return Swal({
    confirmButtonText: "关闭",
    html: html || ""
  })
}
// promise版本弹框
function asyncSweetSuccess(text, options) {
  return new Promise(function(resolve, reject) {
    options = options || {
      autoHide: true,
      timer: 2000
    };
    text = text + "";
    if(options.autoHide) {
      return Swal({
        type: "success",
        confirmButtonText: "关闭",
        timer: options.timer,
        text: text
      }).then(function() {
        resolve()
      });
    } else {
      return Swal({
        type: "success",
        confirmButtonText: "关闭",
        text: text
      }).then(function(){
        resolve()
      });
    }
  })
}
function asyncSweetError(text) {
  return new Promise(function(resolve, reject) {
    text = text.error || text;
    text = text + "";
    return Swal({
      type: "error",
      confirmButtonText: "关闭",
      text: text.error || text
    }).then(function() {
      resolve();
    });
  })
}

function screenTopAlert(text){
  return screenTopAlertOfStyle(text,'success')
}

function screenTopWarning(text){
  text = text.error || text;
  return screenTopAlertOfStyle(text,'warning')
}

var _alertcount = 0
function screenTopAlertOfStyle(text,stylestring){
  //rely on bootstrap styles

  var objtext = $('<div/>').text(text).html();
  var itemID = getID()

  return new Promise(function(resolve,reject){
    $('#alertOverlay').append(
      '<div class="alert alert-'+ stylestring +'" id="' + itemID +
      '" role="alert" style="opacity:0.9;text-align:center;display:block; pointer-events:none; position:relative;margin:auto; top:0;max-width:500px; width:100%; margin-bottom:3px">'
      + objtext +'</div>'
    );

    var selector = '#'+itemID

    setTimeout(function(){
      $(selector).fadeOut('slow',function(){
        $(selector).remove()
        resolve(selector)
      })
    },2000)
  })
}
function getID(){
  _alertcount++;
  var itemID = 'alert'+_alertcount.toString()
  return itemID
}

function screenTopQuestion(title,choices){
  title = $('<div/>').text(title).html();

  var itemID = getID()
  var selectID = getID()
  var selector = '<select id="'+ selectID +'">'+choices.map(function(c){return '<option>'+c+'</option>'}).join('')+'</select>'

  var buttonYesID = getID()
  var buttonYes = '<button id="'+buttonYesID+'">确认</button>'

  var buttonNoID = getID()
  var buttonNo = '<button id="'+buttonNoID+'">取消</button>'

  return new Promise(function(resolve,reject){
    $('#alertOverlay').append(
      '<div style="padding:10px;background-color:#cef;opacity:0.9;text-align:center;display:block;margin:auto;" id="'+itemID+'"><p>'+ title +'</p>'+
      selector
      +'<p>'+
      buttonYes+buttonNo
      +'</p>'
      +'</div>'
    )

    function disappear(){
      $('#'+itemID).remove()
    }

    $('#'+buttonYesID).click(function(){
      resolve(geid(selectID).value)
      disappear()
    })

    $('#'+buttonNoID).click(function(){
      reject()
      disappear()
    })
  })
}

function screenTopAlertInit(){
  $("body").prepend(
    '<div id="alertOverlay" style="z-index:10001; display:block; position:fixed; top:0; width:100%;">'
    +'</div>'
  );
}

screenTopAlertInit();
/*******************************************************************************/

function redirect(url){
  var urlnowpath = window.location.pathname
  var urlnowsearch = window.location.search
  var urlnowhash = window.location.hash

  var urlwithouthash = url.slice(0,url.indexOf('#'))

  var urlnow = urlnowpath+urlnowsearch
  openToNewLocation(url)
}

window.ReHighlightEverything = function(){
  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });
};

window.HighlightEverything=function(){
  hljs.configure({tabReplace:'    '});
  hljs.initHighlighting()
};

// Regular Expression for URL validation
//
// Author: Diego Perini
// Updated: 2010/12/05
// License: MIT
//
// Copyright (c) 2010-2013 Diego Perini (http://www.iport.it)
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

var URLRegexStem =
// protocol identifier
"(?:(?:https?|ftp)://)" +
// user:pass authentication
"(?:\\S+(?::\\S*)?@)?" +
"(?:" +
// IP address exclusion
// private & local networks
"(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
"(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
"(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
// IP address dotted notation octets
// excludes loopback network 0.0.0.0
// excludes reserved space >= 224.0.0.0
// excludes network & broacast addresses
// (first & last IP address of each class)
"(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
"(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
"(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
"|" +
// host name
"(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
// domain name
"(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
// TLD identifier
"(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
// TLD may end with dot
"\\.?" +
")" +
// port number
"(?::\\d{2,5})?" +
// resource path
"(?:[/?#]\\S*)?"

var common=(function(){
  var common = {}

  var URLTestRegex = new RegExp("^"+URLRegexStem+"$","i")
  var URLExtractRegex = /([^“”‘’\/<\'\"\(\[\]\=]|^)\b((?:(?:https?|ftp|file):\/\/|www\.|ftp\.)[-A-Z0-9+&@#/%=~_|$?!:,.]*[A-Z0-9+&@#\/%=~_|$])/gi;

  common.URLifyMarkdown = function(content){
    return content.replace(URLExtractRegex,function(match,p1,p2){
      return p1+'<'+p2+'>'
    })
  }
  common.URLifyBBcode = function(content){
    return content.replace(URLExtractRegex,function(match,p1,p2){
      return p1+'[url]'+p2+'[/url]'
    })
  }
  var rule = /([^“”‘’\/<\'\"\(\[\]\=]|^)\b((?:(?:https?|ftp|file):\/\/|www\.|ftp\.)[-A-Z0-9+&@#/%=~_|$?!:,.]*[A-Z0-9+&@#\/%=~_|$])/gi;
  common.URLifyHTML = function(content){
    return content.replace(rule,function(a,b,c,d,e){
      var tagLink = "";
      // 两种情况
      // 1.url不在a标签中，重新处理，并包裹到a标签中
      // 2.url在a标签中，不予处理
      if(b.indexOf(">") === -1) {
        // 两种情况
        // 1.url含有http或者https头部,不做特殊处理,否则链接组装会变为http://https://XXXXX
        // 2.url不含http或者https头部,添加http头部
        if(c.indexOf("http") > -1) {
          tagLink = b + '<a href="'+c+'" target="_blank">' + c + '</a>';
        }else{
          tagLink = b + '<a href="http://'+c+'" target="_blank">' + c + '</a>';
        }
      }else{
        tagLink = a
      }
      return tagLink;
    });
  }
  /*common.URLifyHTML = function(content){
    return content.replace(URLExtractRegex,function(match,p1,p2){
      // 这里将原链接的http头部去掉，统一加上http
      // 不是https也没关系，浏览器只识别是否有头部，点击连接会自动跳转
      // 如果不加头部则变为相对路径
      p3 = p2.replace(/(https|http):\/\//igm,'');
      return p1+'<a href="http://'+ p3 +'">'+p2+'</a>';
      // return p1+'<a href="'+p2+'">'+p2+'</a>';
    })
  }*/

  function mapWithPromise(arr,func,k){
    k = k||0
    return Promise.resolve()
    .then(function(){
      if(!arr.length||k===arr.length){
        throw 'mapping ended'
      }else{
        console.log('run func on #'+k+' element');
        return func(arr[k])
      }
    })
    .then(function(){
      return mapWithPromise(arr,func,k+1)
    })
    .catch(function(err){
      console.log(err);
      return err
    })
  }

  common.mapWithPromise = mapWithPromise

  function backcolorChange(colorstr){
    geid('body').style.backgroundColor = colorstr;
  }

  //geid('body').addEventListener('click',backcolorChange)

  common.backcolorChange = backcolorChange

  return common
})()

//in memory of alex king
// JS QuickTags version 1.3.1
//
// Copyright (c) 2002-2008 Alex King
// http://alexking.org/projects/js-quicktags
function edInsertContent(which, myValue, fileType, fileName) {
  myField = document.getElementById(which);
  if(which == "content"){
    //MOZILLA/NETSCAPE support
    if (myField.selectionStart || myField.selectionStart == '0') {
      var startPos = myField.selectionStart;
      var endPos = myField.selectionEnd;
      var scrollTop = myField.scrollTop;
      myField.value = myField.value.substring(0, startPos)
      + myValue
      + myField.value.substring(endPos, myField.value.length);
      //myField.focus();

      myField.selectionStart = startPos + myValue.length;
      myField.selectionEnd = startPos + myValue.length;
      myField.scrollTop = scrollTop;
    }
    //IE support
    else if (document.selection) {
      myField.focus();
      sel = document.selection.createRange();
      sel.text = myValue;
      myField.focus();
    }
    else
    {
      myField.value += myValue;
      //myField.focus();
    }
  }
  if(which == "text-elem"){
    // 将文件后缀转为小写
    fileType = fileType.toLowerCase()
    var codeResource = "";
    if(fileType === "jpg" || fileType === "png" || fileType === "gif" || fileType === "bmp" || fileType === "jpeg" || fileType === "svg"){
      //codeResource = "<b>123456</b>"
      codeResource = "<p><img src=" + myValue + " class='editImgSingle'></p>"
    }else if(fileType === "mp4"){
      codeResource = "<video src=" + myValue + " controls style=width:640px;>video</video>"
    }else if(fileType === "mp3"){
      codeResource = "<audio src=" + myValue + " controls>Your browser does not support the audio element</audio>";
    }else{
      codeResource = "<p><a href=" + myValue + "><img src=" + "/default/default_thumbnail.png" + ">" + fileName + "</a></p>"
    }
    insertHtmlAtCaret(codeResource + "&nbsp;")
    $("#text-elem").focus();
  }
}

//插入图片
function insertHtmlAtCaret(html) {
  var sel, range;
  if (window.getSelection) {
    // IE9 and non-IE
    //获取光标的当前位置
    document.getElementById("text-elem").focus()
    sel = window.getSelection()
    if (lastEditRange) {
      // 存在最后光标对象，选定对象清除所有光标并添加最后光标还原之前的状态
      sel.removeAllRanges()
      sel.addRange(lastEditRange)
    }
    //sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      //创建range对象(拖蓝)
      range = sel.getRangeAt(0);
      //删除当前 Range 对象表示的文档区域
      range.deleteContents();
      
      // Range.createContextualFragment() would be useful here but is
      // non-standard and not supported in all browsers (IE9, for one)
      //createElement() 方法可创建元素节点。
      var el = document.createElement("div");
      //将html插入元素节点
      el.innerHTML = html;
      //创建一个新的空文档片段(DOM节点)
      var frag = document.createDocumentFragment(), node, lastNode;
      while ( (node = el.firstChild) ) {
        lastNode = frag.appendChild(node);
      }
      //在range内的开头插入节点
      range.insertNode(frag);
      // Preserve the selection
      if (lastNode) {
        //复制range
        range = range.cloneRange();
        //在指定的节点后开始范围
        range.setStartAfter(lastNode);
        range.collapse(true);
        //从当前selection对象中移除所有的range对象
        sel.removeAllRanges();
        sel.addRange(range);  
      }
    }
  } else if (document.selection && document.selection.type != "Control") {
    // IE < 9
    document.selection.createRange().pasteHTML(html);
  }
  lastEditRange = sel.getRangeAt(0)
}


/***用户资料设置页面用到的函数，用户资料设置页调整后可删除******************************************************/
function postUpload(url, data, callback, onprogress) {
	var xhr = new XMLHttpRequest();
	xhr.upload.onprogress = function(e) {
	  if(onprogress) onprogress(e);
		var percentComplete = (e.loaded / e.total) * 100;
		percentComplete = percentComplete.toFixed(1);
		$('#uploadInfo').css('display', 'block');
		$('#uploadInfo span').text(percentComplete + "%");
		console.log("Uploaded " + percentComplete + "%");
	};
	xhr.onreadystatechange=function()
	{
		if (xhr.readyState==4)
		{
			if(xhr.status>=200&&xhr.status<300){
				setTimeout(function(){
					$('#uploadInfo').css('display', 'none');
				}, 5000);
				callback(JSON.parse(xhr.responseText));
			}else {
				setTimeout(function(){
					$('#uploadInfo').css('display', 'none');
				}, 5000);
				var data;
				try{
          data = JSON.parse(xhr.responseText);
        } catch(err) {
				  console.log(err);
				  data = xhr.responseText;
        }
				screenTopWarning(data.error);
			}
		}
	};
	xhr.open("POST",url,true);
	xhr.setRequestHeader("FROM","nkcAPI");
	xhr.send(data);
}
function uploadFile(url, id, callback) {
	$(id).on('change', function() {
		var inputFile = $(id).get(0);
		var file;
		if(inputFile.files.length > 0){
			file = inputFile.files[0];
		}else {
			return jwarning('未选择文件');
		}
		var formData = new FormData();
		formData.append('file', file);
		postUpload(url, formData, callback);
	});
}
$("document").ready(function(){
  $("#text-elem").on("click",function(){
    var selection = document.getSelection();
    lastEditRange = selection.getRangeAt(0)
  });
  $("#text-elem").on("keyup",function(){
    var selection = document.getSelection();
    lastEditRange = selection.getRangeAt(0)
  })
});
/***********************************************************************************************/

/*
* 上传文件 兼容旧代码
* */
function uploadFilePromise(url, data, onprogress, method) {
  return nkcUploadFile(url, method, data, onprogress);
  /*return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.upload.onprogress = function(e) {
      if(onprogress) {
        var num = (e.loaded/e.total)*100;
        if(num >= 100) num = 100;
        var percentage = (num).toFixed(1);
        percentage = percentage + "%";
        onprogress(e, percentage)
      }
    };
    xhr.onreadystatechange=function()
    {
      if (xhr.readyState === 4)
      {
        if(xhr.status>=200&&xhr.status<300){
          resolve(JSON.parse(xhr.responseText));
        }else {
          var data;
          try{
            data = JSON.parse(xhr.responseText);
          } catch(err) {
            data = xhr.responseText;
          }
          reject(data);
        }
      }
    };
    xhr.open(method||"POST",url, true);
    xhr.setRequestHeader("FROM","nkcAPI");
    xhr.send(data);
  });*/
}


function deleteBill(id) {
	if(confirm('确定要删除该条记录？') === false) return;
	nkcAPI('/fund/bills/'+id, 'DELETE', {})
		.then(function () {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

// 封禁用户
function bannedUser(uid, banned) {
	var method = 'PATCH';
	if(banned) method = 'DELETE';
	nkcAPI('/u/'+uid+'/banned', method, {})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		});
}

// 创建元素
function newElement(tagName, attributes, css) {
	var single = ['hr', 'br', 'input'];
	var element;
	if(single.indexOf(tagName) !== -1) {
		element = $('<'+tagName+'>');
	} else {
		element = $('<'+tagName+'></'+tagName+'>');
	}
	if(attributes) {
		element.attr(attributes);
		if(css) {
			element.css(css);
		}
	}
	return element;
}


function iconSwitch() {
	// 图标on/off切换
	$('.fa-switch-icon,.fa-switch').on('click', function() {
		if($(this).hasClass('fa-toggle-on')) {
			$(this).removeClass('fa-toggle-on').addClass('fa-toggle-off');
		} else if($(this).hasClass('fa-toggle-off')) {
			$(this).removeClass('fa-toggle-off').addClass('fa-toggle-on');
		}

		//下拉箭头转换

		if($(this).children('.fa').hasClass('fa-caret-down')) {
			$(this).children('.fa').removeClass('fa-caret-down').addClass('fa-caret-up');
		} else {
			$(this).children('.fa').removeClass('fa-caret-up').addClass('fa-caret-down');
		}
	});

}


function deleteForum(fid) {
	if(confirm('确定要删除？') === false) {
		return;
	}
	nkcAPI('/f/'+fid, 'DELETE', {})
		.then(function() {
			screenTopAlert('删除成功');
			setTimeout(function() {
        // window.location.href = '/f';
        openToNewLocation('/f');
			}, 1500)
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}


var digestDom;
var creditDom;
var postWarningDom;

$(function () {
	var tooltipElements = $('[data-toggle="tooltip"]');
	if(tooltipElements.length > 0) {
		$('[data-toggle="tooltip"]').tooltip();
	}
	iconSwitch();

	// 精选弹窗
  digestDom = $('#digestModel');
  if(digestDom.length !== 0) {
    digestDom.modal({
      show: false
    });
  }
  creditDom = $('#creditModel');
  if(creditDom.length !== 0) {
    creditDom.modal({
      show: false
    });
  }

  postWarningDom = $("#module_post_warning");
  if(postWarningDom.length !== 0) {
    postWarningDom.modal({
      show: false
    });
  }

  // markDiv("#highlight");

  /*var forumBlock = $(".forum-block-children");
  if(forumBlock.length > 0) {
    if($(body).width() < 992) {
      $(".forum-block-children").show();
      $(".forum-block>.fa.fa-angle-down").removeClass("fa-angle-down").addClass("fa-angle-up");
    }
  }*/
});

/*function markDiv(id) {
  var highlightDom = $(id);
  var highlightDomChild = $(id + " .highlight");
  highlightDomChild.css("background-color", "rgba(255, 251, 221, 1)");
  var colorValue = 2;

  var colorTimeout = setInterval(function() {
    colorValue -= 0.1;
    if(colorValue < 0) clearInterval(colorTimeout);
    highlightDomChild.css("background-color", "rgba(255, 251, 221, "+(colorValue<1?colorValue:1)+")");
  }, 1000);

  /!*if(highlightDom.length) {
    var top = highlightDom.offset().top;
    setTimeout(function() {
      $("html,body").animate({scrollTop: top-300}, 500)
    }, 1000);
  }*!/
}*/

function openPostWarningDom(pid) {
  var dom = $("#module_post_warning");
  dom.attr("data-pid", pid).show();
  dom.modal('show');
}

function submitPostWarning() {
  var dom = $("#module_post_warning");
  var pid = dom.attr("data-pid");
  var text = $("#module_post_warning textarea");
  var reason = text.val();
  if(!reason) return screenTopWarning("请输入修改建议");
  nkcAPI("/p/" + pid + "/warning", "POST", {
    reason: reason
  })
    .then(function() {
      dom.modal('hide');
      dom.attr("data-pid", "");
      text.val("");
    })
    .catch(function(data) {
      screenTopWarning(data);
    })
}

function cancelXsf(pid, id) {
  var reason = prompt('请输入撤销原因：');
  if(reason === null) return;
  if(reason === '') return screenTopWarning('撤销原因不能为空！');
  nkcAPI('/p/' + pid + '/credit/xsf/' + id + '?reason=' + reason, 'DELETE', {})
    .then(function() {
      window.location.reload();
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
    })

}

function credit(pid, type, kcb) {
  var title = {
    xsf: '评学术分',
    kcb: '鼓励'
  }[type];
  creditDom.one('show.bs.modal', function(event) {
    var button = event.currentTarget.getElementsByClassName('btn');
    var t = event.currentTarget.getElementsByClassName('modal-title');
    var kcbInfo = event.currentTarget.getElementsByClassName('kcb-info');
    var xsfInfo = event.currentTarget.getElementsByClassName('xsf-info');
    var num = event.currentTarget.getElementsByClassName('num')[0];
    var description = event.currentTarget.getElementsByClassName('description')[0];
    if(type === 'kcb') {
      for(var i = 0 ; i < xsfInfo.length; i++) {
        xsfInfo[i].style.display = 'none';
      }
      for(var i = 0 ; i < kcbInfo.length; i++) {
        kcbInfo[i].style.display = 'inline-block';
      }
      num.value = '';
    } else {
      num.value = '';
      for(var i = 0 ; i < kcbInfo.length; i++) {
        kcbInfo[i].style.display = 'none';
      }
      for(var i = 0 ; i < xsfInfo.length; i++) {
        xsfInfo[i].style.display = 'inline-block';
      }
    }
    description.value = '';
    t[0].innerText = title;
    button[1].onclick = function() {
      button[1].setAttribute("disabled", "disabled");
      if(type === 'xsf') {
        var obj = {
          num: num.value,
          description: description.value
        };
        return nkcAPI('/p/'+pid+'/credit/xsf', 'POST',obj)
          .then(function(){
            creditDom.modal('hide');
            window.location.reload();
          })
          .catch(function(data) {
            screenTopWarning(data.error)
            button[1].removeAttribute("disabled");
          })
      } else if(type === 'kcb') {

        if(num.value*100 > kcb) return screenTopWarning('您的科创币不足');
        var obj = {
          num: num.value*100,
          description: description.value
        };
        nkcAPI('/p/'+pid+'/credit/kcb', 'POST', obj)
          .then(function() {
            creditDom.modal('hide');
            window.location.reload();
          })
          .catch(function(data) {
            screenTopWarning(data.error || data);
            button[1].removeAttribute("disabled");
          });
      }
    }
  });
  creditDom.modal('show');
}

function addCredit(pid){
  var cobj = promptCredit(pid)
  if(cobj){
    return nkcAPI('/p/'+pid+'/credit/xsf', 'POST',cobj)
      .then(function(){
        window.location.reload()
      })
      .catch(function(data) {
        screenTopWarning(data.error)
      })
  }
  else{
    screenTopWarning('取消评分。')
  }
}

function addKcb(pid, kcb) {
  var num = prompt('向作者转账科创币以资鼓励，科创币数量：', '5');
  if(!num || !Number(num)) return screenTopWarning('请输入正确的科创币数量');
  num = Number(num);
  if(num <= 0) return screenTopWarning('科创币最少为1');
  if(kcb < num) return screenTopWarning('您的科创币数量不足');
  var description = prompt('请输入理由：', '');
  if(!description || description.length < 2) {
    return screenTopWarning('理由写的太少啦~');
  }
  nkcAPI('/p/'+pid+'/credit/kcb', 'POST', {
    num: num,
    description: description
  })
    .then(function() {
      screenTopAlert('鼓励成功！');
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
    });
}

function promptCredit(pid){
  var cobj = {pid:pid}

  var q = prompt('请输入学术分：','1')
  if(q&&Number(q)){
    cobj.num=Number(q)

    var reason = prompt('请输入评分理由：','')
    if(reason&&reason.length>1){
      cobj.description = reason;

      return cobj
    }
  }
  return null
}

//舍弃草稿
function removedraft(uid,did){
	if(confirm('确认舍弃草稿？') === false) return;
  var url = '/u/'+uid+'/drafts/'+did+'?uid='+uid+"&did="+did;
  var method = "DELETE";
  var alertInfo = "已舍弃草稿";
  nkcAPI(url, method, {})
    .then(function(){
      sweetSuccess(alertInfo);
      if(did === "all") {
        $("#draftList").fadeOut("slow");
      }else{
        $("#draft"+did).fadeOut("slow");
      }
      // setTimeout(function(){
      //   window.location.reload();
      // }, 1000);
    })
    .catch(function(data){
      sweetWarning(data.error)
    })
}




// // 去标签+略缩
// function delCodeAddShrink1(content){
// 	content = content.replace(/<[^>]+>/g,"");
// 	if(content.length > 10){
//     var lastContent = content.substr(content.length-50,content.length)
// 		content = content.substr(0,10) + "......" + lastContent;
// 	}
// 	return content
// }



function htmlAPI(url, method, data, options) {
	var id = options.id;
	//创建进度条
	createProgressBar();
	return new Promise(function(resolve, reject) {
		$.ajax({
			url: url,
			dataType: 'json',
			method: method,
			headers: {
				'FROM': 'htmlAPI'
			},
			data: data
		})
			.done(function(data) {
				removeProgressBar();
				$(id).html(data.html);
				if(data.user) {
					var newMessage = data.user.newMessage;
					var count = newMessage.replies + newMessage.message + newMessage.system + newMessage.at;
					if(count === 0) {
						$('.newMessage').text('');
						$('#messageIco').css('display','none');
					} else {
						$('.newMessage').text(count);
						$('#messageIco').css('display','block');
					}
					var draftCount = data.user.draftCount;
					if(draftCount === 0) {
						$('.draftMessage').text('');
					} else {
						$('.draftMessage').text(draftCount);
					}
				}
				return resolve(data);
			})
			.fail(function(data) {
				if(data.status === 0) {
					removeProgressBar();
					return screenTopWarning('连接失败');
				}
				removeProgressBar();
				if(typeof data.responseText === 'object') {
					data = JSON.parse(data.responseText);
				} else {
					data = data.responseText;
				}

				screenTopWarning(data.error || data);
				return reject(data);
			})
	})
}

function initHtmlAPI(options) {


	window.onpopstate = function(event) {
		var url = event.currentTarget.location.href;
		htmlAPI(url, 'GET', {}, options)
	};


	if(!window.history || !window.history.pushState) {
		return;
	}
	$('a[data-toggle="url"]').on('click', function(event) {
		//阻止a标签默认跳转行为
		event.preventDefault();
		var url = $(this).attr('href');
		htmlAPI(url, 'GET', {}, options)
			.then(function() {
				history.pushState({},'科创',url);
			})
			.catch(function(data) {

			})
	});
}

function createProgressBar() {
// 创建进度条
	var progressBarArr = $('.progressBar');
	progressBarArr.parent('div').remove();
	var progress = newElement('div', {}, {});
	var progressBar = newElement('div', {
		'class': 'progressBar progress-bar progress-bar-striped active',
		'role': 'progressbar',
		'aria-valuenow': '45',
		'valuemin': '0',
		'aria-valuemax': '100'
	}, {
		width: '0%'
	});
	progress.append(progressBar);
	$('body').append(progress);
	progressBar.width('70%');
}

function removeProgressBar() {
	var progressBar = $('.progressBar');
	progressBar.css({
		'width': '100%',
		'transition-duration': '0s',
		'-moz-transition-duration': '0s',
		'-webkit-transition-duration': '0s',
		'-o-transition-duration': '0s',
	});
	progressBar.fadeOut(500, function() {
		progressBar.parent('div').remove();
	});
}


if($('input[data-control="hue"]').length !== 0 && $('input[data-control="hue"]').minicolors) {
	$('input[data-control="hue"]').minicolors({

		control: $(this).attr('data-control') || 'hue',

		defaultValue: $(this).attr('data-defaultValue') || '',

		inline: $(this).attr('data-inline') === 'true',

		letterCase: $(this).attr('data-letterCase') || 'lowercase',

		opacity: $(this).attr('data-opacity'),

		position: $(this).attr('data-position') || 'bottom left',

		change: function(hex, opacity) {

			if( !hex ) return;

			if( opacity ) hex += ', ' + opacity;

			try {

				// console.log(hex);

			} catch(e) {}

		},

		theme: 'bootstrap'

	});
}

// 首页置顶
function homeTop(tid) {
	nkcAPI('/t/'+tid+'/hometop', 'POST', {})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}
// 取消首页置顶
function unHomeTop(tid) {
	nkcAPI('/t/'+tid+'/hometop', 'DELETE', {})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}
// 首页推荐
function unHomeAd(tid) {
  nkcAPI("/t/" + tid + "/ad", "DELETE")
    .then(function() {
      window.location.reload();
    })
    .catch(sweetError);
}
// 打开主题
function openThread(tid) {
	nkcAPI('/t/'+tid+'/close', 'DELETE', {})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error|| data);
		})
}
// 关闭主题
function closeThread(tid) {
	nkcAPI('/t/'+tid+'/close', 'POST', {})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error|| data);
		})
}
// 设回复为精选
function digestPost(pid) {
  var post = function(obj) {
    nkcAPI('/p/'+pid+'/digest', 'POST', obj)
      .then(function() {
        screenTopAlert('设置成功');
        if(digestDom.length > 0) {
          digestDom.modal('hide');
        }
        window.location.reload();
      })
      .catch(function(data) {
        screenTopWarning(data.error||data);
      })
  };
  if(digestDom.length === 0) {
    return post({});
  }
  digestDom.one('show.bs.modal', function(event) {
    var button = event.currentTarget.getElementsByTagName('button');
    if(!button[2]) return;
    button[2].onclick = function() {
      var input = event.currentTarget.getElementsByTagName('input');
      var num = input[0].value;
      num = Number(num);
      num = num*100;
      if(typeof num !== "number" || num%1 !== 0) return screenTopWarning("请输入正确的数额");
      var obj = {kcb: num};
      post(obj);
    }
  });
  digestDom.modal('show');
}
// 取消回复精选
function unDigestPost(pid) {
	nkcAPI('/p/'+pid+'/digest', 'DELETE', {})
		.then(function() {
			screenTopAlert('已取消精选');
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}

function beep(name) {
  var audio = document.getElementById('beep');
  if(audio) {
    if(audio.getAttribute('data-' + name) === 'true') {
      audio.setAttribute('src', "/default/" + name + '.wav' + '?t=' + Date.now());
      audio.play();
    }
  }
}

function updateBeep(beep) {
  var audio = document.getElementById('beep');
  if(!audio) return;
  if(beep.systemInfo) {
    audio.setAttribute('data-notice', 'true');
  } else {
    audio.setAttribute('data-notice', 'false');
  }
  if(beep.usersMessage) {
    audio.setAttribute('data-message', 'true');
  } else {
    audio.setAttribute('data-message', 'false');
  }
  if(beep.reminder) {
    audio.setAttribute('data-reminder', 'true');
  } else {
    audio.setAttribute('data-reminder', 'false');
  }
}

function initPhotoSwipe(url) {
  var pswpElement = document.querySelectorAll('.pswp')[0];
  if(!pswpElement) return;
  var options = {
    index: 0,
    showHideOpacity: true,
    closeOnScroll: false,
    clickToCloseNonZoomable: false,
    showAnimationDuration: 0,
    hideAnimationDuration: 0,
    mouseUsed: true,
    history: false,
    bgOpacity: 0.9,
  };
  var items = [];
  var winWidth = $(window).width();
  var winHeight = $(window).height();
  url = url.replace(/\?.*/g, '');
  var image = new Image();
  image.src = url;
  image.onload = function() {
    var w, h;
    if (winWidth / winHeight > image.width / image.height) {
      h = winHeight;
      w = image.width * h / image.height;
    } else {
      w = winWidth;
      h = image.height * w / image.width;
    }
    items.push({
      src: url,
      w: w,
      h: h
    });
    var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
    gallery.init();
  }
}


function shareTo(shareType, type, str, title, pid){
  var host = window.location.host;
  var lk = 'http://'+host+'/default/logo3.png';
  var origin = window.location.origin;
  if(type !== "weChat" && type !== "link"){
    var newLink = window.open();
  }
  if(str){
    var para = {
      'str': str,
      'type': shareType,
      targetId: pid // 与type类型对应的Id
    }
    nkcAPI('/s', "POST", para)
    .then(function(data) {
      var newUrl = origin + data.newUrl;
      if(type == "link") {
        var copyAreaId = "copyArea"+pid;
        var copyLinkId = "copyLink"+pid;
        var copyButton = "copyVutton"+pid;
        document.getElementById(copyAreaId).style.display = "block";
        document.getElementById(copyLinkId).value = newUrl;
      }
      if(type == "qq") {
        newLink.location='http://connect.qq.com/widget/shareqq/index.html?url='+newUrl+'&title='+title+'&pics='+lk+'&summary='+document.querySelector('meta[name="description"]').getAttribute('content');
      }
      if(type == "qzone") {
        newLink.location='https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+newUrl+'&title='+title+'&pics='+lk+'&summary='+document.querySelector('meta[name="description"]').getAttribute('content');
      }
      if(type == "weibo") {
        newLink.location='http://v.t.sina.com.cn/share/share.php?url='+newUrl+'&title='+title+'&pic='+lk;
      }
      if(type == "weChat") {
        var qrcode
        if(shareType == "post"){
          var qrid = pid+"Qrcode";
          qrcode = geid(qrid);
        }else{
          if(shareType == "forum"){
            var otherCodes = document.getElementsByClassName('forumQrcode');
            for(var i in otherCodes){
              var otherCode = otherCodes[i];
              if(otherCode && typeof(otherCode)=="object") {
                otherCode.style.display = "inline-block"
                var path = newUrl;
                path = path.replace(/\?.*/g, '');
                QRCode.toCanvas(otherCode, path, {
                  scale: 3,
                  margin: 1,
                  width: 150,
                  color: {dark: '#000000'}
                }, function(err) {
                  if(err){
                    //- screenTopWarning(err);
                  }
                })
              }
            }
          }
          var qrid = shareType+"Qrcode";
          qrcode = geid(qrid);
        }
        qrcode.style.display = "inline-block"
        if(qrcode) {
          var path = newUrl;
          path = path.replace(/\?.*/g, '');
          QRCode.toCanvas(qrcode, path, {
            scale: 3,
            margin: 1,
            width: 150,
            color: {dark: '#000000'}
          }, function(err) {
            if(err){
              screenTopWarning(err);
            }
          })
        }
      }
    })
    .catch(function(data) {
      screenTopWarning(data || data.error)
      screenTopWarning("请登录")
    })
  }
}

// 复制
function copyLink(id) {
  if(id) {
    var copyLinkId = "copyLink" + id;
    var obj = document.getElementById(copyLinkId);
    obj.select(); 
  }else{
    return screenTopWarning("链接复制失败，请手动复制")
  }
  if(document.execCommand("copy", false, null)) {
    screenTopAlert("链接复制成功");
  }else{
    screenTopWarning("链接复制失败，请手动复制")
  }
}

function openwin(url) {
  var a = document.createElement("a"); //创建a对象
  a.setAttribute("href", url);
  a.setAttribute("target", "_blank");
  a.setAttribute("id", "camnpr");
  document.body.appendChild(a);
  a.click(); //执行当前对象
}

// 获取纯文本(带有去标签),并缩减文字
function obtainPureText(content, reduce, count) {
  content = content.replace(/<[^>]+>/g,"");
  count = parseInt(count);
  if(reduce === true){
    if(content.length > count){
      var lastContent = content.substr(content.length-count,content.length)
      content = content.substr(0,count) + "...";
    }
  }
  return content;
}

function postsVote(pid, type) {
  if(type === 'login') return NKC.methods.toLogin('login');
  var url = '/p/' + pid + '/vote/down';
  if(type === 'up') {
    url = '/p/' + pid + '/vote/up';
  }
  nkcAPI(url, 'POST', {})
    .then(function(data) {
      var number = data.post.voteUp;
      var upIcon = document.querySelector('.posts-vote-up[data-pid="'+pid+'"]');
      var downIcon = document.querySelector('.posts-vote-down[data-pid="'+pid+'"]');
      var numberIcon = document.querySelector('.posts-vote-number[data-pid="'+pid+'"]');
      var up = upIcon.classList.contains('active');
      var down = downIcon.classList.contains('active');

      if(type === 'up') { // 点赞
        if(up) { // 若已经点过赞则取消已点赞背景且数字减一
          downIcon.classList.remove('active');
          upIcon.classList.remove('active');
        } else { // 若没点过赞则添加已点赞背景且数字加一
          downIcon.classList.remove('active');
          upIcon.classList.add('active');
        }
      } else { // 点踩
        if(down) {
          // 若已经点过踩了则取消点踩背景
          upIcon.classList.remove('active');
          downIcon.classList.remove('active');
        } else { // 若没点过踩
          if(up) { // 若点过赞则取消点赞背景且数字减一并添加点踩背景
            upIcon.classList.remove('active');
            downIcon.classList.add('active');
          } else { // 若没点过赞则直接添加点踩背景
            upIcon.classList.remove('active');
            downIcon.classList.add('active');
          }
        }
      }
      numberIcon.innerHTML = number || "";
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
    });
}

// 屏蔽鼓励原因
function hideKcbRecordReason(pid, recordId, hide) {
  nkcAPI("/p/" + pid + "/credit/kcb/" + recordId, "PATCH", {
    hide: !!hide
  })
    .then(function() {
      if(hide) {
        screenTopAlert("屏蔽成功");
      } else {
        screenTopAlert("已取消屏蔽");
      }

    })
    .catch(function(data) {
      screenTopWarning(data);
    })
}
// 随机红包
function lottery() {
  nkcAPI('/lottery', 'POST', {})
    .then(function(data) {
      var result = data.result;
      var kcb = data.kcb;
      var domClose = document.getElementsByClassName('lottery-close');
      if(domClose.length === 0) return;
      domClose = domClose[0];
      var domOpen = document.getElementsByClassName('lottery-open');
      if(domOpen.length === 0) return;
      domOpen = domOpen[0];
      domClose.style.display = 'none';
      domOpen.style.display = 'block';
      var header = domOpen.getElementsByClassName('lottery-info-header');
      if(header.length === 0) return;
      if(!result) {
        return header[0].innerText = '哈哈没中';
      }
      header[0].innerText = result.name;
      var content = domOpen.getElementsByClassName('lottery-info');
      if(content.length === 0) return;
      content[0].innerText = '获得' + numToFloatTwo(kcb) + '个科创币';
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
    })
}

function closeLottery() {
  var dom = document.getElementsByClassName('lottery-info-header');
  if(dom.length !== 0 && dom[0].innerText) {
    var lotteryDom = document.getElementsByClassName('lottery');
    if(lotteryDom.length === 0) return;
    return lotteryDom[0].style.display = 'none';
  }
  nkcAPI('/lottery', 'DELETE', {})
    .then(function() {
      var dom = document.getElementsByClassName('lottery');
      if(dom.length === 0) return;
      dom = dom[0];
      dom.style.display = 'none';
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
    })
}


/*
* 页面滚动到底部
* */
function scrollToBottom() {
  var htmlDom = $("html");
  var bodyDom = $("body");
  htmlDom.css("height", "auto");
  bodyDom.css("height", "auto");
  $("html,body").animate({scrollTop: document.body.offsetHeight}, 300);
  htmlDom.css("height", "100%");
  bodyDom.css("height", "100%");
}
/*
* 页面滚动到顶部
* */
function scrollToTop() {
  var htmlDom = $("html");
  var bodyDom = $("body");
  htmlDom.css("height", "auto");
  bodyDom.css("height", "auto");
  $("html,body").animate({scrollTop: 0}, 300);
  htmlDom.css("height", "100%");
  bodyDom.css("height", "100%");
}


var $postRecycleModel = $('#postRecycleModal');
var $recycleModal = $('#recycleModal');

function disablePostClick(pid, type){
  window.localStorage.pid = pid
  if(type === 'post') {
    $postRecycleModel.modal();
  } else if(type === 'thread'){
    deleteThread();
  }
  // console.log(window.localStorage)
}

function disablePost(pid,para){
  nkcAPI('/p/'+pid+'/disabled', 'PATCH',{disabled: true,para: para})
    .then(function(res){
      screenTopAlert(pid+' 已屏蔽')
      //location.reload()
    })
    .catch(function(data) {
      screenTopWarning(data.error)
    })
}

function enablePost(pid){
  nkcAPI("/threads/unblock", "POST", {
    postsId: [pid]
  })
    .then(function(){
      screenTopAlert(pid+' 已解除屏蔽')
      // location.reload()
    })
    .catch(function(data) {
      screenTopWarning(data.error)
    })
}
function disabledThread(tid, para) {
  return nkcAPI('/t/'+tid+'/disabled','POST',{
    para:para
  })
    .then(function(){
      screenTopAlert('已将ID为 '+tid+' 的文章移动至回收站');
    })
    .catch(function(data){
      screenTopWarning('移动ID为 '+tid+' 的文章失败：' + data.error);
    })
}

function moveThread(tid,fid,cid,para){
  return nkcAPI('/t/'+tid+'/moveThread','PATCH',{
    tid:tid,
    fid:fid,
    cid:cid,
    para:para
  })
    .then(function(){
      screenTopAlert('已将帖子 '+tid+' 移动至板块 '+fid+' 分类 '+cid+'下');
    })
    .catch(function(data){
      screenTopWarning('移动失败：'+data.error);
    })
}

function numToFloatTwo(str) {
	str = (str/100).toFixed(2);
	return str;
}

var nkcDrawerBodyTop = 0;

function openNKCDrawer(type) {
  $(".nkc-drawer-"+type).addClass("active");
  $(".nkc-drawer-"+type+"-body").addClass("active");
  $(".nkc-drawer-"+type+"-mask").addClass("active");
  if(type === "left") {
    closeNKCDrawer("right");
  } else {
    closeNKCDrawer("left");
  }
  stopBodyScroll(true);
}
function closeNKCDrawer(type) {
  if(localStorage.getItem("apptype") === "app") {
    if(type === "left"){
      api.setRefreshHeaderInfo({
        bgColor: '#eeeeee',
        textColor: '#aaaaaa',
        textDown: '下拉刷新',
        textUp: '松开刷新',
        textLoading: '刷新成功，正在加载资源...',
        showTime: false
      }, function(ret, err) {
        window.location.reload();
      });
    }
  }
  $(".nkc-drawer-"+type).removeClass("active");
  $(".nkc-drawer-"+type+"-mask").removeClass("active");
  $(".nkc-drawer-"+type+"-body").removeClass("active");
  stopBodyScroll(false);
}

function toggleNKCDrawer(type) {
  var nkcDrawer = $(".nkc-drawer-"+type);
  if(nkcDrawer.hasClass('active')) {
    closeNKCDrawer(type);
  } else {
    if(localStorage.getItem("apptype") === "app") {
      if(api.frameName) {
        api.setFrameAttr({
          name: api.frameName,
          bounces: false
        });        
      }
    }
    openNKCDrawer(type);
  }
}

/*
* 禁止body滚动 显示悬浮div时可用
* @author pengxiguaa 2019-5-14
* */
function stopBodyScroll (isFixed) {
  var bodyEl = document.body;
  if (isFixed) {
    nkcDrawerBodyTop = window.scrollY;
    bodyEl.style.position = 'fixed';
    bodyEl.style.top = -nkcDrawerBodyTop + 'px';
  } else {
    bodyEl.style.position = '';
    bodyEl.style.top = '';
    window.scrollTo(0, nkcDrawerBodyTop) // 回到原先的top
  }
}

// 小屏幕 首页左右侧滑页面 可公用
// 左侧将会复制#leftDom中的内容
// 右侧将会复制#rightDom中的内容
function openLeftDrawer() {
  var nav = $(".drawer-dom .left");
  var navDom = $("#leftDom");
  var bnt = $(".drawer-fixed-button-left");
  bnt.addClass('active');
  bnt.find('.fa').removeClass('fa-angle-double-right');
  bnt.find('.fa').addClass('fa-angle-double-left');
  bnt.attr("onclick", "closeDrawer()");
  nav.addClass('active');
  if(!nav.find(".dom").html()) {
    nav.find(".dom").html(navDom.html());
  }
  $(".drawer-mask").addClass("active");
  stopBodyScroll(true);
}
function openRightDrawer() {
  if(localStorage.getItem("apptype") === "app") {
    if(api.frameName) {
      api.setFrameAttr({
        name: api.frameName,
        bounces: false
      });
    }
  }

  var link = $(".drawer-dom .right");
  var linkDom = $("#rightDom");
  var bnt = $(".drawer-fixed-button-right");
  bnt.addClass('active');
  bnt.attr("onclick", "closeDrawer()");
  bnt.find('.fa').removeClass('fa-angle-double-left');
  bnt.find('.fa').addClass('fa-angle-double-right');
  link.addClass('active');
  if(!link.find(".dom").html()) {
    link.find(".dom").html(linkDom.html());
    if(localStorage.getItem("apptype") === "app") {
      var allLinks = document.querySelectorAll("a");
      Array.prototype.forEach.call(allLinks, function(ll) {
        ll.addEventListener("click", function(e) {
          e.preventDefault();
          if(this.href) {
            var isHostUrl = siteHostLink(this.href);
            // 如果是本站链接则打开app内页，否则使用外站浏览页打开
            if(isHostUrl) {
              var paramIndex = this.href.indexOf("?");
              var newHref = "";
              var equaiHref = false;
              if(paramIndex > -1) {
                newHref = (this.href).substring(0, paramIndex)
              }else{
                newHref = this.href;
              }
              if(newHref.length > 0) {
                if(api.winName.indexOf(newHref) > -1) {
                  equaiHref = true;
                }
              }
              // 如果是在首页跳转到最新关注推荐等，不打开新页面
              if(this.pathname === "/" && api.winName === "root") {
                window.location.href = addApptypeToUrl(this.href)
                return;
              }
              if(equaiHref) {
                appFreshUrl(this.href);
              }else{
                appOpenUrl(this.href);
              }
            }else{
              api.openWin({
                name: 'link',
                url: 'widget://html/link/link.html',
                pageParam: {
                    name: 'link',
                    linkUrl: this.href
                }
              });
            }
          }
        })
      })
    }
  }
  $(".drawer-mask").addClass("active");
  stopBodyScroll(true);
}

function closeDrawer() {
  if(localStorage.getItem("apptype") === "app") {
    api.setRefreshHeaderInfo({
      bgColor: '#eeeeee',
      textColor: '#aaaaaa',
      textDown: '下拉刷新',
      textUp: '松开刷新',
      textLoading: '刷新成功，正在加载资源...',
      showTime: false
    }, function(ret, err) {
      window.location.reload();
    });
  }
  $(".drawer-dom .left").removeClass("active");
  $(".drawer-dom .right").removeClass("active");
  var bnt = $(".drawer-fixed-button-left");
  bnt.removeClass('active');
  bnt.find('.fa').removeClass('fa-angle-double-left');
  bnt.find('.fa').addClass('fa-angle-double-right');
  bnt.attr("onclick", "openLeftDrawer()");
  var bnt2 = $(".drawer-fixed-button-right");
  bnt2.removeClass('active');
  bnt2.find('.fa').removeClass('fa-angle-double-right');
  bnt2.find('.fa').addClass('fa-angle-double-left');
  bnt2.attr("onclick", "openRightDrawer()");
  $(".drawer-mask").removeClass("active");
  stopBodyScroll(false);
}

// 点击按钮播放视频
function openVideo(para, vid) {
  vid = "#" + vid;
  // play() 方法返回了一个promise， 使用.catch()可以输出错误信息
  // 错误信息为：The play() request was interrupted by a call to pause()
  // var videoDom = document.getElementById(vid);
  // var promise = videoDom.play();
  // if(promise) {
  //   promise
  //   .then(function(){
  //     videoDom.pause()
  //   })
  //   .catch(function(err) {
  //     console.log(err.code, err.name, err.message)
  //   })
  // }
  try{
    $(para).next().attr("controls", "controls")
    $(para).next().trigger("play");
    // 去除当前元素
    $(para).remove();
  }catch(err) {
    console.log(err)
  }
}  

/*
* 设置文章或回复通过审核
* @param {String} pid postId
* @author pengxiguaa 2019-7-26
* */
function reviewPost(pid) {
  nkcAPI("/review", "PATCH", {
    pid: pid
  })
    .then(function() {
      screenTopAlert("执行操作成功！");
    })
    .catch(function(data) {
      screenTopWarning(data);
    })
}
/*
* 折叠首页、手机左滑中的专业列表
* */
function switchChildren(fid, e) {
  var forumBlockChildren = $(".forum-block-children[data-fid='"+fid+"']");
  forumBlockChildren.slideToggle();
  var fa = $(e);
  if(fa.hasClass("fa-angle-down")) {
    fa.removeClass("fa-angle-down");
    fa.addClass("fa-angle-up");
  } else {
    fa.removeClass("fa-angle-up");
    fa.addClass("fa-angle-down");
  }
}

function reload() {
  window.location.reload();
}


function openToNewLocation(url, target) {
  return NKC.methods.visitUrl(url, target);
 /* // 检测url是不是本站相对路径
  var firstChar = url.substr(0, 1);
  var apptype = localStorage.getItem("apptype");
  if(apptype && apptype === "app") {
    if(siteHostLink(url) || firstChar === "/") {
      appOpenUrl(url);
    } else {
      api.openWin({
        name: 'link',
        url: 'widget://html/link/link.html',
        pageParam: {
          name: 'link',
          linkUrl: url
        }
      });
    }
  } else {
    if(target && target === "_blank") {
      window.open(url);
    } else {
      window.location.href = url
    }
  }*/
}

/**
 * 给url添加apptype参数
 * @param {*} urlStr 
 */
function addApptypeToUrl(url) {
  // 去掉hash值
  var hashIndex = url.indexOf("#");
  if(hashIndex > 0) {
    url = url.substring(0, hashIndex)
  }
  var resultUrl = url.split("?")[0];
  var paramStr = "";
  var paramsArr;
  var queryString = (url.indexOf("?") !== -1) ? url.split("?")[1] : "";
  paramStr = resultUrl + "?apptype=app";
  if(queryString !== "") {
    paramsArr = queryString.split("&");
    for(var i=0;i<paramsArr.length;i++) {
      paramStr += ("&"+paramsArr[i]);
    }
  }
  return paramStr;
}

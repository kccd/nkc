// 新的方法将放到nkc对象里，避免变量污染
var nkc = {};
// 定义最后光标对象
var lastEditRange;
function geid(id){return document.getElementById(id);}
function gv(id){return geid(id).value;}
function ga(id,attr){return geid(id).getAttribute(attr);}
function hset(id,content){geid(id).innerHTML=content;}
function display(id){geid(id).style = 'display:inherit;'}

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

function post_api(target,body,callback){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange=function(){
    if (xhr.readyState==4)
    {
      if(xhr.status==200){
        callback(null,xhr.responseText);
      }else {
        callback(xhr.status.toString()+' '+xhr.responseText);
      }
    }
  }
  xhr.open("POST","/api/"+target.toString().toLowerCase(),true);
  xhr.setRequestHeader("Content-type","application/json");
	xhr.setRequestHeader("FROM","nkcAPI");
	xhr.send(JSON.stringify(body));
};

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
     /* if(xhr.status==0||xhr.status>=400) {
        alert(1);
        return callback(res);
      }
      if(res.error || res instanceof Error) {
        callback(res);
      }
      callback(null,res);*/
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

function get_api(target,callback){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange=function(){
    if (xhr.readyState==4){
      if(xhr.status>=200||xhr.status<400){
        callback(null,xhr.responseText);
      }else {
        callback(xhr.status.toString()+' '+xhr.responseText);
      }
    }
  }
  xhr.open("GET",target.toString().toLowerCase(),true);
  xhr.send();
};

function delete_api(target,callback){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange=function(){
    if (xhr.readyState==4){
      if(xhr.status>=200||xhr.status<400){
        callback(null,xhr.responseText);
      }else {
        callback(xhr.status.toString()+' '+xhr.responseText);
      }
    }
  }
  xhr.open("DELETE",target.toString().toLowerCase(),true);
  xhr.send();
};

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

screenTopAlertInit()

function redirect(url){
  var urlnowpath = window.location.pathname
  var urlnowsearch = window.location.search
  var urlnowhash = window.location.hash

  var urlwithouthash = url.slice(0,url.indexOf('#'))

  var urlnow = urlnowpath+urlnowsearch

  if(urlnow==urlwithouthash){
    window.location.href = url
    window.location.reload()
  }else{
    window.location.href = url
  }
}

function nkcAPI(operationName,method,remainingParams){  //操作名，参数
  if(!remainingParams){
    var remainingParams={}
  }
  remainingParams.url = operationName;
  remainingParams.method = method;
  return nkcOperationAPI(remainingParams)
}

/*var NavBarSearch = {
  box:geid('SearchBox'),
  btn:geid('SearchButton'),

  init:function(){
    console.log('NavBarSearch init...');
    NavBarSearch.btn.addEventListener('click',NavBarSearch.search);

    NavBarSearch.box.addEventListener('keypress', NavBarSearch.onkeypress);

  },

  onkeypress:function(){
    e = event ? event :(window.event ? window.event : null);
    if(e.keyCode===13||e.which===13)

    NavBarSearch.search()
  },

  search:function(){
    var searchstr = NavBarSearch.box.value.trim()

    var onSearchResultPage = geid('stringToSearch')?true:false

    var openInNewWindow = null
    if(!onSearchResultPage){
      openInNewWindow = window.open('','_blank')
    }
    //the tricky part. open new window in sync context to prevent blocking.

    nkcAPI('useSearch',{searchstring:searchstr})
    .catch(function(err){
      console.error(err)
    })

    //    https://www.google.com.hk/search?newwindow=1&safe=strict&source=hp&q=zvs+site%3Awww.kechuang.org
    var goto =
    //'https://www.google.com.hk/search?newwindow=1&safe=strict&source=hp&q='

    // 'http://cn.bing.com/search?q='
    // +encodeURI(searchstr)
    // +'+site%3Awww.kechuang.org'

    '/api/operation?operation=viewLocalSearch&searchstring='
    + encodeURI(searchstr);

    (onSearchResultPage?window:openInNewWindow).location.href=goto //alter the address in async context.

    //geid('HiddenLink').setAttribute('href',goto)
    //geid('HiddenLink').click()
    //window.location=goto
    //window.open(goto,'_blank')

  },
};

NavBarSearch.init()
*/
window.ReHighlightEverything = function(){
  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });
}

window.HighlightEverything=function(){
  hljs.configure({tabReplace:'    '})
  hljs.initHighlighting()
}

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
  var URLExtractRegex = /([^“”‘’\/<\'\"\(\[\]\=]|^)\b((?:(?:https?|ftp|file):\/\/|www\.|ftp\.)[-A-Z0-9+&@#/%=~_|$?!:,.]*[A-Z0-9+&@#\/%=~_|$])/gi

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
  common.URLifyHTML = function(content){
    return content.replace(URLExtractRegex,function(match,p1,p2){
      // p3 = p2.replace(/(https|http):\/\//igm,'');
      // return p1+'<a href="http://'+ p3 +'">'+p2+'</a>';
      return p1+'<a href="'+p2+'">'+p2+'</a>';
    })
  }

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
      console.error(err);
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

function subscribeUserSwitch(targetUid) {
  var button = $('.subscribeButton');
  //var button = geid('subscribeButton');
  //button.className = 'btn btn-sm disabled';
  for(var i = 0; i < button.length; i++){
    button[i].className = 'subscribeButton btn btn-sm disabled';
  }
  if(button[0].innerHTML === '关注') {
    nkcAPI('/u/'+targetUid+'/subscribe', 'post', {})
      .then(function() {
        screenTopAlert('关注成功');
        for(var i = 0; i < button.length; i++){
          button[i].innerHTML = '取关';
          button[i].className = 'subscribeButton btn btn-sm btn-danger';
        }
        /*button.innerHTML = '取关';
        button.className = 'btn btn-sm btn-danger';*/
      })
      .catch(function(data) {
        screenTopWarning(data.error);
      })
  }
  else if(button[0].innerHTML === '取关') {
    nkcAPI('/u/'+targetUid+'/subscribe', 'delete', {})
      .then(function() {
        screenTopAlert('成功取消关注');
        for(var i = 0; i < button.length; i++){
          button[i].innerHTML = '关注';
          button[i].className = 'subscribeButton btn btn-sm btn-info';
        }
        /*button.innerHTML = '关注';
        button.className = 'btn btn-sm btn-info';*/
      })
      .catch(function(data) {
        screenTopWarning(data.error);
      })
  }
  else {
    screenTopWarning('未定义的操作.')
  }
}
$('.thumbsUp, .thumbsDown').on('click', function() {
	var span = $(this);
	var pid = span.attr('data-pid');
	if(span.hasClass('thumbsUp')) {
		thumbsDown(pid, function() {
			span.removeClass('thumbsUp');
			span.text(span.text()&&parseInt(span.text())-1>0? parseInt(span.text()) - 1:'');
			screenTopAlert('取消点赞成功');
		})
	}else {
		thumbsUp(pid, function() {
			span.addClass('thumbsUp');
			span.text(span.text()? parseInt(span.text()) + 1:1);
			screenTopAlert('点赞成功');
		})
	}
});

function thumbsUp(pid, callback) {
	nkcAPI('/p/'+pid+'/recommend', 'POST', {})
		.then(function() {
			callback();
		})
		.catch(function(data){
			screenTopWarning(data.error|| data);
		})
}

function thumbsDown(pid, callback) {
	nkcAPI('/p/'+pid+'/recommend', 'DELETE', {})
		.then(function() {
			callback();
		})
		.catch(function(data){
			screenTopWarning(data.error|| data);
		})
}

function recommendPostSwitch(e, targetPid, number) {
  var button = e.target;
  var content = button.innerHTML.replace(/\(.*\)/, '');
  if(content === '推介') {
    nkcAPI('/p/'+targetPid+'/recommend', 'post', {})
      .then(function(data) {
        screenTopAlert('推介成功');
        button.innerHTML = '已推介('+(data.message)+')';
      })
      .catch(function(data) {
        screenTopWarning(data.error);
      })
  }
  else if(content === '已推介') {
    nkcAPI('/p/'+targetPid+'/recommend', 'delete', {})
      .then(function(data) {
        screenTopAlert('成功取消推介');
        button.innerHTML = '推介('+(data.message)+')';
      })
      .catch(function(data) {
        screenTopWarning(data.error);
      })
  }
  else {
    screenTopWarning('未定义的操作.')
  }
}

function forumListVisibilitySwitch() {
  var button = geid('FLVS');
  var indexForumList = geid('indexForumList');
  var value = button.innerHTML;
  var visible = '隐藏学院';
  var invisible = '显示学院';
  if(value === visible) {
    indexForumList.style.display = 'none';
    button.innerHTML = invisible;
    return true
  }
  indexForumList.style.display = 'block';
  button.innerHTML = visible;
  return true
}

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

function uploadFilePromise(url, data, onprogress, method) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.upload.onprogress = function(e) {
      if(onprogress) onprogress(e);
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
  });
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
// 关注用户
function subscribeUser(uid, subscribe) {
	var url = '/u/'+uid+'/subscribe';
	var method = 'POST';
	var alertInfo = '关注成功。';
	if(subscribe === false) {
		method = 'DELETE';
		alertInfo = '已取消关注。';
	}
	nkcAPI(url, method, {})
		.then(function() {
			screenTopAlert(alertInfo);
			setTimeout(function() {
				window.location.reload();
			}, 1000);
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

// 关注领域
function subscribeForum(fid, subscribe) {
	var url = '/f/'+fid+'/subscribe';
	var method = 'POST';
	var alertInfo = '关注成功。';
	if(subscribe === false) {
		method = 'DELETE';
		alertInfo = '已取消关注。';
	}
	nkcAPI(url, method, {})
		.then(function() {
			screenTopAlert(alertInfo);
			setTimeout(function() {
				window.location.reload();
			}, 1000);
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
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



// 新建板块
function newForum(forumType) {
	var displayName = prompt('请输入名称：');
	if(displayName === null) {
		return;
	}
	if(displayName === '') {
		return screenTopWarning('名称不能为空');
	}
	nkcAPI('/f', 'POST', {displayName: displayName, forumType: forumType})
		.then(function(data) {
			screenTopAlert('新建成功，正在前往设置');
			setTimeout(function() {
				window.location.href = '/f/'+data.forum.fid+'/settings';
			}, 1500);
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

function deleteForum(fid) {
	if(confirm('确定要删除？') === false) {
		return;
	}
	nkcAPI('/f/'+fid, 'DELETE', {})
		.then(function() {
			screenTopAlert('删除成功');
			setTimeout(function() {
				window.location.href = '/f';
			}, 1500)
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}


var digestDom;
var creditDom;
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
});


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
          })
      } else if(type === 'kcb') {

        if(num.value > kcb) return screenTopWarning('您的科创币不足');
        var obj = {
          num: num.value,
          description: description.value
        };
        nkcAPI('/p/'+pid+'/credit/kcb', 'POST', obj)
          .then(function() {
            creditDom.modal('hide');
            window.location.reload();
          })
          .catch(function(data) {
            screenTopWarning(data.error || data);
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
      screenTopAlert(alertInfo);
      setTimeout(function(){
        window.location.reload();
      }, 1000);
    })
    .catch(function(data){
      screenTopWarning(data.error)
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


if($('input[data-control="hue"]').length !== 0) {
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

function fromNow(t) {
  if(!moment) throw 'Need to introduce the moment module';
  moment.locale('zh-cn');
  return moment(t).fromNow();
}

function format(s, t) {
  if(t) {
    return moment(t).format(s);
  }
  return moment().format(s);
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
function closeFrameOfAddFriend() {
  var dom = $('#addFriend');
  dom.hide();
  dom.find('.input').hide();
  dom.find('.success').hide();
  dom.find('textarea').val('');
}
function openFrameOfAddFriend(user) {
  var username = user.username;
  var description = user.description;
  var uid = user.uid;
  var dom = $('#addFriend');
  dom.attr('data-uid', uid);
  dom.find('.avatar img').attr('src', '/avatar/' + uid);
  dom.find('.content .username').text(username);
  dom.find('.content .description').text(description);
  dom.find('.input').show();
  dom.find('.success').hide();
  dom.show();
}

function addFriendByUid() {
  var dom = $('#addFriend');
  var uid = dom.attr('data-uid');
  var description = dom.find('textarea').val();
  nkcAPI('/u/' + uid + '/friends', 'POST', {
    description: description
  })
    .then(function(data) {
      dom.find('.input').hide();
      dom.find('.success').show();
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
    })
}

function shareTo(shareType, type, str, title, pid){
  var host = window.location.host;
  var lk = 'http://'+host+'/default/logo3.png'
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
      var newUrl = 'https://' + host + data.newUrl;
      if(type == "link") {
        var copyAreaId = "copyArea"+pid;
        var copyLinkId = "copyLink"+pid;
        var copyButton = "copyVutton"+pid;
        // $("#"+copyAreaId).css("display", "block");
        document.getElementById(copyAreaId).style.display = "block";
        document.getElementById(copyLinkId).value = newUrl;
        // $("#"+copyLinkId).val(newUrl);
        var obj = document.getElementById(copyLinkId);
        obj.select(); 
        // copyLink();
      }
      if(type == "qq") {
        newLink.location='http://connect.qq.com/widget/shareqq/index.html?url='+newUrl+'&title='+title+'&pics='+lk+'&summary='+document.querySelector('meta[name="description"]').getAttribute('content');
        // window.open('http://connect.qq.com/widget/shareqq/index.html?url='+newUrl+'&title='+title+'&pics='+lk+'&summary='+document.querySelector('meta[name="description"]').getAttribute('content'))
      }
      if(type == "qzone") {
        newLink.location='https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+newUrl+'&title='+title+'&pics='+lk+'&summary='+document.querySelector('meta[name="description"]').getAttribute('content');
        // window.open('https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+newUrl+'&title='+title+'&pics='+lk+'&summary='+document.querySelector('meta[name="description"]').getAttribute('content')+'&desc=科创论坛 - 创客极客学术社区');
      }
      if(type == "weibo") {
        newLink.location='http://v.t.sina.com.cn/share/share.php?url='+newUrl+'&title='+title+'&pic='+lk;
        // window.open('http://v.t.sina.com.cn/share/share.php?url='+newUrl+'&title='+title+'&pic='+lk);
      }
      if(type == "weChat") {
        var qrcode
        if(shareType == "post"){
          var qrid = pid+"Qrcode";
          qrcode = geid(qrid);
        }else{
          if(shareType == "forum"){
            var otherCodes = document.getElementsByClassName('forumQrcode');
            // var otherCodes = $(".forumQrcode");
            for(var i in otherCodes){
              var otherCode = otherCodes[i];
              if(otherCode && typeof(otherCode)=="object") {
                otherCode.style.display = "inline-block"
                var path = newUrl;
                path = path.replace(/\?.*/g, '');
                QRCode.toCanvas(otherCode, path, {
                  scale: 3,
                  margin: 1,
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
        // var qrid = shareType+"Qrcode";
        // var qrcode = geid(qrid);
        qrcode.style.display = "inline-block"
        if(qrcode) {
          var path = newUrl;
          path = path.replace(/\?.*/g, '');
          QRCode.toCanvas(qrcode, path, {
            scale: 3,
            margin: 1,
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
      screenTopWarning("请登录")
    })
  }
}

// 复制
function copyLink() {
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
  if(type === 'login') return window.location.href = '/login';
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
      numberIcon.innerHTML = number;
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
    });
}

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
        return header[0].innerText = '未中奖';
      }
      header[0].innerText = result.name;
      var content = domOpen.getElementsByClassName('lottery-info');
      if(content.length === 0) return;
      content[0].innerText = '获得' + kcb + '个科创币';
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

function scrollToBottom() {
  $("html,body").animate({scrollTop: document.body.offsetHeight}, 300)
}
function scrollToTop() {
  $("html,body").animate({scrollTop: 0}, 300)
}


var $postRecycleModel = $('#postRecycleModal');
var $recycleModal = $('#recycleModal');
function disablePostClick(pid, type){
  window.localStorage.pid = pid
  if(type === 'post') {
    $postRecycleModel.modal();
  } else if(type === 'thread'){
    $recycleModal.modal();
  }
  // console.log(window.localStorage)
}

function disablePost(pid,para){
  nkcAPI('/p/'+pid+'/disabled', 'PATCH',{disabled: true,para: para})
    .then(function(res){
      screenTopAlert(pid+' 已屏蔽，请等待刷新')
      //location.reload()
    })
    .catch(function(data) {
      screenTopWarning(data.error)
    })
}

function enablePost(pid){
  nkcAPI('/p/'+pid+'/disabled', 'PATCH',{disabled: false})
    .then(function(){
      screenTopAlert(pid+' 已解除屏蔽，请手动刷新')
      // location.reload()
    })
    .catch(function(data) {
      screenTopWarning(data.error)
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
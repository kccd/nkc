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
  xhr.onreadystatechange=function(){
    var res;
    if (xhr.readyState==4){
      try {
        res = JSON.parse(xhr.responseText);
      } catch(e) {
        res = xhr.responseText
      }
      if(xhr.status==0||xhr.status>=400)
        callback(res);
      if(res.error || res instanceof Error)
        callback(res);
      callback(null,res);
      }
    }

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
      if(err)return reject(err);
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
      p3 = p2.replace(/(https|http):\/\//igm,'')
      return p1+'<a href="http://'+ p3 +'">'+p2+'</a>'
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
      codeResource = "<video src=" + myValue + " controls style=max-width:50%>video</video>"
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

function postUpload(url, data, callback) {
	var xhr = new XMLHttpRequest();
	xhr.upload.onprogress = function(e) {
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
				var data = JSON.parse(xhr.responseText);
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
})
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
function newForum() {
	var displayName = prompt('请输入板块名：');
	if(displayName === null) {
		return;
	}
	if(displayName === '') {
		return screenTopWarning('板块名称不能为空');
	}
	nkcAPI('/f', 'POST', {displayName: displayName})
		.then(function(data) {
			screenTopAlert('新建板块成功，正在前往板块设置');
			setTimeout(function() {
				window.location.href = '/f/'+data.forum.fid+'/settings';
			}, 1500);
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

function deleteForum(fid) {
	if(confirm('确定要删除该板块？') === false) {
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

$(function () {
	var tooltipElements = $('[data-toggle="tooltip"]');
	if(tooltipElements.length > 0) {
		$('[data-toggle="tooltip"]').tooltip();
	}
	iconSwitch();
});

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
	nkcAPI('/p/'+pid+'/digest', 'POST', {})
		.then(function() {
			screenTopAlert('设置成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}
// 取消回复精选
function unDigestPost(pid) {
	nkcAPI('/p/'+pid+'/digest', 'DELETE', {})
		.then(function() {
			screenTopAlert('取消精选成功');
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

function playBeep(name) {
  var audio = document.getElementById('beep');
  if(!audio) return;
  var src = "/default/" + name + '.wav';
  audio.setAttribute('src', src);
  audio.play();
}
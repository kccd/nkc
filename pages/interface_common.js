import {generalRequest, nkcAPI, nkcUploadFile} from "./lib/js/netAPI";
import {toLogin} from "./lib/js/account";
import {
  sweetAlert,
  sweetWarning,
  sweetConfirm,
  sweetQuestion,
  sweetError,
  sweetInfo,
  sweetPrompt,
  sweetSuccess,
  asyncSweetCustom,
  asyncSweetSuccess,
  asyncSweetError,
  asyncSweetSelf
} from './lib/js/sweetAlert';

import {
  screenTopAlert,
  screenTopWarning,
  jalert,
  jwarning
} from "./lib/js/topAlert";
import Credit from "./lib/vue/Credit.vue"

// 定义最后光标对象
window.lastEditRange = undefined;
function geid(id){return document.getElementById(id);}
function gv(id){return geid(id).value;}
function ga(id,attr){return geid(id).getAttribute(attr);}
function hset(id,content){geid(id).innerHTML=content;}
function display(id){geid(id).style = 'display:inherit;'}

Object.assign(window, { geid, gv, ga, hset, display })
var app;

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

window.HighlightEverything = function(){
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
    window.lastEditRange = selection.getRangeAt(0)
  });
  $("#text-elem").on("keyup",function(){
    var selection = document.getSelection();
    window.lastEditRange = selection.getRangeAt(0)
  });
});
/***********************************************************************************************/

/*
* 上传文件 兼容旧代码
* */
function uploadFilePromise(url, data, onprogress, method) {
  return nkcUploadFile(url, method, data, onprogress);
}

// 封禁用户
function bannedUser(uid, banned) {
	var method = 'PUT';
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


// var digestDom;
var creditDom;
var postWarningDom;
var creditScoreName = '';
$(function () {
	var tooltipElements = $('[data-toggle="tooltip"]');
	if(tooltipElements.length > 0) {
		$('[data-toggle="tooltip"]').tooltip();
	}

	// 精选弹窗
  // digestDom = $('#digestModel');
  // if(digestDom.length !== 0) {
  //   digestDom.modal({
  //     show: false
  //   });
  // }
  creditDom = $('#creditModel');
  if(creditDom.length !== 0) {
    creditDom.modal({
      show: false
    });
    creditScoreName = creditDom.attr('data-credit-score-name');
  }

  postWarningDom = $("#module_post_warning");
  if(postWarningDom.length !== 0) {
    postWarningDom.modal({
      show: false
    });
  }

  // 分页 快速跳转
  ;(function () {
    var input = document.getElementById("paging_nav_input");
    if (!input) return;
    input.onkeydown = function (e) {
      if (e.key === "Enter" || e.keyCode === 13) {
        var button = document.getElementById("paging_nav_button");
        if (!button) return;
        button.click();
      }
    }
  })();
  // 页面顶部 搜索
  ;(function() {
    var initInput = function(input) {
      var id = input.attr('id');
      input.keydown(function(e) {
        if(e.keyCode === 13) {
          NKC.methods.search(id);
        }
      })
    };

    var navInput = $('.navbar-search input');
    for(var i = 0; i < navInput.length; i++) {
      var input = navInput.eq(i);
      initInput(input);
    }
  })();
  // 全局时间更新
  ;(function() {
    var updateTime = function() {
      setTimeout(function() {
        var times = $('[data-type="nkcTimestamp"]');
        for(var i = 0; i < times.length; i++) {
          var time = times.eq(i);
          var timeType = time.attr('data-time-type');
          var number = time.attr('data-time');
          number = Number(number);
          var func;
          if(timeType === 'fromNow') {
            func = NKC.methods.tools.fromNow;
          } else if(timeType === 'briefTime') {
            func = NKC.methods.tools.briefTime;
          } else {
            continue;
          }
          var newContent = func(number);
          if(time.text() !== newContent) {
            time.text(newContent);
          }
        }
        updateTime();
      }, 30 * 1000);
    }
    updateTime();
  })();
});

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
      sweetSuccess('提交成功');
    })
    .catch(function(data) {
      sweetError(data);
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
  // var title = {
  //   xsf: '评学术分',
  //   kcb: '鼓励'
  // }[type];
  // creditDom.one('show.bs.modal', function(event) {
  //   var button = event.currentTarget.getElementsByClassName('btn');
  //   var t = event.currentTarget.getElementsByClassName('modal-title');
  //   var kcbInfo = event.currentTarget.getElementsByClassName('kcb-info');
  //   var xsfInfo = event.currentTarget.getElementsByClassName('xsf-info');
  //   var num = event.currentTarget.getElementsByClassName('num')[0];
  //   console.log(num);
  //   var description = event.currentTarget.getElementsByClassName('description')[0];
  //   if(type === 'kcb') {
  //     for(var i = 0 ; i < xsfInfo.length; i++) {
  //       xsfInfo[i].style.display = 'none';
  //     }
  //     for(var i = 0 ; i < kcbInfo.length; i++) {
  //       kcbInfo[i].style.display = 'inline-block';
  //     }
  //     num.value = '';
  //   } else {
  //     num.value = '';
  //     for(var i = 0 ; i < kcbInfo.length; i++) {
  //       kcbInfo[i].style.display = 'none';
  //     }
  //     for(var i = 0 ; i < xsfInfo.length; i++) {
  //       xsfInfo[i].style.display = 'inline-block';
  //     }
  //   }
  //   description.value = '';
  //   t[0].innerText = title;
  //   // 确定
  //   button[1].onclick = function() {
  //     button[1].setAttribute("disabled", "disabled");
  //     if(type === 'xsf') {
  //       var obj = {
  //         num: num.value,
  //         description: description.value
  //       };
  //       return nkcAPI('/p/'+pid+'/credit/xsf', 'POST',obj)
  //         .then(function(){
  //           creditDom.modal('hide');
  //           window.location.reload();
  //         })
  //         .catch(function(data) {
  //           screenTopWarning(data.error)
  //           button[1].removeAttribute("disabled");
  //         })
  //     } else if(type === 'kcb') {

  //       if(num.value*100 > kcb) return screenTopWarning('你的'+creditScoreName+'不足');
  //       var obj = {
  //         num: num.value*100,
  //         description: description.value
  //       };
  //       nkcAPI('/p/'+pid+'/credit/kcb', 'POST', obj)
  //         .then(function() {
  //           creditDom.modal('hide');
  //           window.location.reload();
  //         })
  //         .catch(function(data) {
  //           screenTopWarning(data.error || data);
  //           button[1].removeAttribute("disabled");
  //         });
  //     }
  //   }
  // });
  // //请求数据
  // let data;
  // nkcAPI(`/t/${location.pathname.split("/")[2]}/rewards` ,"GET")
  //   .then((res) => {
  //     data = res
  //     // console.log(res);
  //     const creditModel = $("#creditModel");
  //     creditModel.attr('data-credit-score-name', data.creditScore.name);
  //     const currency = $(".currency");
  //     const xsfRange = $(".xsf-range");
  //     const kcbRange = $(".kcb-range");
  //     currency.text(`向作者转账${data.creditScore.name}以资鼓励`);
  //     kcbRange.text(`（${data.creditSettings.min/100} - ${data.creditSettings.max/100}）`);
  //     xsfRange.text(`（-${data.xsfSettings.reduceLimit} 到 ${data.xsfSettings.addLimit}）`)
  //   })
  //   .catch((err) => {
  //     sweetError(err)
  //   })
  // creditDom.modal('show');
  if(!app) {
    app = new Vue({
      el: "#module_credit",
      data: {
        pid,
        type,
        kcb,
        show: true
      },
      components: {
        "credit-model": Credit
      },
      methods: {
        dialogClose(){
          this.show = false
        }
      }
    });
  }
  app.pid = pid
  app.type = type
  app.kcb = kcb
  app.show = true;
}

/*if($('input[data-control="hue"]').length !== 0 && $('input[data-control="hue"]').minicolors) {
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
}*/

// 首页置顶
function homeTop(tid, latest) {
	nkcAPI('/t/'+tid+'/hometop', 'POST', {
    type: latest
  })
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}
// 取消首页置顶
function unHomeTop(tid, latest) {
  var url = '/t/' + tid + '/hometop';
  if(latest) {
    url += `?type=${latest}`;
  }
	nkcAPI(url, 'DELETE', {})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}
// 最新页置顶
function latestTop(tid) {
  homeTop(tid, 'latest');
}
// 取消最新页置顶
function unLatestTop(tid) {
  unHomeTop(tid, 'latest');
}
// 首页推荐
function unHomeAd(tid) {
  nkcAPI("/t/" + tid + "/ad", "DELETE")
    .then(function() {
      window.location.reload();
    })
    .catch(sweetError);
}

// 社区置顶
function communityTop(tid, topped) {
  if(topped) {
    homeTop(tid, 'community');
  } else {
    unHomeTop(tid, 'community');
  }
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
        // if(digestDom.length > 0) {
        //   digestDom.modal('hide');
        // }
        window.RootApp.closeDigest();
        window.location.reload();
      })
      .catch(function(data) {
        screenTopWarning(data.error||data);
      })
  };
  window.RootApp.openDigest((kcb) => {
    post({kcb});
  });
  // if(digestDom.length === 0) {
  //   return post({});
  // }
  // digestDom.one('show.bs.modal', function(event) {
  //   var button = event.currentTarget.getElementsByTagName('button');
  //   if(!button[2]) return;
  //   button[2].onclick = function() {
  //     var input = event.currentTarget.getElementsByTagName('input');
  //     var num = input[0].value;
  //     num = Number(num);
  //     num = num*100;
  //     if(typeof num !== "number" || num%1 !== 0) return screenTopWarning("请输入正确的数额");
  //     var obj = {kcb: num};
  //     post(obj);
  //   }
  // });
  // digestDom.modal('show');
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

function postsVote(pid, type) {
  if(!NKC.configs.uid || type === 'login') return toLogin('login');
  var url = '/p/' + pid + '/vote/down';
  if(type === 'up') {
    url = '/p/' + pid + '/vote/up';
  }
  nkcAPI(url, 'POST', {})
    .then(function(data) {
      var number = data.post.voteUp;
      const upIcon = $(`.posts-vote-up[data-pid="${pid}"]`);
      const downIcon = $(`.posts-vote-down[data-pid="${pid}"]`);
      const numberIcon = $(`.posts-vote-number[data-pid="${pid}"]`);
      const up = upIcon.hasClass('active');
      const down = downIcon.hasClass('active');
      /*var upIcon = document.querySelector('.posts-vote-up[data-pid="'+pid+'"]');
      var downIcon = document.querySelector('.posts-vote-down[data-pid="'+pid+'"]');
      var numberIcon = document.querySelector('.posts-vote-number[data-pid="'+pid+'"]');*/
      /*var up = upIcon.classList.contains('active');
      var down = downIcon.classList.contains('active');*/

      if(type === 'up') { // 点赞
        if(up) { // 若已经点过赞则取消已点赞背景且数字减一
          downIcon.removeClass('active');
          upIcon.removeClass('active');
          /*downIcon.classList.remove('active');
          upIcon.classList.remove('active');*/
        } else { // 若没点过赞则添加已点赞背景且数字加一
          downIcon.removeClass('active');
          upIcon.addClass('active');
          /*downIcon.classList.remove('active');
          upIcon.classList.add('active');*/
        }
      } else { // 点踩
        if(down) {
          // 若已经点过踩了则取消点踩背景
          upIcon.removeClass('active');
          downIcon.removeClass('active');
          /*upIcon.classList.remove('active');
          downIcon.classList.remove('active');*/
        } else { // 若没点过踩
          if(up) { // 若点过赞则取消点赞背景且数字减一并添加点踩背景
            upIcon.removeClass('active');
            downIcon.addClass('active');
            /*upIcon.classList.remove('active');
            downIcon.classList.add('active');*/
          } else { // 若没点过赞则直接添加点踩背景
            upIcon.removeClass('active');
            downIcon.addClass('active');
            /*upIcon.classList.remove('active');
            downIcon.classList.add('active');*/
          }
        }
      }
      numberIcon.text(number||"");
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
    });
}

// 屏蔽鼓励原因
function hideKcbRecordReason(pid, recordId, hide) {
  nkcAPI("/p/" + pid + "/credit/kcb/" + recordId, "PUT", {
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
      var score = data.score;
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
      content[0].innerText = '获得' + score.name + numToFloatTwo(score.num) + score.unit;
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
  nkcAPI('/p/'+pid+'/disabled', 'PUT',{disabled: true,para: para})
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


function numToFloatTwo(str) {
	str = (str/100).toFixed(2);
	return str;
}

var nkcDrawerBodyTop = 0;

// 更新新消息条数
function updateNavNewMessageCount(count) {
  window.RootApp.updateNewMessageCount(count);
}


//抽屉开关
function toggleNKCDrawer(type) {
  var nkcDrawer = $(".nkc-drawer-"+type);
  //激活状态下关闭抽屉
  if(nkcDrawer.hasClass('active')) {
    closeNKCDrawer(type);
  } else {
    //否则就打开抽屉
    openNKCDrawer(type);
    //实例化vue
    // if(type === 'left') {
    //   showLeftDrawVue(type);
    // } else if (type === 'right') {
    //   showRightDrawVue(type);
    // }
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

/*
* 设置文章或回复通过审核
* @param {String} pid postId
* @author pengxiguaa 2019-7-26
* */
function reviewPost(pid) {
  nkcAPI("/review", "PUT", {
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

Object.assign(window, {
  generalRequest,
  nkcAPI,
  nkcUploadFile,
  jalert,
  jwarning,
  sweetAlert,
  sweetSuccess,
  sweetError,
  sweetInfo,
  sweetWarning,
  sweetConfirm,
  sweetQuestion,
  asyncSweetSelf,
  asyncSweetCustom,
  asyncSweetSuccess,
  asyncSweetError,
  screenTopAlert,
  screenTopWarning,
  redirect,
  common,
  postUpload,
  uploadFile,
  uploadFilePromise,
  bannedUser,
  newElement,
  deleteForum,
  openPostWarningDom,
  submitPostWarning,
  cancelXsf,
  credit,
  homeTop,
  unHomeTop,
  latestTop,
  unLatestTop,
  unHomeAd,
  openThread,
  closeThread,
  digestPost,
  unDigestPost,
  shareTo,
  copyLink,
  postsVote,
  hideKcbRecordReason,
  lottery,
  closeLottery,
  scrollToBottom,
  scrollToTop,
  disablePostClick,
  disablePost,
  enablePost,
  disabledThread,
  numToFloatTwo,
  nkcDrawerBodyTop,
  toggleNKCDrawer,
  stopBodyScroll,
  openLeftDrawer,
  communityTop,
  openRightDrawer,
  closeDrawer,
  reviewPost,
  switchChildren,
  reload,
  openToNewLocation,
  addApptypeToUrl,
  sweetPrompt,
  updateNavNewMessageCount,
});

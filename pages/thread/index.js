var SubscribeTypes, UserInfo, surveyForms = [], draftId = "", author = {};
var hidePostMaxHeight;
var hidePostFloat;
var Attachments;
var quotePostApp;
$(document).ready(function(){
  var DW = $(document).width();
  hidePostFloat = NKC.configs.postHeight.float;
  if(DW < 768) {
    hidePostMaxHeight = NKC.configs.postHeight.xs;
  } else if(DW < 992) {
    hidePostMaxHeight = NKC.configs.postHeight.sm;
  } else {
    hidePostMaxHeight = NKC.configs.postHeight.md;
  }
  var hidePostDom = $(".hide-post.part");

  new Promise(function(resolve, reject) {
  	if(NKC.configs.isApp) {
  		setTimeout(function() {
  		  resolve();
		  }, 500)
	  } else {
  		resolve();
	  }
  })
	  .then(function() {
		  for(var i = 0; i < hidePostDom.length; i++) {
			  var d = hidePostDom.eq(i);
			  var contentDom = d.find(".thread-post-mask");
			  var pid = d.attr("data-pid");
			  if(contentDom.height() > hidePostMaxHeight) {
				  hidePost(pid);
				  $(".hide-post-button[data-pid='"+pid+"']").css({
					  "display": "inline-block"
				  });
			  }
		  }
	  })
	  .catch(function(data) {
	  	console.error(data);
	  });

  if(window.moduleToColumn) {
    moduleToColumn.init();
  }
  if(!window.SubscribeTypes && NKC.modules.SubscribeTypes) {
    SubscribeTypes = new NKC.modules.SubscribeTypes();
  }
  if(NKC.modules.UserInfo) {
    UserInfo = new NKC.modules.UserInfo();
	}

	if($("#container").length) {
		autoSaveDraft();
	}

  var surveyFormsDom = $(".module-survey-form");
  for(var i = 0; i < surveyFormsDom.length; i++) {
    var dom = surveyFormsDom.eq(i);
    var id = dom.attr("id");
    var form = new NKC.modules.SurveyForm("#" + id);
    form.init();
    surveyForms.push(form);
  }


  author.dom = $("#moduleAuthor");
  author.app = new Vue({
	  el: "#moduleAuthorApp",
	  data: {
		  contract: ""
	  }
  });

  $("#moduleAuthor").modal({
	  show: false
  });


	//编辑器缩放
  NKC.methods.markDom($("#highlight>.highlight"));
	if($(".w-e-text-container").length === 0) return;
	$(".w-e-text-container").resizable({
		containment: '#body',
		minHeight: 100,
		minWidth: 100,
		maxWidth: 1400
	});
	if($(window).width()<750){
		$('.ThreadTitleText').css('font-size','20px');
		/*$('.ThreadTitle1').css('width','80%');
		$('.ThreadTitle2').css('width','18%');*/
		$('.airnum1').css('font-size','16px');
		$('.airnum2').css('font-size','16px');
		$('.airnum3').css('font-size','10px');
	}
	if($(window).width()<433){
		$('.ThreadTitle1').css('width','65%');
	}
	// var qrcode = geid('qrcode');
	// if(qrcode) {
	// 	var path = window.location.href;
	// 	path = path.replace(/\?.*/g, '');
	// 	QRCode.toCanvas(qrcode, path, {
	// 		scale: 3,
	// 		margin: 1,
	// 		color: {dark: '#000000'}
	// 	}, function(err) {
	// 		if(err){
	// 			screenTopWarning(err);
	// 		}
	// 	})
	// }



	// var qrcodeArr = $('.qrcode');

	// for(var i = 0; i < qrcodeArr.length; i++) {
	// 	var q = qrcodeArr.eq(i);
	// 	var pid = q.attr('data-pid');
	// 	q = q.get(0);
	// 	var path = window.location.origin + '/p/' + pid;
	// 	QRCode.toCanvas(q, path, {
	// 		scale: 3,
	// 		margin: 2,
	// 		color: {dark: '#000000'}
	// 	}, function(err) {
	// 		if(err){
	// 			screenTopWarning(err);
	// 		}
	// 	})
	// }


	var editor = geid('ReplyContent');

	var proxy = geid('proxy');
	if(proxy){
		proxy.addEventListener('click', function(e) {
			replace_selection(editor, e.target.getAttribute('data-unicode'), true)
		})
	}
	scrollTo(0,0);

	var quoteDom = document.getElementById('quotePost');
	if(quoteDom) {
	  var s = JSON.parse(quoteDom.innerText);
	  quotePost(s.pid, s.step, s.page);
  }


});
function addToColumn(pid, columnId) {
  moduleToColumn.show(function(data) {
    var columnId = data.columnId;
    var categoriesId = data.categoriesId;
    nkcAPI("/m/" + columnId + "/post", "POST", {
      type: "addToColumn",
      categoriesId: categoriesId,
      postsId: [pid]
    })
      .then(function() {
        window.location.reload();
        moduleToColumn.hide();
      })
      .catch(function(data) {
        screenTopWarning(data);
      });
  }, {
    selectMul: true
  });
}
function removeToColumn(pid, columnId) {
  nkcAPI("/m/" + columnId + "/post", "POST", {
    type: "removeColumnPostByPid",
    postsId: [pid]
  })
    .then(function() {
      window.location.reload();
    })
    .catch(function(data) {
      screenTopWarning(data);
    });
}

function get_selection(the_id)
{
	var e = typeof(the_id)=='String'? document.getElementById(the_id) : the_id;

	//Mozilla and DOM 3.0
	if('selectionStart' in e)
	{
		var l = e.selectionEnd - e.selectionStart;
		return { start: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l) };
	}
	//IE
	else if(document.selection)
	{
		e.focus();
		var r = document.selection.createRange();
		var tr = e.createTextRange();
		var tr2 = tr.duplicate();
		tr2.moveToBookmark(r.getBookmark());
		tr.setEndPoint('EndToStart',tr2);
		if (r === null || tr === null) return { start: e.value.length, end: e.value.length, length: 0, text: '' };
		var text_part = r.text.replace(/[\r\n]/g,'.'); //for some reason IE doesn't always count the \n and \r in the length
		var text_whole = e.value.replace(/[\r\n]/g,'.');
		var the_start = text_whole.indexOf(text_part,tr.text.length);
		return { start: the_start, end: the_start + text_part.length, length: text_part.length, text: r.text };
	}
	//Browser not supported
	else return { start: e.value.length, end: e.value.length, length: 0, text: '' };
}

function replace_selection(the_id,replace_str,setSelection)
{
	var e = typeof(the_id)==='string'? document.getElementById(the_id) : the_id;
	selection = get_selection(the_id);
	var start_pos = selection.start;
	var end_pos = start_pos + replace_str.length;
	e.value = e.value.substr(0, start_pos) + replace_str + e.value.substr(selection.end, e.value.length);
	if(setSelection)set_selection(the_id,end_pos,end_pos);
	return e.focus();
}

function set_selection(the_id,start_pos,end_pos)
{
	var e = typeof(the_id)==='string'? document.getElementById(the_id) : the_id;

	//Mozilla and DOM 3.0
	if('selectionStart' in e)
	{
		e.focus();
		e.selectionStart = start_pos;
		e.selectionEnd = end_pos;
	}
	//IE
	else if(document.selection)
	{
		e.focus();
		var tr = e.createTextRange();

		//Fix IE from counting the newline characters as two seperate characters
		var stop_it = start_pos;
		for (i=0; i < stop_it; i++) if( e.value.charAt(i).search(/[\r\n]/) !== -1 ) start_pos = start_pos - .5;
		stop_it = end_pos;
		for (i=0; i < stop_it; i++) if( e.value.charAt(i).search(/[\r\n]/) !== -1 ) end_pos = end_pos - .5;

		tr.moveEnd('textedit',-1);
		tr.moveStart('character',start_pos);
		tr.moveEnd('character',end_pos - start_pos);
		tr.select();
	}
	return get_selection(the_id);
}

var replyTarget = ga('replytarget','value');
var screenTopAlert = screenTopAlert;


function cartThread(tid){
	nkcAPI('addThreadToCart',{tid:tid})
		.then(function(){
			return screenTopAlert(tid + ' added to cart')
		})
		.catch(function(data) {
			screenTopWarning(data.error)
		})
}

function cartPost(pid){
	nkcAPI('addPostToCart',{pid:pid})
		.then(function(){
			return screenTopAlert(pid + ' added to cart')
		})
		.catch(function(data) {
			screenTopWarning(data.error)
		})
}

function setDigest(tid) {
	nkcAPI('/t/'+tid+'/digest', 'POST', {})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}

function cancelDigest(tid) {
	nkcAPI('/t/'+tid+'/digest', 'DELETE', {})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}

function setTopped(tid) {
	nkcAPI('/t/'+tid+'/topped', 'POST', {})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}

function cancelTopped(tid) {
	nkcAPI('/t/'+tid+'/topped', 'DELETE', {})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}

/*function setDigest(tid){
  var setDigest = '设置精华';
  var unSetDigest = '撤销精华';
  var dateObj = {};
  var status = geid('threadDigest');
  if(status.innerHTML === setDigest) dateObj = {digest: true};
  else if(status.innerHTML === unSetDigest) dateObj = {digest: false};
  else return screenTopWarning('到底是要设置精华还是撤销精华？');
  nkcAPI('/t/'+tid+'/digest', 'PUT',dateObj)
  .then(function(back){
    var oldStatus = status.innerHTML;
    if(status.innerHTML === setDigest) {
      status.innerHTML = unSetDigest;
    } else {
      status.innerHTML = setDigest;
    }
    $(this).text();
    return screenTopAlert(tid + oldStatus + '成功');
  })
  .catch(function(data){
    screenTopWarning('操作失败： ' + data.error);
  })
}*/

/*function setTopped(tid){
  var dataObj = {};
  var setTop = '设置置顶';
  var unSetTop = '撤销置顶';
  var status = geid('threadTop');
  if(status.innerHTML === setTop) dataObj = {topped: true};
  else if(status.innerHTML === unSetTop) dataObj = {topped: false};
  else return screenTopWarning('到底是要设置置顶还是撤销置顶？');
  nkcAPI('/t/'+tid+'/topped', 'PUT',dataObj)
  .then(function(back){
    var oldStatus = status.innerHTML;
    if(oldStatus === setTop) {
      status.innerHTML = unSetTop;
    } else {
      status.innerHTML = setTop;
    }
    return screenTopAlert(tid + oldStatus + '成功');
  })
  .catch(function(data){
    return screenTopWarning('操作失败： ' + data.error);
  })
}*/

function assemblePostObject(){  //bbcode , markdown
	/*var quoteHtml = document.getElementById('quoteContent').innerHTML;
	var replyHtml = ue.getContent();
	// if(replyHtml.replace(/<[^>]+>/g,"")==''){screenTopWarning('请填写内容。');return;}
	var replyContent = quoteHtml + replyHtml;
	var post = {
		//t:gv('title').trim(),

		//c:gv("ReplyContent"),
		c: replyContent,
		l:"html",
	}
	/!*if(geid('ParseURL').checked){
		if(post.l=='markdown'){
			post.c = common.URLifyMarkdown(post.c)
		}
		if(post.l=='pwbb'){
			post.c = common.URLifyBBcode(post.c)
		}
		if(post.l=='html'){
			post.c = common.URLifyHTML(post.c)
		}
	}*!/
	//  return console.log(post.c)
	post.c = post.c.replace(/\[\/quote] *\n+/gi,'[/quote]')*/

	/* 2020-3-26 pengxiguaa */
	var post = {
		c: ue.getContent(),
		l: "html"
	};
	if(window.quotePostApp && window.quotePostApp) {
		post.quote = window.quotePostApp.pid
	}
	return post
}


// 公式处理
function modifyMathJax() {
  $("#ReplyContent").find(".MathJax_Preview").each(function(){
    if($(this).next().next().length !== 0){
      var mathfur;
      if($(this).next().next().attr("type").length > 15){
        mathfur = "$$" + $(this).next().next().html() + "$$";
      }else{
        mathfur = "$" + $(this).next().next().html() + "$";
      }
      $(this).next().next().replaceWith(mathfur);
      $(this).next().replaceWith("");
      $(this).replaceWith("")
    }else{
      $(this).parent().remove()
    }
  });
}
// 构建post数据
function getPost() {
  var post = assemblePostObject();
  if(!post || post.c.replace(/<[^>]+>/g,"") === ''){
    throw "请填写回复内容"
  }
  // 专栏文章分类
  post.columnCategoriesId = getSelectedColumnCategoriesId();
  var sendAnonymousPostDom = $("#sendAnonymousPost");
  if(sendAnonymousPostDom.length) {
    post.anonymous = sendAnonymousPostDom.prop("checked");
  }
  return post;
}

// 自动保存草稿
function autoSaveDraft() {
	setTimeout(function() {
		Promise.resolve()
			.then(function() {
				var post = getPost();
				post.t = '';
				var method = "POST";
				var url = "/u/"+NKC.configs.uid+"/drafts";
				var data = {
					post: post,
					draftId: draftId,
					desType: "thread",
					desTypeId: $("#threadId").text()
				};
				return nkcAPI(url, method, data);
			})
			.then(function(data) {
				draftId = data.draft.did;
				autoSaveDraft();
			})
			.catch(function(err) {
				console.log(err);
				autoSaveDraft();
			});
	}, 60000);
}
// 保存草稿
function saveDraft(threadId,userId){
  Promise.resolve()
    .then(function() {
      modifyMathJax();
      // 获取回复的内容
      var post = getPost();
      post.t = '';
      var method = "POST";
      var url = "/u/"+userId+"/drafts";
      var data = {
        post: post,
        draftId: draftId,
        desType: "thread",
        desTypeId: threadId
      };
      return nkcAPI(url, method, data)
    })
    .then(function(data) {
      draftId = data.draft.did;
      sweetSuccess("保存成功");
    })
    .catch(function(data) {
      sweetError(data);
    });
}
// 设置回复提交按钮的样式
function setSubmitButton(submitting) {
  // 正在提交
  var button = $("#ButtonReply");
  if(submitting) {
    button.attr("disabled", "disabled");
    button.html("回复中... <span class='fa fa-spinner fa-spin'>");
  } else { // 未提交
    button.removeAttr("disabled");
    button.html("回复");
  }
}
// 发表回复
function submit(tid) {
  Promise.resolve()
    .then(function() {
      // 屏蔽发表按钮
      setSubmitButton(true);
      modifyMathJax();
      // 获取回复的内容
      var post = getPost();
      if(draftId) {
        post.did = draftId;
      }
      return nkcAPI('/t/' + tid, 'POST', {
        post: post,
      })
    })
    .then(function(data) {
    	if(NKC.configs.platform === 'reactNative') {
				NKC.methods.visitUrlAndClose(data.redirect);
			} else {
				openToNewLocation(data.redirect);
			}
    })
    .catch(function(data) {
      sweetError(data);
      setSubmitButton(false);
    })
}

// 点击引用
function quotePost(pid){
	if(!window.quotePostApp) {
		window.quotePostApp = new Vue({
			el: "#quoteContent",
			data: {
				username: "",
				uid: "",
				step: "",
				c: "",
				pid: ""
			},
			methods: {
				getUrl: NKC.methods.tools.getUrl,
				load: function(pid) {
					var self = this;
					nkcAPI('/p/' + pid + "/quote", "GET")
						.then(function(data) {
							var qp = data.quotePost;
							if(!qp || !qp.pid) return;
							self.username = qp.username;
							self.uid = qp.uid;
							self.pid = qp.pid;
							self.step = qp.step;
							self.c = qp.c;
							window.location.href='#container';
						})
						.catch(sweetError);
				},
				clear: function() {
					this.username = "";
					this.uid = "";
					this.step = "";
					this.c = "";
					this.pid = "";
				}
			}
		});
	}
	window.quotePostApp.load(pid);
}

function dateTimeString(t){
	return new Date(t).toLocaleString()
}

function at(username) {
	if(!ue) return screenTopAlert('权限不足');
	ue.execCommand('inserthtml', '@'+username);
	window.location.href = "#container";
	// openToNewLocation('#container');
}

function goEditor(){
	window.localStorage.quoteHtml = document.getElementById("quoteContent").innerHTML;
	window.localStorage.replyHtml = ue.getContent();
	//return console.log(window.localStorage)
	// window.location = '/editor?type=thread&id='+replyTarget.trim().split('/')[1];
	openToNewLocation('/editor?type=thread&id='+replyTarget.trim().split('/')[1])
}




function extractfid(){
	var targetforum = gv('TargetForum').trim().split(':')
	if(targetforum.length!==2)return screenTopWarning('请选择一个目标')
	targetforum = targetforum[0]
	return targetforum
}

function moveThreadTo(tid){
	var fid = extractfid()
	askCategoryOfForum(fid)
		.then(function(cid){
			return moveThread(tid,fid,cid)
		})
		.then(function(){
			screenTopAlert('请刷新')
		})
		.catch(function(data) {
			screenTopWarning(data.error)
		})
}

function askCategoryOfForum(fid){
	fid = fid.toString()
	return nkcAPI('/f/'+fid+'/category','GET',{})
		.then(function(arr){
			arr = arr.categorys;
			if(!arr.length)return null
			return screenTopQuestion('请选择一个分类：',['0:（无分类）'].concat(arr.map(function(i){return i.cid+':'+i.name})))
		})
		.then(function(str){
			//console.log('selected:',str.split(':')[0]);
			if(!str)return 0;
			return str.split(':')[0]
		})
}

function recycleThread(tid){
	moveThread(tid,'recycle', 0)
}

function widerArea(){
	var rc = geid('ReplyContent')
	rc.rows = 10
	rc.style.resize='vertical'
	geid('WiderArea').style.display = 'none'
}

function switchVInPersonalForum(tid, name, type) {
	var hidden;
	var visible;
	var target;
	if(!name) {
		hidden = '恢复专栏显示';
		visible = '在专栏隐藏';
		target = geid('visibility');
		var hideInMid = false;
		if(target.innerHTML === visible) hideInMid = true;
		nkcAPI('/t/'+tid+'/switchInPersonalForum', 'PUT',{hideInMid: hideInMid})
			.then(function() {
				if(target.innerHTML === hidden) {
					target.innerHTML = visible;
					screenTopAlert('已恢复该帖在专栏的显示');
					return
				}
				target.innerHTML = hidden;
				screenTopAlert('已在专栏屏蔽该帖');
				return
			})
			.catch(function(data) {
				screenTopWarning(data.error)
			})
	}
	if(type === 'MF') {
		hidden = '在' + name + '显示';
		visible = '在' + name + '隐藏';
		target = geid('MFVisibility');
		nkcAPI('switchVInPersonalForum',{tid: tid})
			.then(function() {
				if(target.innerHTML === hidden) {
					target.innerHTML = visible;
					screenTopAlert('已恢复该帖在' + name + '的显示');
					return
				}
				target.innerHTML = hidden;
				screenTopAlert('已在' + name + '屏蔽该帖');
				return
			})
			.catch(function(data) {
				screenTopWarning(data.error)
			})
	}
	if(type === 'OF') {
		hidden = '在' + name + '显示';
		visible = '在' + name + '隐藏';
		target = geid('OFVisibility');
		nkcAPI('switchVInPersonalForum',{tid: tid})
			.then(function() {
				if(target.innerHTML === hidden) {
					target.innerHTML = visible;
					screenTopAlert('已恢复该帖在' + name + '的显示');
					return
				}
				target.innerHTML = hidden;
				screenTopAlert('已在' + name + '屏蔽该帖');
				return
			})
			.catch(function(data) {
				screenTopWarning(data.error)
			})
	}
}

function moveToPersonalForum(tid) {
	var target = geid('moveToPersonal')
	nkcAPI('moveToPersonalForum', {tid: tid})
		.then(function() {
			screenTopAlert('已将该帖送回个人专栏')
			target.innerHTML = '';
		})
		.catch(function(data) {
			screenTopWarning(data.error)
		})
}

function switchDInPersonalForum(tid, name, type) {
	var digest;
	var normal;
	var target;
	if(!name) {
		digest = '取消专栏加精';
		normal = '在专栏加精';
		target = geid('digest');
		var digestInMid = false;
		if(target.innerHTML === normal) digestInMid = true;
		nkcAPI('/t/'+tid+'/switchInPersonalForum', 'PUT',{digestInMid: digestInMid})
			.then(function() {
				if(target.innerHTML === normal) {
					screenTopAlert('已将该帖在个人专栏加精');
					target.innerHTML = digest;
					return
				}
				screenTopAlert('已取消专栏加精');
				target.innerHTML = normal;
				return
			})
			.catch(function(data) {
				screenTopWarning(data.error)
			})
	}
	if(type === 'MF') {
		digest = '在' + name + '取消加精';
		normal = '在' + name + '加精';
		target = geid('MFDigest');
		nkcAPI('switchDInPersonalForum', {tid: tid})
			.then(function() {
				if(target.innerHTML === normal) {
					screenTopAlert('已将该帖在' + name + '加精');
					target.innerHTML = digest;
					return
				}
				screenTopAlert('已取消在' + name + '的加精');
				target.innerHTML = normal;
				return
			})
			.catch(function(data) {
				screenTopWarning(data.error)
			})
	}
	if(type === 'OF') {
		digest = '在' + name + '取消加精';
		normal = '在' + name + '加精';
		target = geid('OFDigest');
		nkcAPI('switchDInPersonalForum', {tid: tid})
			.then(function() {
				if(target.innerHTML === normal) {
					screenTopAlert('已将该帖在' + name + '加精');
					target.innerHTML = digest;
					return
				}
				screenTopAlert('已取消在' + name + '的加精');
				target.innerHTML = normal;
				return
			})
			.catch(function(data) {
				screenTopWarning(data.error)
			})
	}
}

function switchTInPersonalForum(tid, name, type) {
	var topped;
	var normal;
	var target;
	if(!name) {
		topped = '取消专栏置顶';
		normal = '在专栏置顶';
		target = geid('topped');
		var toppedInMid = false;
		if(target.innerHTML === normal) toppedInMid = true;
		nkcAPI('/t/'+tid+'/switchInPersonalForum', 'PUT', {toppedInMid: toppedInMid})
			.then(function() {
				if(target.innerHTML === normal) {
					screenTopAlert('已将该帖在个人专栏置顶');
					target.innerHTML = topped;
					return
				}
				screenTopAlert('已取消专栏置顶');
				target.innerHTML = normal;
				return
			})
			.catch(function(data) {
				screenTopWarning(data.error)
			})
	}
	if(type === 'MF') {
		topped = '在' + name + '取消置顶';
		normal = '在' + name + '置顶';
		target = geid('MFTopped');
		nkcAPI('switchTInPersonalForum', {tid: tid, type: type})
			.then(function() {
				if(target.innerHTML === normal) {
					screenTopAlert('已将该帖在' + name + '置顶');
					target.innerHTML = topped;
					return
				}
				screenTopAlert('已取消该贴在' + name + '的置顶');
				target.innerHTML = normal;
				return
			})
			.catch(function(data) {
				screenTopWarning(data.error)
			})
	}
	if(type === 'OF') {
		topped = '在' + name + '取消置顶';
		normal = '在' + name + '置顶';
		target = geid('OFTopped');
		nkcAPI('switchTInPersonalForum', {tid: tid, type: type})
			.then(function() {
				if(target.innerHTML === normal) {
					screenTopAlert('已将该帖在' + name + '置顶');
					target.innerHTML = topped;
					return
				}
				screenTopAlert('已取消该贴在' + name + '的置顶');
				target.innerHTML = normal;
				return
			})
			.catch(function(data) {
				screenTopWarning(data.error)
			})
	}
}

function adSwitch(tid) {
	var btn = geid('adBtn');
	var nowIsAd = '取消首页置顶';
	var nowNormal = '首页置顶';
	nkcAPI('/t/'+tid+'/ad', 'PUT', {})
		.then(function() {
			if(btn.innerHTML === nowIsAd) {
				screenTopAlert('取消首页置顶成功');
				btn.innerHTML = nowNormal;
				return
			}
			screenTopAlert('首页置顶成功');
			btn.innerHTML = nowIsAd;
		})
		.catch(function(data){
			screenTopWarning('操作失败： ' + data.error);
		})
}

//html解码
function htmlDecode(text){
	//1.首先动态创建一个容器标签元素，如DIV
	var temp = document.createElement("div");
	//2.然后将要转换的字符串设置为这个元素的innerHTML(ie，火狐，google都支持)
	temp.innerHTML = text;
	//3.最后返回这个元素的innerText(ie支持)或者textContent(火狐，google支持)，即得到经过HTML解码的字符串了。
	var output = temp.innerText || temp.textContent;
	temp = null;
	return output;
}

function displayManagement() {
	$('.managementDiv').slideToggle();
}
var threadContent = $('.thread-content');
var hiddenThreadContent = $('.hiddenThreadContent');
var maxHeight = threadContent.css('max-height');
var showThreadContentBtn = $('.showThreadContentBtn');
var showText = showThreadContentBtn.text();
var hideText = showThreadContentBtn.attr('hide-text');
function showThreadContent() {
	if(hiddenThreadContent.css('display') === 'none') {
		hiddenThreadContent.show();
		threadContent.css('max-height', maxHeight);
		showThreadContentBtn.text(showText);
	} else {
		hiddenThreadContent.hide();
		threadContent.css('max-height', 'none');
		showThreadContentBtn.text(hideText);
	}
}
//.dropdown-menu.stop-propagation
$(".dropdown-menu.stop-propagation").on("click",function (e) {
	e.stopPropagation();
});
function removeForumsId(tid, fid) {
  nkcAPI('/t/' + tid + '/forum?fid=' + fid, 'DELETE', {})
  .then(function() {
    screenTopAlert('移除成功');
  })
  .catch(function(data) {
    screenTopWarning(data.error || data);
  })
}

function addForum(tid) {
  var result = getResult();
  nkcAPI('/t/' + tid + '/forum', 'POST', {
    fid: result.fid,
    cid: result.cid
  })
  .then(function() {
    screenTopAlert('添加成功');
  })
  .catch(function(data) {
    screenTopWarning(data.error || data);
  })
}

// 查看原创说明
function originTextShow(para) {
	var parentDivDom = $(para).parent("a");
	var paraRect = para.getBoundingClientRect();
	// 创建一个外壳
	var originPanelShell = document.createElement("span");
	originPanelShell.setAttribute("id", "originPanelShell");
	// 给外壳添加样式
	originPanelShell.style.position = "absolute";
	originPanelShell.style.background = "#eee";
	originPanelShell.style.zIndex = "20000";
	originPanelShell.style.width = paraRect.width + "px";
	// 将外壳放入所在位置
	$(parentDivDom).css("position", "relative");
	$(parentDivDom).append(originPanelShell);
	// 创建内壁
	var originPanelWall = document.createElement("div");
	originPanelWall.setAttribute("id", "originPanelWall");
	originPanelWall.className = "originTextWall";
	originPanelShell.appendChild(originPanelWall);
	// 获取para中的通信信息
	var contractDom = "<div>"+$(para).attr("data-text")+"</div>";
	originPanelWall.innerHTML = contractDom
}

// 关闭原创声明查看
function originTextClose() {
	$("#originPanelShell").remove()
}

function originPanelShow(para) {
	var parentDivDom = $(para).parent("span");
	var paraRect = para.getBoundingClientRect();
	// 创建一个外壳
	var originPanelShell = document.createElement("span");
	originPanelShell.setAttribute("id", "originPanelShell");
	// 给外壳添加样式
	originPanelShell.style.position = "absolute";
	originPanelShell.style.background = "#eee";
	originPanelShell.style.zIndex = "20000";
	originPanelShell.style.width = paraRect.width + "px";
	// 将外壳放入所在位置
	$(parentDivDom).css("position", "relative");
	$(parentDivDom).append(originPanelShell);
	// 创建内壁
	var originPanelWall = document.createElement("div");
	originPanelWall.setAttribute("id", "originPanelWall");
	originPanelWall.className = "originPanelWall";
	originPanelShell.appendChild(originPanelWall);
	// 获取para中的通信信息
	var contractEmail = $(para).attr("data-email");
	var contractTel = $(para).attr("data-tel");
	var contractAdd = $(para).attr("data-add");
	var contractCode = $(para).attr("data-code");
	//
	var contractDom = "";
	if(contractEmail){
		contractDom += "<div>通信邮箱："+contractEmail+"</div>";
	}
	if(contractTel) {
		contractDom += "<div>电话号码："+contractTel+"</div>";
	}
	if(contractAdd) {
		contractDom += "<div>通信地址："+contractAdd+"</div>";
	}
	if(contractCode) {
		contractDom += "<div>邮政编码："+contractCode+"</div>";
	}
	originPanelWall.innerHTML = contractDom
}

function originPanelClose() {
	$("#originPanelShell").remove()
}

function turnUser(uid) {
	if(uid) {
		// window.location.href = "/u/"+uid;
		openToNewLocation("/u/"+uid);
	}
}

function turnSearch(text) {
	if(text) {
		var url = "/search?c="+text;
		// window.location.href = url;
		openToNewLocation(url);
	}
}


var ColumnCategoriesDom;
$(function() {
  if(NKC.modules.SelectColumnCategories) {
    ColumnCategoriesDom = new NKC.modules.SelectColumnCategories();
  }
  var proDom = $("#protocolCheckbox");
  proDom.on("change", function() {
    disabledPostButtonByProtocol(proDom.prop("checked"));
  });
  disabledPostButtonByProtocol(proDom.prop("checked"));
});



function getSelectedColumnCategoriesId() {
  if(!window.ColumnCategoriesDom) return [];
  var status = ColumnCategoriesDom.getStatus();
  if(status.checkbox) {
    if(status.selectedCategoriesId.length === 0) {
      throw("请选择专栏文章分类");
    }
  }
  return status.selectedCategoriesId;

}

/*
* 检测是否勾选同意协议。勾选：禁止发表按钮
* */
function disabledPostButtonByProtocol(allowed) {
  if(allowed) {
    $("#ButtonReply").attr("disabled", false);
  } else {
    $("#ButtonReply").attr("disabled", true);
  }
}

function getPostAuthor(pid) {
  UserInfo.open({
    type: "showUserByPid",
    pid: pid
  });
}


function anonymousPost(pid, anonymous) {
  nkcAPI("/p/" + pid + "/anonymous", "POST", {
    anonymous: !!anonymous
  })
    .then(function() {
      window.location.reload();
    })
    .catch(function(data) {
      sweetError(data);
    })
}
function topPost(pid, topped) {
  nkcAPI("/p/" + pid + "/topped", "POST", {topped: !!topped})
    .then(function() {
      sweetSuccess("操作成功");
    })
    .catch(function(data) {
      sweetError(data);
    });
}

/*function hidePost(pid, type) {
  nkcAPI("/p/" + pid + "/hide", "POST", {type: type})
    .then(function() {
      window.location.reload();
    })
    .catch(function(data) {
      sweetError(data);
    })
}*/

function hidePost(pid) {
  var dom = $(".hide-post[data-pid='"+pid+"']");
  var span = $(".hide-post-button[data-pid='"+pid+"']>button>span");
  var fa = $(".hide-post-button[data-pid='"+pid+"']>button>.fa");
  var mask = dom.find(".thread-post-mask");
  dom.addClass("active");
  mask.css({
    "max-height": hidePostMaxHeight * hidePostFloat + "px"
  });
  span.text("加载全文");
  fa.removeClass("fa-angle-up").addClass("fa-angle-down");
}

function showPost(pid) {
  var dom = $(".hide-post[data-pid='"+pid+"']");
  var span = $(".hide-post-button[data-pid='"+pid+"']>button>span");
  var fa = $(".hide-post-button[data-pid='"+pid+"']>button>.fa");
  dom.removeClass("active");
  var mask = dom.find(".thread-post-mask");
  mask.css({
    "max-height": "none"
  });
  span.text("收起");
  fa.removeClass("fa-angle-down").addClass("fa-angle-up");
}

function switchPost(pid) {
	var dom = $(".hide-post[data-pid='"+pid+"']");
  if(dom.hasClass("active")) {
		var scrollY = window.scrollY;
		showPost(pid);
		// 使滚动条卷去的高度不变，body向下伸展
		scrollTo(0, scrollY);
		// 使此条post移动到视口的顶部
		// scrollTo(0, dom.parents(".single-post").offset().top - 45);
  } else {
		var pagePosition = new NKC.modules.PagePosition();
		hidePost(pid);
		pagePosition.restore();
  }
}

/*function showAttachments(dom) {
	dom = $(dom);
	var fa = dom.find(".icon");
	if(fa.hasClass("fa-angle-double-down")) {
		if(!window.Attachments) {
			Attachments = new NKC.modules.Attachments({
				pid: NKC.configs.pid,
				fid: NKC.configs.fid
			});
		}
		Attachments.show();
		fa.removeClass("fa-angle-double-down").addClass("fa-angle-double-up");
	} else {
		Attachments.hidden();
		fa.removeClass("fa-angle-double-up").addClass("fa-angle-double-down");
	}
}*/
function showAttachments() {
	if(!window.Attachments) {
		Attachments = new NKC.modules.Attachments({
			pid: NKC.configs.pid,
			fid: NKC.configs.fid
		});
	}
	if(Attachments.app.loaded && !Attachments.app.hidden) {
		Attachments.hide();
	} else {
		Attachments.show();
	}
}

function displayAuthor(contractStr) {
	var contract = NKC.methods.strToObj(contractStr);
	author.dom.modal("show");
	author.app.contract = contract;
}

function pushGoodsToHome(productId, type) {
	var method = type === 'push'? "POST": "DELETE";
	nkcAPI("/shop/product/" + productId + "/top", method)
		.then(function() {
			window.location.reload();
		})
		.catch(sweetError);
}


function moveThread() {
	if(!window.MoveThread) {
		window.MoveThread = new NKC.modules.MoveThread();
	}
	var threadData = NKC.methods.getDataById("threadForumsId");
	window.MoveThread.open(function(data) {
		var forums = data.forums;
		var moveType = data.moveType;
		MoveThread.lock();
		nkcAPI("/threads/move", "POST", {
			forums: forums,
			moveType: moveType,
			threadsId: [threadData.tid]
		})
			.then(function() {
				screenTopAlert("操作成功");
				MoveThread.close();
			})
			.catch(function(data) {
				sweetError(data);
				MoveThread.unlock();
			})
	}, {
		selectedCategoriesId: threadData.categoriesId,
		selectedForumsId: threadData.mainForumsId
	})
}

function deleteThread() {
	if(!window.DisabledPost) {
		window.DisabledPost = new NKC.modules.DisabledPost();
	}
	var threadData = NKC.methods.getDataById("threadForumsId");
	window.DisabledPost.open(function(data) {
		var type = data.type;
		var reason = data.reason;
		var remindUser = data.remindUser;
		var violation = data.violation;
		var url, method = "POST";
		var body = {
			postsId: [threadData.pid],
			reason: reason,
			remindUser: remindUser,
			violation: violation
		};
		if(type === "toDraft") {
			url = "/threads/draft";
		} else {
			url = "/threads/recycle";
		}
		DisabledPost.lock();
		nkcAPI(url, method, body)
			.then(function() {
				screenTopAlert("操作成功");
				DisabledPost.close();
				DisabledPost.unlock();
			})
			.catch(function(data) {
				sweetError(data);
				DisabledPost.unlock();
			})
	});

}
function openHidePostPanel(pid, hide) {
	if(!window.hidePostPanel) {
		window.hidePostPanel = new NKC.modules.HidePost();
	}
	window.hidePostPanel.open(function() {
		window.location.reload();
	}, {
		pid: pid,
		hide: hide
	});
}

function getPostsDom() {
	return $(".single-post-checkbox input[type='checkbox']");
}
function resetCheckbox() {
	getPostsDom().prop("checked", false);
}
function markAllPosts() {
	var posts = getPostsDom();
	if(posts.eq(0).css("display") !== "inline-block") return;
	var length = posts.length;
	var count = 0;
	for(var i = 0; i < length; i++) {
		var p = posts.eq(i);
		if(p.prop("checked")) count ++;
	}
	if(length === count) {
		posts.prop("checked", false);
	} else {
		posts.prop("checked", true);
	}
}
function managePosts() {
	resetCheckbox();
	var posts = getPostsDom();
	if(posts.eq(0).css("display") === "none") {
		posts.css("display", "inline-block");
	} else {
		posts.css("display", "none");
	}
}
function getMarkedPostsId() {
	var postsId = [];
	var posts = getPostsDom();
	for(var i = 0; i < posts.length; i++) {
		var post = posts.eq(i);
		if(post.prop("checked")) {
			postsId.push(post.attr("data-pid"));
		}
	}
	return postsId;
}

function disabledThreadPost(pid) {
	NKC.methods.disabledPosts(pid);
}

function disabledMarkedPosts() {
	var postsId = getMarkedPostsId();
	disabledThreadPost(postsId);
}

var nkchl = [];

$(function() {

	var data = NKC.methods.getDataById("threadForumsId");
	NKC.oneAfter("mathJaxRendered", function(_data, next) {
		if(data.notes && data.notes.length) {
			for(var i = 0; i < data.notes.length; i++) {
				var n = data.notes[i];
				nkchl.push(new NKC.modules.NKCHL({
					type: n.type,
					targetId: n.targetId,
					notes: n.notes
				}));
			}
		}
		next();
	});
	NKC.methods.highlightBlockBySelector("[data-tag='nkcsource'][data-type='pre']");
	// app锚点无法滚动到指定位置，每次都会滚动到页面底部
	// 此处针对app特殊处理，一秒钟后手动触发滚动到锚点
	var hash = window.location.hash;
	if(NKC.configs.isApp && hash) {
		setTimeout(function() {
			window.location.hash = "";
			window.location.hash = hash;
		}, 1000)
	}
});

if (NKC.configs.platform === 'reactNative') {
	window._userSelect = true;
}



/*EventTarget.prototype.once = function(name, handle) {
	let self = this;
	let newHandle = function(){
		handle();
		self.removeEventListener(name, newHandle);
	}
	self.addEventListener(name, newHandle);
}

var timer;
document.addEventListener("selectionchange", function() {
	document.once("mouseup", function(){
		clearTimeout(timer);
		timer = setTimeout(function() {
			var selection = getSelection();
			var range = selection.getRangeAt(0);
			if(range.collapsed) return;
			// 获取原文中需要处理的dom
			var startNode = range.startContainer;
			var endNode = range.endContainer;
			if(startNode === endNode) {
				console.log("[A]需要处理的Node：", startNode);
			}else {
				var nodeList = [startNode],
					currentNode = startNode;
				// 兄弟节点遍历
				while(!currentNode.contains(endNode)) {
					currentNode = currentNode.nextSibling;
					nodeList.push(currentNode);
				}
				nodeList.push(endNode);
				console.log("[B]需要处理的Node：", nodeList);
			}
			var frag = range.cloneContents();
			console.log(frag);
		}, 1000);
	})
})*/

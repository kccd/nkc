var creditDom;
$(document).ready(function(){
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

	var qrcode = geid('qrcode');
	if(qrcode) {
		var path = window.location.href;
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



	var qrcodeArr = $('.qrcode');

	for(var i = 0; i < qrcodeArr.length; i++) {
		var q = qrcodeArr.eq(i);
		var pid = q.attr('data-pid');
		q = q.get(0);
		var path = window.location.origin + '/p/' + pid;
		QRCode.toCanvas(q, path, {
			scale: 3,
			margin: 2,
			color: {dark: '#000000'}
		}, function(err) {
			if(err){
				screenTopWarning(err);
			}
		})
	}


	var editor = geid('ReplyContent');
	var proxy = geid('proxy');
	if(proxy){
		proxy.addEventListener('click', function(e) {
			replace_selection(editor, e.target.getAttribute('data-unicode'), true)
		})
	}
	scrollTo(0,0);
  creditDom = $('#creditModel');
  creditDom.modal({
    show: false
  });
});

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
  nkcAPI('/t/'+tid+'/digest', 'PATCH',dateObj)
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
  nkcAPI('/t/'+tid+'/topped', 'PATCH',dataObj)
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
	var quoteHtml = document.getElementById('quoteContent').innerHTML;
	var replyHtml = document.getElementById('text-elem').innerHTML;
	if(replyHtml.replace(/<[^>]+>/g,"")==''){screenTopWarning('请填写内容。');return;}
	var replyContent = quoteHtml + replyHtml
	var post = {
		//t:gv('title').trim(),

		//c:gv("ReplyContent"),
		c: replyContent,
		l:"html",
	}
	if(geid('ParseURL').checked){
		if(post.l=='markdown'){
			post.c = common.URLifyMarkdown(post.c)
		}
		if(post.l=='pwbb'){
			post.c = common.URLifyBBcode(post.c)
		}
		if(post.l=='html'){
			post.c = common.URLifyHTML(post.c)
		}
	}
	//  return console.log(post.c)
	post.c = post.c.replace(/\[\/quote] *\n+/gi,'[/quote]')

	return post
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

// 保存草稿
function saveDraft(threadId,userId){
	$("#ReplyContent").find(".MathJax_Preview").each(function(){
		if($(this).next().next().length !== 0){
			if($(this).next().next().attr("type").length > 15){
				var mathfur = "$$" + $(this).next().next().html() + "$$";
			}else{
				var mathfur = "$" + $(this).next().next().html() + "$";
			}
			$(this).next().next().replaceWith(mathfur);
			$(this).next().replaceWith("");
			$(this).replaceWith("")
		}else{
			$(this).parent().remove()
		}
	})
	var post = assemblePostObject();
	var quoteContent = document.getElementById("quoteContent").innerHTML;
	post.c = quoteContent + post.c
	if(post.c.replace(/<[^>]+>/g,"")==''){screenTopWarning('请填写内容。');return;}
	post.t = '';
	post.desType = 'thread';
	post.desTypeId = threadId;
	var method = "POST";
	var url = "/u/"+userId+"/drafts";
	var data = {post:post};
	return nkcAPI(url, method, data)
		.then(function (result) {
			if(result.status == "success"){
				// console.log(result.did)
				$("#draftId").html(result.did)
				jalert("保存成功！");
			}
			if(result.redirect) {
				redirect(result.redirect)
			}
		})
		.catch(function (data) {
			// console.log(data)
			jwarning(data.error);
		})
}

// 发表回复
function submit(tid){

	$("#ReplyContent").find(".MathJax_Preview").each(function(){
		if($(this).next().next().length !== 0){
			if($(this).next().next().attr("type").length > 15){
				var mathfur = "$$" + $(this).next().next().html() + "$$";
			}else{
				var mathfur = "$" + $(this).next().next().html() + "$";
			}
			$(this).next().next().replaceWith(mathfur);
			$(this).next().replaceWith("");
			$(this).replaceWith("")
		}else{
			$(this).parent().remove()
		}
	})
	try{
		var post = assemblePostObject()
		// return console.log(post.c)
		if(post.c.replace(/<[^>]+>/g,"")==''){screenTopWarning('请填写内容。');return;}
	}catch(err){
		return;
	}

	geid('ButtonReply').disabled=true;
	return nkcAPI('/t/' + tid, 'POST', {
		post:post,
	})
		.then(function(data){
			window.location.href = data.redirect;
		})
		.catch(function(data){
			screenTopWarning(data.error);
			geid('ButtonReply').disabled=false;
		})
}

// 取消引用
function cancelQuote(){
	geid('quoteContent').innerHTML = "";
	geid('quoteCancel').style.display = "none";
}

// 点击引用
function quotePost(pid, number, page){
	geid("quoteCancel").style.display = "inline"
	if(geid('ReplyContent') === null) return screenTopAlert('权限不足');
	nkcAPI('/p/'+pid+'/quote', 'GET',{})
		.then(function(pc){
			var strAuthor = "<a href='/m/"+pc.targetUser.uid+"'>"+pc.targetUser.username+"</a>&nbsp;" // 获取被引用的用户
			if(page > 0){
				var strFlor = "<a href='/t/"+pc.message.tid+'?&page='+page+'#'+pc.message.pid+"'>"+number+"</a>&nbsp;"  // 获取被引用的楼层
			}else{
				var strFlor = "<a href='/t/"+pc.message.tid+'#'+pc.message.pid+"'>"+number+"</a>&nbsp;"  // 获取被引用的楼层
			}
			pc = pc.message;
			length_limit = 50;
			var content = pc.c;

			// 去掉换行
			content = content.replace(/\n/igm,'');
			content = content.replace(/\r/igm,'');
			content = content.replace(/<blockquote cite.*?blockquote>/igm, '')
			var replaceArr = [
				{reg: /<[^>]*>/gm, rep: ''},
				{reg: /<\/[^>]*>/, rep: ' '},
			];
			if(pc.l === 'html') {
				for(var i in replaceArr) {
					var obj = replaceArr[i];
					content = content.replace(obj.reg, obj.rep)
				}
			}
			var str = content.replace(/\[quote.*?][^]*?\[\/quote]/g,'').slice(0,length_limit).trim();
			str = str.replace(/@([^@\s]*)\s/gm, function(matched) {
				var str1 = matched.replace('@', '@ ')
				return str1
			});
			// 引用内容的字数不超过50
			if(str.length>=length_limit){
				str = str.substring(0,50) + '.....'
			}
			// str = '[quote='+pc.user.username+','+pc.pid+'][/quote]'
			// geid('ReplyContent').value += str
			str = '<blockquote cite='+pc.user.username+','+pc.pid+' display="none">'+'引用：'+strAuthor+'发表于'+strFlor+'楼的内容：<br>'+str+'</blockquote>'
			geid('quoteContent').innerHTML = str
			// geid('ReplyContent-elem').innerHTML = str
			window.location.href='#ReplyContent'
		})
}

function dateTimeString(t){
	return new Date(t).toLocaleString()
}

function at(username) {
	if(geid('ReplyContent') === null) return screenTopAlert('权限不足');
	// geid('ReplyContent').value += '@'+username+' ';
	// window.location.href='#ReplyContent';
	insertHtmlAtCaret('@'+username);
	window.location.href='#ReplyContent';
	geid('text-elem').focus()
}

function goEditor(){
	window.localStorage.quoteHtml = document.getElementById("quoteContent").innerHTML;
	window.localStorage.replyHtml = document.getElementById('text-elem').innerHTML;
	//return console.log(window.localStorage)
	window.location = '/editor?&type=thread&id='+replyTarget.trim().split('/')[1]
}

function addColl(tid){
	nkcAPI('/t/'+tid+'/addColl', 'post',{})
		.then(function(res){
			screenTopAlert('已收藏 '+tid)
		})
		.catch(function(data) {
			screenTopWarning(data.error)
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
    var num = event.currentTarget.getElementsByClassName('num')[0];
    var description = event.currentTarget.getElementsByClassName('description')[0];
    if(type === 'kcb') {
      kcbInfo[0].style.display = 'block';
      num.value = 5;
    } else {
      num.value = 1;
      kcbInfo[0].style.display = 'none'
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
        if(num > kcb) return screenTopWarning('您的科创币不足');
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
		nkcAPI('/t/'+tid+'/switchInPersonalForum', 'PATCH',{hideInMid: hideInMid})
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
		nkcAPI('/t/'+tid+'/switchInPersonalForum', 'PATCH',{digestInMid: digestInMid})
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
		nkcAPI('/t/'+tid+'/switchInPersonalForum', 'PATCH', {toppedInMid: toppedInMid})
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
	nkcAPI('/t/'+tid+'/ad', 'PATCH', {})
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
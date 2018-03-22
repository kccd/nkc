var selectedThreads = [];
var applicationFormId = parseInt($('#applicationFormId').text());
function getThreads(page, self) {
	var url;
	if(page !== undefined) {
		page = 'page='+page+'&';
	} else {
		page = '';
	}
	if(self === undefined) {
		var keywords = $('#searchThread').val();
		if(keywords === '') return screenTopWarning('输入不能为空！');
		url = '/t?'+page+'from=applicationForm&applicationFormId='+applicationFormId+'&keywords='+keywords;
	} else {
		url = '/t?'+page+'from=applicationForm&self=true';
	}
	var html = '<div class="blank blank-selectedThread">搜索中...</div>';
	$('.unselectedThreads').html(html);
	nkcAPI(url, 'GET', {})
		.then(function(data) {
			tempThreads = data.threads;
			var paging = data.paging;
			displayPageList(paging, self);
			if(tempThreads.length === 0) {
				screenTopAlert('什么也没找到...');
			}
			displayThreadsList('.unselectedThreads', tempThreads, false, 'add');
		})
		.catch(function(data) {
			screenTopWarning(data.error);
			var html = '<div class="blank blank-selectedThread">error</div>';
			$('.unselectedThreads').html(html);
		})
}


//生成分页按钮字符串
function createPageList(paging, self) {
	var page = paging.page || 0;
	var pageCount = paging.pageCount || 1;
	if(pageCount <= 1) return '';
	var html = '';
	var arr = [];
	var n = 7;
	var reduce1 = page-3;
	var reduce2 =  page+3;
	var min, max;
	if(reduce1 > 0) {
		if(reduce2 > pageCount) {
			max = pageCount;
			if(reduce1-(reduce2 - pageCount) < 0) {
				min = 0;
			} else {
				min = reduce1-(reduce2 - pageCount);
			}
		} else {
			max = reduce2;
			min = reduce1;
		}
	} else {
		min = 0;
		if(reduce2 < pageCount) {
			if(pageCount < reduce2 - reduce1) {
				max = pageCount;
			} else {
				max = reduce2-reduce1;
			}
		} else {
			max = pageCount - 1;
		}
	}
	console.log(min, page, max);
	if(self === undefined) self = '';
	for(var i = 0; i < pageCount; i++){
		if(i < min || i > max) continue;
		var active = '';
		if(page === i) {
			active = 'active';
		}
		html += '<li class="'+active+'"><a onclick="getThreads('+i+','+self+')">'+(i+1)+'</a></li>';
	}
	return html;
}

//渲染分页按钮
function displayPageList(paging, self) {
	var html = createPageList(paging, self);
	$('.pageList').html(html);
}

// 生成帖子列表html字符串
function createThreadsList(arr, type, disabled) {//add, remove
	var functionName = '', iconClass = '';
	if(disabled === true) {
		disabled = 'disabled';
	} else {
		disabled = '';
	}
	if(type === 'add') {
		functionName = 'addThread';
		iconClass = 'glyphicon glyphicon-plus';
	} else {
		functionName = 'deleteThread';
		iconClass = 'glyphicon glyphicon-remove';
	}
	var html = '';
	for(var i = 0; i < arr.length; i++) {
		var obj = arr[i];
		var tid = obj.tid;
		var uid = obj.uid;
		var pid = obj.pid;
		var username = obj.username;
		var t = obj.t;
		var toc = obj.toc;
		var postString = JSON.stringify(obj);
		var contentDiv = '<div class="col-xs-10 col-md-10"><div class="postString displayNone">'+postString+'</div><span>文号：</span><span class="threadNumber">'+pid+'&nbsp;&nbsp;</span><a href="/m/'+uid+'" target="_blank">'+username+'</a><span>&nbsp;发表于 '+ toc +'</span><br><a href="/t/'+tid+'" target="_blank">'+t+'</a></div>';
		var btnDiv = '<div class="col-xs-2 col-md-2 delete '+disabled+' '+iconClass+'" onclick="'+functionName+'('+tid+','+pid+');this.style.backgroundColor = '+'\'#2aabd2\''+';"></div>';
		html += '<div class="threadList">'+contentDiv+btnDiv+'</div>';
	}
	return html;
}

//禁止屏幕滚动
function disabledRolling(num){
	$(window).scrollTop(num);
}
//初始化已选帖子列表
function initThreadsList() {
	var arr = $('.selectedThreads .threadList .postString');
	var length = arr.length;
	for (var i = 0; i < length; i++) {
		var text = arr.eq(i).text();
		var obj = JSON.parse(text);
		selectedThreads.push(obj);
	}
}
// 渲染帖子列表
function displayThreadsList(id, arr, disabled, type) {
	var html;
	if (type === 'add') {
		html = createThreadsList(arr, 'add', disabled);
	} else {
		html = createThreadsList(arr, 'delete', disabled);
	}
	if(html === '') {
		html = '<div class="blank blank-selectedThread">暂无数据</div>';
		$(id).html();
	}
	$(id).html(html);
}

function deleteThread(tid, pid) {
	for(var i = 0; i < selectedThreads.length; i++) {
		if(selectedThreads[i].tid === tid) {
			selectedThreads.splice(i, 1);
		}
	}
	displaySelectedThreads();
}

function addThread(tid, pid) {
	var flag = false;
	for(var i = 0; i < selectedThreads.length; i++) {
		if(selectedThreads[i].tid === tid) {
			flag = true;
			break;
		}
	}
	if(!flag) {
		selectedThreads.push({
			tid: tid,
			pid: pid
		})
	}
	displaySelectedThreads();
}

function displaySelectedThreads() {
	var html = '';
	if(selectedThreads.length === 0) {
		html = '<span>暂未选择</span>';
	}
	for(var i = 0; i < selectedThreads.length; i++) {
		html += '<span class="fund-span selectedUser selected" onclick="deleteThread('+selectedThreads[i].tid+')">'+selectedThreads[i].pid+'<span class="fund-span delete glyphicon glyphicon-remove"></span></span>';
	}
	$('#selectedThread').html(html);
}

function clearLog() {
	var html = '<div class="blank" style="color:#aaa;">暂无数据</div>';
	$('.unselectedThreads').html(html);
}

function submitReport(id) {
	var content = $('#reportContent').val();
	if(!content) {
		return screenTopWarning('请输入中期报告。');
	}
	var obj = {
		c: content,
		type: 'applyRemittance',
		selectedThreads: selectedThreads
	};
	nkcAPI('/fund/a/'+id+'/report', 'POST', obj)
		.then(function() {
			screenTopAlert('提交成功!');
			setTimeout(function(){
				window.location.reload();
			}, 1200)
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function applyRemittance(number, id) {
	$('#info').html('');
	var obj = {
		number
	};
	var content = $('#reportContent').val();
	if(!content && number !== 0) {
		return screenTopWarning('请输入中期报告。');
	}
	obj.c = content;
	obj.selectedThreads = selectedThreads;
	nkcAPI('/fund/a/'+id+'/remittance/apply', 'POST', obj)
		.then(function(data) {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function verifyRemittance(number, id) {
	nkcAPI('/fund/a/'+id+'/remittance/verify', 'PATCH', {number: number})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error)
		})
}
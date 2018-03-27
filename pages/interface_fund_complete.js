var selectedThreads = [];
var actualMoney = [];
var applicationFormId = parseInt($('#applicationFormId').text());
var fundId = $('#fundId').text();
$(function(){

	initActualMoney();
});


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

function deleteThread(tid) {
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
		});
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


function submit(id){
	var arr = $('input[name="success"]');
	var success = false;
	var content = $('#content').val();
	if(!content) return screenTopWarning('请输入项目结项报告。');
	if(arr.eq(0).is(':checked')) {
		success = true;
	}
	if(selectedThreads.length === 0) return screenTopWarning('请选择帖子。');
	var obj = {
		successful: success,
		selectedThreads: selectedThreads,
		c: content,
		actualMoney: actualMoney
	};
	nkcAPI('/fund/a/'+id+'/complete', 'POST', obj)
		.then(function() {
			screenTopAlert('提交成功。');
			setTimeout(function() {
				window.location.href = '/fund/a/'+id;
			}, 1200)
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

//completedAuditContent
function submitCompletedAudit(type, id) {
	var c = $('#completedAuditContent').val();
	if(type === 'notPass' && c === '') {
		return screenTopWarning('请填写理由。');
	}
	var obj = {
		c: c,
		type: type
	};
	nkcAPI('/fund/a/'+id+'/complete/audit', 'POST', obj)
		.then(function() {
			window.location.href = '/fund/a/'+id;
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}


function initActualMoney() {
	var arr = $('#actualMoney .list .fund-money-list');
	var length = arr.length;
	actualMoney = [];
	for(var i = 0; i < length; i++) {
		var purpose = $('.actualPurpose[num="'+i+'"]').text();
		var count = $('.actualCount[num="'+i+'"]').text();
		count = parseInt(count);
		if(count >= 1){

		}else {
			count = 0;
		}
		var money = $('.actualMoney[num="'+i+'"]').text();
		money = parseInt(money);
		if(money >= 1){

		}else {
			money = 0;
		}
		actualMoney.push({
			purpose: purpose,
			count: count,
			money: money
		});
	}
	displayActualMoney();
}

function displayActualMoney() {
	var html = '';
	var aggregate = 0;
	for(var i = 0; i < actualMoney.length; i++) {
		var a = actualMoney[i];
		var total = a.count*a.money;
		aggregate += total;
		var purposeHtml = '<div class="actualPurpose" contenteditable=true num="'+i+'">'+a.purpose+'</div>';
		var countHtml = '<div class="actualCount" contenteditable=true num="'+i+'">'+a.count+'</div>';
		var moneyHtml = '<div class="actualMoney" contenteditable=true num="'+i+'">'+a.money+'</div>';
		var totalHtml = '<div class="actualTotal" num="'+i+'">'+total+'</div>';
		var deleteHtml = '<div class="delete glyphicon glyphicon-remove" onclick="deleteList('+i+')"></div>';
		html += '<div class="fund-money-list">'+purposeHtml+countHtml+moneyHtml+totalHtml+deleteHtml+'</div>';
	}
	$('#actualMoney .list').html(html);
	var factMoney = $('.factMoney').text();
	factMoney = parseInt(factMoney);
	var balance = (factMoney >= aggregate? factMoney-aggregate: 0);
	$('#aggregate').text('实际批准：'+ factMoney + '元，实际花费：'+ aggregate + '元，应退金额：'+ balance + '元');
	if(balance > 0) {
		var aHtml = '&nbsp;&nbsp;<span class="fund-span" onclick="refund('+balance+')">去退款</span>';
		$('#aggregate').html($('#aggregate').html()+aHtml)
	}
	divBlur();
}

function divBlur() {
	$('div[contenteditable=true]').on('blur', function() {
		initActualMoney();
	})
}


function addList() {
	actualMoney.push({
		purpose: '新建',
		count: 0,
		money: 0
	});
	displayActualMoney();
}

function deleteList(num) {
	actualMoney.splice(num, 1);
	displayActualMoney();
}

function compute() {
	initActualMoney();
}

function refund(money) {
	var obj = {
		fundId: fundId,
		money: money,
		type: 'refund',
		actualMoney: actualMoney
	};
	nkcAPI('/fund/donation', 'POST', obj)
		.then(function(data) {
			window.open(data.url);
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

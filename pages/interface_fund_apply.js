// 团队申请/个人申请
var selectedUsers = [];
var getUsers = [];
// 项目其他信息
var projectCycle = '';
var budgetMoney = [];
// 填写个人信息
var payMethod = '';

// 自动保存间隔
var timeToAutoSave = 5*60; // 秒

//申请表id
var applicationFormId;
$(function() {
	init();
	initTeam();
	initSelectedUsers();
	initFundPay();
	applicationFormId = $('#applicationFormId').text();
	applicationFormId = parseInt(applicationFormId);
	autoSaveProject(applicationFormId);
	initBudgetMoney();
	onContentChange();
	initAddPurpose();
	initThreadsList();
});

//已选帖子
var selectedThreads = [];
// 临时存放加载的帖子
var tempThreads = [];
//禁止滚动
var fixedFn;
function init() {
	$('#team').on('click', function() {
		teamDisplay();
	});
	$('#personal').on('click', function() {
		teamDisappear();
		//clearTeam();
	});
	$('.wechat').on('click', function() {
		chooseWechat();
	});
	$('.alipay').on('click', function() {
		chooseAlipay();
	});
}

function initTeam() {
	if($('#team').hasClass('active')){
		teamDisplay();
	}
}

function clearTeam() {
	selectedUsers = [];
	getUsers = [];
	displayResult();
	displaySelectedUsers();
}

function teamDisplay() {
	$('#teamDiv').css('display', 'block');
	$('#team').addClass('active');
	$('#personal').removeClass('active');
}

function teamDisappear() {
	$('#teamDiv').css('display', 'none');
	$('#team').removeClass('active');
	$('#personal').addClass('active');
}

function initSelectedUsers() {
	var users = $('.selectedUser');
	var length = users.length;
	selectedUsers = [];
	for(var i = 0; i < length; i++) {
		selectedUsers.push({
			uid: $('.selectedUser').eq(i).attr('uid'),
			username: $('.selectedUser').eq(i).text()
		});
	}
}

function getSubscribeUsers(uid) {
	nkcAPI('/u/'+uid+'/subscribe', 'GET', {})
		.then(function(data) {
			getUsers = data.targetUsers;
			displayResult();
		})
		.catch(function(data) {
			return jwarning(data.error);
		})
}

function getSubscribers(uid) {
	nkcAPI('/u/'+uid+'/subscribe?fans=true', 'GET', {})
		.then(function(data) {
			getUsers = data.targetUsers;
			displayResult();
		})
		.catch(function(data) {
			return jwarning(data.error);
		})
}

function displayResult() {
	var usersList = '';
	var blank = '<div class="blank">暂无数据</div>';
	if(getUsers.length === 0) {
		return $('#usersList').html(blank);
	}
	for (var user of getUsers){
		usersList += '<span class="fund-span disabled" uid="'+user.uid+'" onclick="selectUser('+user.uid+')">'+user.username+'<span class="fund-span add glyphicon glyphicon-ok"></span></span>';
	}
	$('#usersList').html(usersList);
}

function displaySelectedUsers() {
	var usersList = '';
	var blank = '<h4>暂未添加组员</h4>';
	var head = '<h4>已添加组员：</h4>';
	if(selectedUsers.length === 0) {
		return $('#selectedUsersDiv').html(blank);
	}
	usersList += head;
	for (var user of selectedUsers) {
		usersList += '<span class="fund-span selectedUser" uid="'+user.uid+'" onclick="deleteUser('+user.uid+')">'+user.username+'<span class="fund-span delete glyphicon glyphicon-remove"></span></span></span>';
	}
	$('#selectedUsersDiv').html(usersList);
}

function selectUser(uid) {
	uid = '' + uid;
	var username = '';
	for(var user of getUsers) {
		if(user.uid === uid) {
			username = user.username;
		}
	}
	for(var user of selectedUsers) {
		if(user.uid === uid) {
			return;
		}
	}
	selectedUsers.push({
		uid,
		username: username
	});
	displaySelectedUsers();
}

function deleteUser(uid) {
	uid = '' + uid;
	for (var i = 0; i < selectedUsers.length; i++) {
		if(selectedUsers[i].uid === uid) {
			selectedUsers.splice(i, 1);
			break;
		}
	}
	displaySelectedUsers();
}

function getUser() {
	var blank = '<div class="blank">搜索中，请稍后...</div>';
	$('#usersList').html(blank);
	var text = $('#username').val();
	if(text === '') {
		return jwarning('输入不能为空！');
	}
	nkcAPI('/u'+'?username='+text+'&uid='+text, 'GET', {})
		.then(function(data) {
			getUsers = data.targetUsers;
			displayResult();
		})
		.catch(function(data) {
			return jwarning(data.error);
		})
}

function submit(id){
	var obj = {
		newMembers: [],
		s: 1
	};
	if ($('#team').hasClass('active')) {
		if(selectedUsers.length === 0) {
			return jwarning('团队申请必须要有组员，若没有组员请选择个人申请。');
		}
		obj.newMembers = selectedUsers;
	}
	nkcAPI('/fund/a/'+id, 'PATCH', obj)
		.then(function(data){
			var s = data.s;
			window.location.href = '/fund/a/'+id+'/settings?s='+(s+1);
		})
		.catch(function(data) {
			return jwarning(data.error);
		})

}

function initFundPay() {
	if($('.wechat').hasClass('active')) {
		payMethod = 'wechat';
	} else if($('.alipay').hasClass('active')) {
		payMethod = 'alipay';
	} else {
		payMethod = '';
	}
}

function chooseWechat() {
	$('.wechat').addClass('active');
	$('.alipay').removeClass('active');
	initFundPay();
}
function chooseAlipay() {
	$('.wechat').removeClass('active');
	$('.alipay').addClass('active');
	initFundPay();
}

function submitUserMessages(id) {
	try {
		var obj = userMessagesForm();
		var data = {
			account: {
				paymentMethod: obj.paymentMethod,
				number: obj.account
			},
			newApplicant: {
				name: obj.name,
				idCardNumber: obj.idCardNumber,
				mobile: obj.mobile,
				description: obj.description
			},
			s: 2
		};
		nkcAPI('/fund/a/'+id, 'PATCH', data)
			.then(function(data) {
				var s = data.s;
				window.location.href = '/fund/a/'+id+'/settings?s='+(s+1);
			})
			.catch(function(data) {
				jwarning(data.error);
			})
	} catch (err) {
		jwarning(err);
	}
}

function submitEnsureUsersMessages(id) {
	if(id === undefined) {
		setTimeout(function() {
			jalert('保存成功！');
		}, 300);
	} else {
		nkcAPI('/fund/a/'+id, 'PATCH', {s: 3})
			.then(function(data) {
				var s = data.s;
				window.location.href = '/fund/a/'+id+'/settings?s='+(s+1);
			})
			.catch(function(data) {
				jwarning(data.error);
			})
	}
}

function saveProject(id, callback) {
	var project = {
		t: $('#projectTitle').val(),
		c: $('#projectContent').text()
	};
	nkcAPI('/fund/a/'+id, 'PATCH', {project: project, s: 4})
		.then(function(data) {
			if(callback === undefined){
				jalert('保存成功！');
			} else {
				callback(data);
			}
		})
		.catch(function(data) {
			jwarning(data.error);
		})
}

function toEditor(id) {
	saveProject(id, function(){
		window.location.href = '/editor?target=application/'+id+'/p/';
	});
}

function submitProject(id) {
	saveProject(id, function(){
		window.location.href = '/fund/a/'+id+'/settings?s=5';
	});
}

function autoSaveProject(id) {
	if($('.autoSaveTime').text() !== '') {
		$('.autoSaveTime').css('display', 'inline');
		var n = -1;
		var loop = function() {
			n++;
			setTimeout(function() {
				displayTimeToSave(timeToAutoSave-n);
				if(n < timeToAutoSave) { // 时间未到
					return loop();
				} else { // 时间到
					saveProject(id, function() {
						jalert('自动保存成功！');
						return autoSaveProject(id);
					});
				}
			}, 1000)
		};
		loop();
	}
}

function displayTimeToSave(time) {
	$('#saveTime').text(time+'秒');
}


function initBudgetMoney() {
	var length = $('.list .fund-money-list').length;
	var newArr = [];
	for (var i = 0; i < length; i++){
		newArr.push({
			purpose: getText('purpose', i),
			count: getText('count', i),
			money: getText('money', i)
		})
	}
	budgetMoney = newArr;
}

function getText(klass, i) {
	var text = $('.'+klass+'[num='+i+']').text();
	if(klass !== 'purpose') {
		return parseInt(text);
	}
	return text;
}


function readProjectValue() {
	var time = $('#projectCycle').val();
	time = parseInt(time);
	if(time <= 0) {
		return jwarning('研究周期不能小于0天');
	}
	projectCycle = time;
}

function displayPurpose(disabled) {
	var html = '';
	var aggregate = 0;
	var length = budgetMoney.length;
	if (length === 0) {
		$('#aggregate').text('');
		html = '<div class="blank" style="color: #ccc;line-height: 4rem;">暂无数据</div>';
	} else {
		for (var i = 0; i < length; i++) {
			var m = budgetMoney[i];
			m.i = i;
			html += fundMoneyList(m, disabled);
			aggregate += (m.count*m.money);
			m.i = undefined;
		}
		$('#aggregate').text('总计：'+aggregate+'元');
	}
	$('#budgetMoney .list').html(html);
}

function editor() {
	initBudgetMoney();
	var arr = $('.fund-money-list .delete');
	if(arr.length === 0) return;
	if(arr.eq(0).hasClass('disabled')) {
		$('.fund-money-list .delete').removeClass('disabled');
	} else {
		$('.fund-money-list .delete').addClass('disabled');
	}
}
function deleteList(num) {
	initBudgetMoney();
	budgetMoney.splice(num, 1);
	displayPurpose();
}

function addList() {
	initBudgetMoney();
	$('.delete').addClass('disabled');
	var obj = {
		money: 0,
		count: 0,
		purpose: '新建'+(budgetMoney.length+1)
	};
	budgetMoney.push(obj);
	displayPurpose(true);
	onContentChange();
}

function fundMoneyList(obj, disabled) {
	var purpose = obj.purpose;
	var count = obj.count;
	var money = obj.money;
	var total = count*money;
	var i = obj.i;
	var dis = '';
	if(disabled === true) dis = 'disabled';
	return '<div class="fund-money-list" num='+i+'><div class="purpose" contenteditable=true num='+i+'>'+purpose+'</div><div class="count" contenteditable=true num='+i+'>'+count+'</div><div class="money" contenteditable=true num='+i+'>'+money+'</div><div class="total" num='+i+'>'+total+'</div><div class="delete glyphicon glyphicon-remove '+dis+'" onclick="deleteList('+i+')"></div></div>';
}

function onContentChange() {
	$('.purpose, .count, .money').unbind();
	$('.purpose, .count, .money').one('blur', function(){
		initBudgetMoney();
		displayPurpose(true);
		onContentChange();
	})
}

function  saveBudgetMoney(id, callback) {
	initBudgetMoney();
	readProjectValue();
	var obj = {
		projectCycle: projectCycle,
		budgetMoney: budgetMoney,
		s: 5
	};
	nkcAPI('/fund/a/'+id, 'PATCH', obj)
		.then(function(data) {
			if(callback !== undefined) {
				callback(data);
			} else {
				jalert('保存成功！');
			}
		})
		.catch(function(data) {
			jwarning(data.error);
		})
}

function initAddPurpose() {
	$('.addPurpose').on('click', function() {
		var text = $(this).text();
		if($('#purpose').val() !== '') {
			text = '，' + text;
		}
		$('#purpose').val($('#purpose').val() + text);
	});
}

function savePurpose(id) {
	readProjectValue();
	var purpose = $('#purpose').val();
	nkcAPI('/fund/a/'+ id, 'PATCH', {s: 5, projectCycle: projectCycle, budgetMoney: purpose})
		.then(function(data) {
			jalert('保存成功！');
		})
		.catch(function(data) {
			jwarning(data.error);
		})
}

function compute() {
	initBudgetMoney();
	displayPurpose(true);
}

//显示添加帖子的面板
function displayPopupPanel() {
	$('.popupPanel').removeClass('disabled');
	var scrollTop = $(window).scrollTop();
	fixedFn = disabledRolling;
	$(window).scroll(function() {
		fixedFn(scrollTop);
	})
}

//隐藏添加帖子的面板
function disappearPopupPanel() {
	$('.popupPanel').addClass('disabled');
	fixedFn = function(){};
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
		var btnDiv = '<div class="col-xs-2 col-md-2 delete '+disabled+' '+iconClass+'" onclick="'+functionName+'('+i+')"></div>'
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

//显示帖子列表删除按钮
function displayDeleteThreadBtn() {
	if($('.selectedThreads .delete').eq(0).hasClass('disabled')) {
		$('.selectedThreads .delete').removeClass('disabled');
	} else {
		$('.selectedThreads .delete').addClass('disabled');
	}
}

//删除帖子
function deleteThread(index) {
	selectedThreads.splice(index, 1);
	displayThreadsList('.selectedThreads', selectedThreads, false, 'delete');
}

//添加帖子
function addThread(index) {
	var thread = tempThreads[index];
	var flag = false;
	for (var i = 0; i < selectedThreads.length; i++) {
		if(selectedThreads[i].tid === thread.tid) {
			flag = true;
			break;
		}
	}
	if(!flag) {
		selectedThreads.push(thread);
		displayThreadsList('.selectedThreads', selectedThreads, true, 'delete');
		return jalert('添加成功！');
	} else {
		return jwarning('该贴子已在已选列表中，不需要重复添加！');
	}
}

//生成分页按钮字符串
function createPageList(paging, self) {
	var page = paging.page || 0;
	var pageCount = paging.pageCount || 1;
	var html = '';
	if(self === undefined) self = '';
	for(var i = 0; i < pageCount; i++){
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
	$('#pageList').html(html);
}

//加载帖子
function getThreads(page, self) {
	var url;
	if(page !== undefined) {
		page = 'page='+page+'&';
	} else {
		page = '';
	}
	if(self === undefined) {
		var keywords = $('#searchThread').val();
		if(keywords === '') return jwarning('输入不能为空！');
		url = '/t?'+page+'from=applicationForm&applicationFormId='+applicationFormId+'&keywords='+keywords;
	} else {
		url = '/t?'+page+'from=applicationForm&self=true';
	}
	var html = '<div class="blank blank-selectedThread">搜索中...</div>';
	$('.unselectedThreads').html(html)
	nkcAPI(url, 'GET', {})
		.then(function(data) {
			tempThreads = data.threads;
			var paging = data.paging;
			displayPageList(paging, self);
			if(tempThreads.length === 0) {
				jalert('什么也没找到...');
			}
			displayThreadsList('.unselectedThreads', tempThreads, false, 'add');
		})
		.catch(function(data) {
			jwarning(data.error);
			var html = '<div class="blank blank-selectedThread">error</div>';
			$('.unselectedThreads').html(html);
		})
}

//保存帖子列表
function saveThreadsList(id) {
	var threadsId = [];
	for(var i = 0; i < selectedThreads.length; i++){
		var t = selectedThreads[i];
		threadsId.push(t.tid);
	}
	var obj = {
		threadsId: threadsId,
		s: 5
	};
	nkcAPI('/fund/a/'+id, 'PATCH', obj)
		.then(function(data) {
			jalert('保存成功！');
		})
		.catch(function(data) {
			jwarning(data.error);
		})
}
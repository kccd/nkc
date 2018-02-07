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
	// autoSaveProject(applicationFormId);
	initBudgetMoney();
	onContentChange();
	initAddPurpose();
	initThreadsList();
	initLifePhoto();
});
//已选帖子
var selectedThreads = [];
// 临时存放加载的帖子
var tempThreads = [];
//禁止滚动
var fixedFn;
//生活照
var lifePhotos = [];
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
	$('.bankCard').on('click', function() {
		chooseBankCard();
	});
	$('#account').on('click', function(){
		initFundPay();
		if(payMethod === '') {
			$('#account').blur();
			return alert('请先选择收款！');
		}
	}).on('focus', function(){
		initFundPay();
		if(payMethod === '') {
			$('#account').blur();
			return alert('请先选择收款！');
		}
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
	$('#teamDiv').fadeIn();
	$('#team').addClass('active');
	$('#personal').removeClass('active');
}

function teamDisappear() {
	$('#teamDiv').fadeOut();
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
			return screenTopWarning(data.error);
		})
}

function getSubscribers(uid) {
	nkcAPI('/u/'+uid+'/subscribe?fans=true', 'GET', {})
		.then(function(data) {
			getUsers = data.targetUsers;
			displayResult();
		})
		.catch(function(data) {
			return screenTopWarning(data.error);
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
		return screenTopWarning('输入不能为空！');
	}
	nkcAPI('/u'+'?username='+text+'&uid='+text, 'GET', {})
		.then(function(data) {
			getUsers = data.targetUsers;
			displayResult();
		})
		.catch(function(data) {
			return screenTopWarning(data.error);
		})
}

function submitApplicationMethod(){
	saveApplicationMethod(function(data) {
		var s = data.s;
		window.location.href = '/fund/a/'+applicationFormId+'/settings?s='+(s+1);
	})
}

function saveApplicationMethod(callback) {
	var obj = {
		newMembers: [],
		from: 'personal',
		s: 1
	};
	if ($('#team').hasClass('active')) {
		if(selectedUsers.length === 0) {
			return screenTopWarning('团队申请必须要有组员，若没有组员请选择个人申请。');
		}
		obj.newMembers = selectedUsers;
		obj.from = 'team';
	}
	nkcAPI('/fund/a/'+applicationFormId, 'PATCH', obj)
		.then(function(data){
			if(callback === undefined) {
				screenTopAlert('保存成功！');
			} else {
				callback(data)
			}
		})
		.catch(function(data) {
			return screenTopWarning(data.error);
		})
}

function selectLifePhoto(id){
	var img = $('img[photoId="'+id+'"]');
	if(img.hasClass('active')) {
		var index = lifePhotos.indexOf(id);
		if(index !== -1) {
			lifePhotos.splice(index, 1);
		}
		screenTopAlert('已移除' + id);
	} else {
		var flag = false;
		for(var i = 0; i < lifePhotos.length; i++) {
			if(lifePhotos[i] === id) {
				flag = true;
			}
		}
		if(!flag) lifePhotos.push(id);
		screenTopAlert('已选择' + id);
	}
	displayLifePhotos();
	console.log(lifePhotos);
}

function initLifePhoto() {
	var arr = $('.photo-selected img');
	for (var i = 0; i < arr.length; i++) {
		lifePhotos.push(parseInt(arr.eq(i).attr('photoId')));
	}
	displayLifePhotos();
}

function displayLifePhotos() {
	var arr = $('.fund-photo-list img');
	for (var i = 0; i < arr.length; i++) {
		var flag = false;
		for (var j = 0; j < lifePhotos.length; j++) {
			if(parseInt(arr.eq(i).attr('photoId')) === lifePhotos[j]) {
				flag = true;
			}
		}
		if(flag) {
			arr.eq(i).addClass('active');
		} else {
			arr.eq(i).removeClass('active');
		}
	}
	var html = '';
	for (var i = 0; i < lifePhotos.length; i++) {
		html += '<div class="col-xs-12 col-md-4 photo-content"><div class=" glyphicon glyphicon-remove delete-photo" onclick="removePhoto('+lifePhotos[i]+')"></div><img src="/photo_small/'+lifePhotos[i]+'" photoId='+lifePhotos[i]+'/></div>';
	}
	$('.photo-selected .row').html(html);
}

function removePhoto(id) {
	id = parseInt(id);
	var index = lifePhotos.indexOf(id);
	if(index !== -1) {
		lifePhotos.splice(index, 1);
		displayLifePhotos();
	}
}

function initFundPay() {
	if($('.wechat').hasClass('active')) {
		payMethod = 'wechat';
	} else if($('.alipay').hasClass('active')) {
		payMethod = 'alipay';
	} else if($('.bankCard').hasClass('active')){
		payMethod = 'bankCard';
	}
}


function chooseWechat() {
	$('.wechat').addClass('active');
	$('.alipay').removeClass('active');
	$('.bankCard').removeClass('active');
	initFundPay();
}
function chooseAlipay() {
	$('.bankCard').removeClass('active');
	$('.alipay').addClass('active');
	$('.wechat').removeClass('active');
	initFundPay();
}

function chooseBankCard() {
	$('.bankCard').addClass('active');
	$('.alipay').removeClass('active');
	$('.wechat').removeClass('active');
	initFundPay();
}

function submitApplicantMessages() {
	saveApplicantMessages(function(data){
		var s = data.s;
		window.location.href = '/fund/a/'+applicationFormId+'/settings?s='+(s+1);
	});
}

function saveApplicantMessages(callback){
	// applicationFormId
	try {
		var obj = userMessagesForm();
		var data = {
			account: {
				paymentType: obj.paymentType,
				number: obj.account
			},
			newApplicant: {
				name: obj.name,
				idCardNumber: obj.idCardNumber,
				mobile: obj.mobile,
				description: obj.description,
				lifePhotosId: lifePhotos
			},
			s: 2
		};
		nkcAPI('/fund/a/'+applicationFormId, 'PATCH', data)
			.then(function(data) {
				if(callback !== undefined) {
					return callback(data);
				}
				screenTopAlert('保存成功！');
			})
			.catch(function(data) {
				screenTopWarning(data.error);
			})
	} catch (err) {
		screenTopWarning(err);
	}
}


function submitEnsureUsersMessages(id) {
	if(id === undefined) {
		setTimeout(function() {
			screenTopAlert('保存成功！');
		}, 300);
	} else {
		nkcAPI('/fund/a/'+id, 'PATCH', {s: 3})
			.then(function(data) {
				var s = data.s;
				window.location.href = '/fund/a/'+id+'/settings?s='+(s+1);
			})
			.catch(function(data) {
				screenTopWarning(data.error);
			})
	}
}

function saveProject(callback) {
	nkcAPI('/fund/a/'+applicationFormId, 'PATCH', {s: 3})
		.then(function(data) {
			if(callback === undefined){
				screenTopAlert('保存成功！');
			} else {
				callback(data);
			}
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function toEditor() {
	saveProject(function(){
		window.location.href = '/editor?type=application&id='+applicationFormId+'&cat=p';
	});
}

function submitProject() {
	window.location.href = '/fund/a/'+applicationFormId+'/settings?s=4';
	/*saveProject(id, function(){
		window.location.href = '/fund/a/'+id+'/settings?s=4';
	});*/
}

/*function autoSaveProject(id) {
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
						screenTopAlert('自动保存成功！');
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
}*/


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
		return screenTopWarning('研究周期不能小于0天');
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
	// $('.delete').addClass('disabled');
	var obj = {
		money: 0,
		count: 0,
		purpose: '新建'+(budgetMoney.length+1)
	};
	budgetMoney.push(obj);
	displayPurpose();
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
		displayPurpose();
		onContentChange();
	})
}

function  saveBudgetMoney(id, callback) {
	initBudgetMoney();
	readProjectValue();
	var obj = {
		projectCycle: projectCycle,
		budgetMoney: budgetMoney,
		s: 4
	};
	nkcAPI('/fund/a/'+id, 'PATCH', obj)
		.then(function(data) {
			if(callback !== undefined) {
				callback(data);
			} else {
				screenTopAlert('保存成功！');
			}
		})
		.catch(function(data) {
			screenTopWarning(data.error);
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

function savePurpose(callback) {
	readProjectValue();
	var obj = {
		s: 4,
		projectCycle: projectCycle
	};
	var purpose = $('#purpose').val();
	if($('#purpose').length === 0) {
		obj.budgetMoney = budgetMoney;
	} else {
		obj.budgetMoney = purpose;
	}
	obj.category = $('#category').attr('fid');
	nkcAPI('/fund/a/'+ applicationFormId, 'PATCH', obj)
		.then(function(data) {
			if(callback === undefined){
				screenTopAlert('保存成功！');
			} else {
				callback(data);
			}
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}
function compute() {
	initBudgetMoney();
	displayPurpose();
}

//显示添加帖子的面板
function displayPopupPanel() {
	$('.popupPanel').removeClass('disabled');
	var scrollTop = $(window).scrollTop();
	fixedFn = disabledRolling;
	$('html, body').css('overflow', 'hidden');
	$(window).scroll(function() {
		fixedFn(scrollTop);
	})
}

//隐藏添加帖子的面板
function disappearPopupPanel() {
	$('.popupPanel').addClass('disabled');
	$('html, body').css('overflow', 'auto');
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
		displayThreadsList('.selectedThreads', selectedThreads, false, 'delete');
		return screenTopAlert('添加成功！');
	} else {
		return screenTopWarning('该贴子已在已选列表中，不需要重复添加！');
	}
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
		if(keywords === '') return screenTopWarning('输入不能为空！');
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

//保存帖子列表
function saveThreadsList(callback) {
	var threadsId = [];
	for(var i = 0; i < selectedThreads.length; i++){
		var t = selectedThreads[i];
		threadsId.push(t.tid);
	}
	var obj = {
		threadsId: threadsId,
		s: 4
	};
	nkcAPI('/fund/a/'+applicationFormId, 'PATCH', obj)
		.then(function(data) {
			if(callback === undefined) {
				screenTopAlert('保存成功！');
			} else {
				callback(data);
			}
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function saveOtherMessages() {
	savePurpose(function(){
		saveThreadsList(function(){
			screenTopAlert('保存成功！');
		})
	})
}

//提交帖子列表、资金预算和研究周期
function submitOtherMessages() {
	savePurpose(function(){
		saveThreadsList(function(){
			window.location.href='/fund/a/'+applicationFormId+'/settings?s=5';
		})
	})
}

function submitApplicationForm() {
	var obj = {
		s: 5
	};
	nkcAPI('/fund/a/'+applicationFormId, 'PATCH', obj)
		.then(function() {
			window.location.href = '/fund/a/'+applicationFormId;
			// screenTopAlert('提交成功！2s后跳转到申请表详情页面');
			// setTimeout(function(){
			// 	window.location.href = '/fund/a/'+applicationFormId;
			// }, 2000)
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function deleteApplicationForm(id) {
	var msg = '删除申请表后所有填写的内容都将会被删除，确认要删除吗？';
	if(confirm(msg) === true) {
		nkcAPI('/fund/a/'+id+'?type=delete', 'DELETE', {})
			.then(function(data) {
				window.location.href = '/fund/list/'+data.applicationForm.fund._id;
			})
			.catch(function(data) {
				screenTopWarning(data.error);
			})
	}
}


function chooseCategory(fid, displayName) {
	$('#category').attr('fid', fid).text(displayName);
}
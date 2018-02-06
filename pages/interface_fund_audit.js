var support = true;
var money = parseInt($('#total').text());
var suggestMoney = [];
var factMoney = [];
var remittance = [];
var moneyPassed = true;
var infoPassed = true;
$(function() {
	initSuggestMoney();
	initFactMoney();
	init();
});

function init() {
	// $('input[name="audit"]').on('click', function() {
	// 	choose();
	// });

	$('.suggestMoney').on('blur', function() {
		initSuggestMoney();
	});
	$('.factMoney').on('blur', function() {
		initFactMoney();
	});
	$('#enterBtn').on('click', function () {
		displayRemittance();
	});
}

function initSuggestMoney() {
	var arr = $('.suggestMoney');
	if (arr.length === 0) return;
	suggestMoney = [];
	var total = 0;
	for(var i = 0; i < arr.length; i++) {
		var m = parseFloat(arr.eq(i).text());
		suggestMoney.push(m);
		total += m;
	}
	$('#suggestMoney').text(total);
	$('input[name="moneyAudit"]:first').click();
	if(money*0.8 > total) {
		$('#projectAuditInfo').text('建议的金额小于原金额的80%，只能选择不通过。');
		$('input[name="moneyAudit"]:last').click();
		moneyPassed = false;
	} else {
		$('#projectAuditInfo').text('');
		moneyPassed = true;
	}
}

function initFactMoney() {
	var arr = $('.factMoney');
	if(arr.length === 0) return;
	factMoney = [];
	var total = 0;
	for(var i = 0; i < arr.length; i++) {
		var m = parseFloat(arr.eq(i).text());
		factMoney.push(m);
		total += m
	}
	$('#factMoney').text(total);
	if(money*0.8 > total) {
		$('#adminAuditInfo').text('实际的金额小于原金额的80%，只能选择不通过。');
		$('input[name="adminSupport"]:last').click();
		moneyPassed = false;
	}else {
		$('#adminAuditInfo').text('');
		$('input[name="adminSupport"]:first').click();
		moneyPassed = true;
	}
	displayRemittance();
}

function displayRemittance() {
	var count = $('#remittanceCount').val();
	count = parseInt(count);
	if(count > 0) {
		createList(count);
	} else {
		remittance = [];
		$('#remittanceList').html('');
		$('#remainder').text($('#factMoney').text());
	}
}

function createList(count) {
	var factMoney = parseFloat($('#factMoney').text());
	var remainder,average;
	remainder = factMoney%count;
	if(remainder !== 0) {
		average = (factMoney - remainder)/count;
	} else {
		average = factMoney/count;
	}
	var html = '';
	for (var i = 0; i < count; i++) {
		if(i === count-1) {
			average += remainder;
		}
		html += '<div><span>第'+(i+1)+'期：</span><input id="list'+i+'" value="'+average+'"><span>元</span></div>';
	}
	$('#remittanceList').html(html);
	computeRemainder();
}


function submitProjectAudit(id) {
	var userInfoAudit = $('input[name="userInfoAudit"]').eq(0).is(':checked');
	var projectAudit = $('input[name="projectAudit"]').eq(0).is(':checked');
	var moneyAudit = $('input[name="moneyAudit"]').eq(0).is(':checked');

	var userInfoComment = $('#userInfoComment').val();
	var projectComment = $('#projectComment').val();
	var moneyComment = $('#moneyComment').val();

	var comments = [];
	if(!userInfoAudit && !userInfoComment) {
		return screenTopWarning('请输入申请人信息不合格的原因');
	} else {
		comments.push({
			type: 'userInfoAudit',
			support: userInfoAudit,
			c: userInfoComment
		})
	}
	if(!projectAudit && !projectComment) {
		return screenTopWarning('请输入项目内容不合格的原因');
	} else {
		comments.push({
			type: 'projectAudit',
			support: projectAudit,
			c: projectComment
		})
	}
	if(!moneyAudit && !moneyComment) {
		return screenTopWarning('请输入资金预算不合格的原因');
	} else {
		comments.push({
			type: 'moneyAudit',
			support: moneyAudit,
			c: moneyComment
		})
	}
	var obj = {
		comments: comments,
		suggestMoney: suggestMoney,
		type: 'project'
	};
	nkcAPI('/fund/a/'+id+'/audit', 'POST', obj)
		.then(function(data) {
			screenTopAlert('提交成功！2s后跳转到申请表详情。');
			setTimeout(function() {
				window.location.href = '/fund/a/'+id;
			}, 2000)
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function computeRemainder() {
	displayRemainder();
	$('#remittanceList > div > input').on('input', function() {
		displayRemainder();
	});
}

function displayRemainder() {
	var total = parseFloat($('#factMoney').text());
	$('#remainder').text(total).removeClass('redFontColor');
	var arr = $('#remittanceList > div > input');
	var inputMoney = 0;
	remittance = [];
	for(var i = 0; i < arr.length; i++) {
		var m = parseFloat(arr.eq(i).val());
		if(m > 0){
			inputMoney += m;
			remittance.push(m);
		}
	}
	var difference = total-inputMoney;
	if(difference < 0) {
		$('#remainder').text(total-inputMoney).addClass('redFontColor');
	}else {
		$('#remainder').text(total-inputMoney).removeClass('redFontColor');
	}
}


function submitAdminAudit(id) {
	var arr = $('input[name="adminSupport"]:first');
	var needThreads = $('input[name="needThreads"]:first');

	if(needThreads.is(':checked')) {
		needThreads = true;
	} else {
		needThreads = false;
	}
	if(arr.is(':checked')) {
		support = true;
	} else {
		support = false;
	}
	var c = $('#adminComment').val();
	if(!support && c === '') {
		return screenTopWarning('请输入不合格的原因');
	}
	if(support) {
		var remittanceTotal = 0;
		var factMoneyTotal = 0;
		for(var i = 0; i < remittance.length; i++) {
			remittanceTotal += remittance[i];
		}
		for(var i = 0; i < factMoney.length; i++) {
			factMoneyTotal += factMoney[i];
		}
		if(remittanceTotal !== factMoneyTotal){
			return screenTopWarning('分期的金钱总和与实际预算总和不想等，请检查。');
		}
	}
	var obj = {
		remittance: remittance,
		factMoney: factMoney,
		support: support,
		needThreads: needThreads,
		c: c,
		type: 'admin'
	};
	nkcAPI('/fund/a/'+id+'/audit', 'POST', obj)
		.then(function(data) {
			screenTopAlert('提交成功！2s后跳转到申请表详情。');
			setTimeout(function() {
				window.location.href = '/fund/a/'+id;
			}, 2000)
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}


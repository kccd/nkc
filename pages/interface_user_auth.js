$('.time').datetimepicker({
	language:  'zh-CN',
	format: 'yyyy-mm-dd',
	autoclose: 1,
	todayHighlight: 1,
	startView: 4,
	minView: 2,
	forceParse: 0
});


$(function() {
	init();
	$('input[name="idCard"],input[name="handheld"]').on('change', function() {
		init();
	})
});

function init() {
	var idCardArr = $('input[name="idCard"]');
	var handheldArr = $('input[name="handheld"]');
	var idCardPassed = false;
	var handheldPassed = false;
	if(idCardArr.eq(0).is(':checked')) {
		idCardPassed = true;
	}
	if(handheldArr.eq(0).is(':checked')) {
		handheldPassed = true;
	}
	if(idCardPassed) {
		$('#idCardPassedDiv').show();
		$('#idCardNotPassedDiv').hide();
	} else {
		$('#idCardPassedDiv').hide();
		$('#idCardNotPassedDiv').show();
	}
	if(handheldPassed) {
		$('#handheldPassedDiv').show();
		$('#handheldNotPassedDiv').hide();
	} else {
		$('#handheldPassedDiv').hide();
		$('#handheldNotPassedDiv').show();
	}
	return {
		handheldPassed: handheldPassed,
		idCardPassed: idCardPassed
	};
}

function submitIdCardAuth(uid) {
	var idCardPassed = init().idCardPassed;
	var time, reason, obj = {};
	if(idCardPassed) {
		time = $('#idCardTime').val();
		if(time === '') {
			return screenTopWarning('请选择过期时间');
		}
		obj.time = time;
		obj.passed = true;
	} else {
		reason = $('#idCardReason').val();
		obj.reason = reason;
		obj.passed = false;
	}
	nkcAPI('/u/'+uid+'/auth/2', 'PUT', obj)
		.then(function() {
			screenTopAlert('提交成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}

function submitHandHeldAuth(uid) {
	var handheldPassed = init().handheldPassed;
	var time, reason, obj = {};
	if(handheldPassed) {
		time = $('#handheldTime').val();
		if(time === '') {
			return screenTopWarning('请选择过期时间');
		}
		obj.time = time;
		obj.passed = true;
	} else {
		reason = $('#handheldReason').val();
		obj.reason = reason;
		obj.passed = false;
	}
	nkcAPI('/u/'+uid+'/auth/3', 'PUT', obj)
		.then(function() {
			screenTopAlert('提交成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}

Object.assign(window, {
	init,
	submitIdCardAuth,
	submitHandHeldAuth,
});

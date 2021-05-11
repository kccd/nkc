$(function() {
	initEvent('idCardA');
	initEvent('idCardB');
	initEvent('handheldIdCard');
});

function initEvent(elementId) {
	$('#'+elementId).on('change', function() {
		var file = $('#'+elementId)[0].files[0];
		var formData = new FormData();
		formData.append('file', file);
		formData.append('photoType', elementId);
		postUpload('/photo', formData, function() {
			window.location.reload();
		});
	});
}

function submitAuth(uid, number) {
	nkcAPI('/u/'+uid+'/auth/'+number, 'POST', {})
		.then(function(data) {
			screenTopAlert('提交成功，请耐心等待审核。');
			setTimeout(function(){window.location.reload()}, 2000)
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}


function unSubmitAuth(uid, number) {
	nkcAPI('/u/'+uid+'/auth?number='+number, 'DELETE',{})
		.then(function() {
			screenTopAlert('撤销成功！');
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

Object.assign(window, {
	initEvent,
	submitAuth,
	unSubmitAuth,
});
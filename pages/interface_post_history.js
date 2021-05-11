function disabledHistories(pid, type) {
	var obj = {};
	var text = '屏蔽成功';
	if(type === true) {
		obj.operation = 'disableHistories'
	} else {
		text = '解除屏蔽成功';
		obj.operation = 'unDisableHistories'
	}
	nkcAPI('/p/'+pid+'/history', 'PUT', obj)
		.then(function() {
			screenTopAlert(text);
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}

window.disabledHistories = disabledHistories;

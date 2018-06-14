function saveKcbSettings() {
	var obj = {
		defaultUid: $('#defaultUid').val()
	};
	nkcAPI('/e/settings/kcb', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}
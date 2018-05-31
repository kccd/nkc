function saveDownloadFile() {
	var obj = {
		numberOfDays: $('#numberOfDays').val(),
		numberOfKcb: $('#numberOfKcb').val(),
		operation: 'saveDownloadFile'
	};
	nkcAPI('/e/settings/download', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}
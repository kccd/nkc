function saveExamSettings() {
	var obj = {
		volumeAFailedPostCountOneDay: $('#volumeAFailedPostCountOneDay').val()
	};
	nkcAPI('/e/settings/exam', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}
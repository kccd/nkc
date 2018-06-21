function savePage() {
	var obj = {
		homeThreadsFirstLoad: $('#homeThreadsFirstLoad').val()
	};
	nkcAPI('/e/settings/page', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error|| data);
		})
}
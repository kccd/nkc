function submitBase() {
	var obj = {
		websiteName: $('#websiteName').val(),
		github: $('#github').val(),
		record: $('#record').val(),
		copyright: $('#copyright').val(),
		description: $('#description').val(),
		keywords: $('#keywords').val(),
		brief: $('#brief').val(),
		telephone: $('#telephone').val(),
	};
	nkcAPI('/e/settings/base', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
			setTimeout(function() {
				window.location.reload();
			}, 1000);
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}
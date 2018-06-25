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

function saveKcbNumberSettings() {
	var arr = $('.typeOfScoreChange');
	var types = [];
	for(var i = 0; i < arr.length; i++) {
		var o = arr.eq(i);
		var typeId = o.attr('id');
		var count = o.find('#count').val();
		var change = o.find('#change').val();
		types.push({
			_id: typeId,
			count: count,
			change: change
		});
	}
	nkcAPI('/e/settings/kcb', 'PATCH', {operation: 'saveKcbNumberSettings', types: types})
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error|| data);
		})
}
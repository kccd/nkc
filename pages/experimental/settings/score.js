$('input[name="selectOperation"]').iCheck({
	checkboxClass: 'icheckbox_minimal-red',
});

function submit() {
	var arr = $('input[name="selectOperation"]');
	var operations = [];
	for(var i = 0; i < arr.length; i++) {
		var e = arr.eq(i);
		var _id = e.attr('data-operation');
		var score = $('.'+_id+'[name="score"]').val();
		var targetScore = $('.'+_id+'[name="targetScore"]').val();
		var operation = {
			_id: _id,
			score: parseInt(score),
			targetScore: parseInt(targetScore),
			selected: (e.prop('checked') === true)
		};
		operations.push(operation);
	}
	nkcAPI('/e/settings/score', 'PATCH', {operations: operations})
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}
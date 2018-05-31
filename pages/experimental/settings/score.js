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

function saveOperation(id) {
	var obj = {
		_id: id,
		kcb: {
			count: parseInt($('.kcb[name="count"]').val()),
			number: parseInt($('.kcb[name="number"]').val()),
			targetNumber: parseInt($('.kcb[name="targetNumber"]').val()),
			status: $('.kcb[name="selectOperation"]').prop('checked')
		},
		xsf: {
			count: parseInt($('.xsf[name="count"]').val()),
			number: parseInt($('.xsf[name="number"]').val()),
			targetNumber: parseInt($('.xsf[name="targetNumber"]').val()),
			status: $('.xsf[name="selectOperation"]').prop('checked')
		},
		score: {
			count: parseInt($('.score[name="count"]').val()),
			number: parseInt($('.score[name="number"]').val()),
			targetNumber: parseInt($('.score[name="targetNumber"]').val()),
			status: $('.score[name="selectOperation"]').prop('checked')
		}
	};
	nkcAPI('/e/settings/score', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

function saveFormula() {
	var formula = $('#formula').val();
	nkcAPI('/e/settings/score', 'PATCH', {formula: formula, operation: 'modifyFormula'})
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

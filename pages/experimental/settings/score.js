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
			whoChange: $('select.kcb').val() === '操作者'?'me': 'other',
			change: parseInt($('.kcb[name="change"]').val()),
			status: $('.kcb[name="selectOperation"]').prop('checked')
		},
		xsf: {
			count: parseInt($('.xsf[name="count"]').val()),
			whoChange: $('select.xsf').val() === '操作者'?'me': 'other',
			change: parseInt($('.xsf[name="change"]').val()),
			status: $('.xsf[name="selectOperation"]').prop('checked')
		},
		score: {
			count: parseInt($('.score[name="count"]').val()),
			whoChange: $('select.score').val() === '操作者'?'me': 'other',
			change: parseInt($('.score[name="change"]').val()),
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

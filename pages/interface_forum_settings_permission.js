$('input[name="selectRole"], input[name="selectGrade"], input[name="selectRelation"]').iCheck({
	checkboxClass: 'icheckbox_minimal-red',
	radioClass: 'iradio_minimal-red',
});


function switchStatus(id) {
	return $('#'+id).hasClass('fa-toggle-on');
}

function submit(fid) {
	var selectedRolesId = [], selectedGradesId = [], relation = 'or';
	var arr = $('input[name="selectRole"]');
	for(var i = 0; i < arr.length; i++) {
		var e = arr.eq(i);
		var roleId = e.attr('data-id');
		if(e.prop('checked') && !selectedRolesId.includes(roleId)) {
			selectedRolesId.push(roleId);
		}
	}
	arr = $('input[name="selectGrade"]');
	for(var i = 0; i < arr.length; i++) {
		var e = arr.eq(i);
		var gradeId = e.attr('data-id');
		if(e.prop('checked') && !selectedGradesId.includes(gradeId)) {
			selectedGradesId.push(gradeId);
		}
	}
	relation = $('input[name="selectRelation"]').eq(0).prop('checked')?'and': 'or';
	var obj = {
		klass: $('#contentClass').val(),
		accessible: switchStatus('accessible'),
		displayOnParent: switchStatus('displayOnParent'),
		visibility: switchStatus('visibility'),
		isVisibleForNCC: switchStatus('isVisibleForNCC'),
		rolesId: selectedRolesId,
		gradesId: selectedGradesId,
		relation: relation
	};
	nkcAPI('/f/'+fid+'/settings/permission', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}
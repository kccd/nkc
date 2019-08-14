$('input[name="selectRole"],input[name="allowedAnonymousPost"], input[name="selectGrade"], input[name="selectRelation"], input[name="subType"]').iCheck({
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
		if(e.prop('checked') && selectedRolesId.indexOf(roleId) === -1) {
			selectedRolesId.push(roleId);
		}
	}
	arr = $('input[name="selectGrade"]');
	for(var i = 0; i < arr.length; i++) {
		var e = arr.eq(i);
		var gradeId = e.attr('data-id');
		if(e.prop('checked') && selectedGradesId.indexOf(gradeId) === -1) {
			selectedGradesId.push(gradeId);
		}
	}
	relation = $('input[name="selectRelation"]').eq(0).prop('checked')?'and': 'or';
	var subTypeDom = $("input[name='subType']");
	var subType = '';
	if(subTypeDom.eq(0).prop('checked')) {
    subType = "force";
  } else if(subTypeDom.eq(1).prop("checked")) {
	  subType = "free";
  } else if(subTypeDom.eq(2).prop("checked")) {
	  subType = "unSub"
  }
	if(!subType) return screenTopWarning("请选择关注类型");
	var allowedAnonymousPost = $("input[name='allowedAnonymousPost']");
  allowedAnonymousPost = allowedAnonymousPost.eq(0).prop("checked");
	var obj = {
		klass: $('#contentClass').val(),
		accessible: switchStatus('accessible'),
		displayOnParent: switchStatus('displayOnParent'),
		visibility: switchStatus('visibility'),
		isVisibleForNCC: switchStatus('isVisibleForNCC'),
		rolesId: selectedRolesId,
		gradesId: selectedGradesId,
		relation: relation,
    shareLimitCount: $('#shareLimitCount').val(),
    shareLimitTime: $('#shareLimitTime').val(),
    moderators: $('#moderators').val(),
    subType: subType,
    allowedAnonymousPost: allowedAnonymousPost
	};
	nkcAPI('/f/'+fid+'/settings/permission', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}
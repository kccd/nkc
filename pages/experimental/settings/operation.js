var data = $('#data').text();
var types;
if(data) {
	data = JSON.parse(data);
	window.types = data.types;
}

$('input[name="selectOperation"]').iCheck({
	checkboxClass: 'icheckbox_minimal-red',
});

function getIdByDisplayName(name) {
	for(var i = 0; i < types.length; i++) {
		if(types[i].displayName === name) {
			return types[i]._id
		}
	}
}

function addOperationType() {
	var displayName = prompt('请输入分类名：', '');
	if(displayName === null) {
	} else if(displayName === '') {
		return screenTopWarning('分类名不能为空');
	} else {
		nkcAPI('/e/settings/operation', 'POST', {displayName: displayName})
			.then(function() {
				window.location.reload();
			})
			.catch(function(data) {
				screenTopAlert(data.error || data);
			})
	}
}

function modifyOperationType(id, displayName) {
	if(!id) return;
	displayName = prompt('请输入新的类名：', displayName);
	if(displayName === null) {
	} else if(displayName === '') {
		return screenTopWarning('分类名不能为空');
	} else {
		nkcAPI('/e/settings/operation/'+id, 'PUT', {displayName: displayName, operation: 'modifyDisplayName'})
			.then(function() {
				window.location.reload();
			})
			.catch(function(data) {
				screenTopWarning(data.error || data);
			})
	}
}

function deleteOperationType(id) {
	if(!id) return;
	if(confirm('确认要删除当前分类？') === false) return;
	nkcAPI('/e/settings/operation/'+ id, 'DELETE', {})
		.then(function() {
			// window.location.href = '/e/settings/operation';
			openToNewLocation('/e/settings/operation');
		})
		.catch(function(data) {
			screenTopAlert(data.error || data);
		})
}
function getSelectedOperations() {
	var arr = $('input[name="selectOperation"]');
	var operations = [];
	for(var i = 0; i < arr.length; i++) {
		var e = arr.eq(i);
		if(e.prop('checked')) {
			operations.push(e.attr('data-operation'));
		}
	}
	return operations;
}

function getTypeId() {
	var name = $('#operationSelect').val();
	return getIdByDisplayName(name);
}

function moveOperations() {
	var operations = getSelectedOperations();
	if(operations.length === 0) {
		return screenTopWarning('未选择任何操作')
	}
	var id = getTypeId();
	if(!id) return screenTopWarning('数据错误，请刷新');
	var obj = {
		operations: operations,
		operation: 'moveOperations'
	};
	nkcAPI('/e/settings/operation/'+id, 'PUT', obj)
		.then(function() {
			screenTopAlert('移动成功');
		})
		.catch(function(data) {
			screenTopAlert(data.error || data);
		})
}

function deleteOperations(id) {
	var operations = getSelectedOperations();
	if(operations.length === 0) {
		return screenTopWarning('未选择任何操作')
	}
	var obj = {
		operations: operations,
		operation: 'deleteOperations'
	};
	nkcAPI('/e/settings/operation/'+id, 'PUT', obj)
		.then(function() {
			screenTopAlert('移除成功');
		})
		.catch(function(data) {
			screenTopAlert(data.error || data);
		})
}

function editorOperation(id, description, errInfo) {
	description = prompt('请输入操作说明：', description);
	if(description === null) return;
	if(description === '') {
		return screenTopWarning('操作说明不能为空');
	}
	errInfo = prompt('请输入错误提示：', errInfo);
	if(errInfo === null) return;
	if(errInfo === '') {
		return screenTopWarning('错误提示不能为空');
	}
	nkcAPI('/e/settings/operation', 'PUT', {operationId: id, description: description, errInfo:errInfo})
		.then(function() {
			screenTopAlert('修改成功');
		})
		.catch(function(data) {
			screenTopAlert(data.error || data);
		})
}

Object.assign(window, {
	data,
	getIdByDisplayName,
	addOperationType,
	modifyOperationType,
	deleteOperationType,
	getSelectedOperations,
	getTypeId,
	moveOperations,
	deleteOperations,
	editorOperation,
});

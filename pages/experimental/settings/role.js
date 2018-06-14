var data = $('#data').text();
var defaultOperationsId, operations, role;
if(data) {
	data = JSON.parse(data);
	defaultOperationsId = data.defaultOperationsId;
	operations = data.operations;
	role = data.role
}

$('input[name="selectOperation"]').iCheck({
	checkboxClass: 'icheckbox_minimal-red',
});

function submitRoleBase(id) {
	var obj = {
		displayName: $('#displayName').val(),
		abbr: $('#abbr').val(),
		color: $('#color').val(),
		description: $('#description').val(),
		modifyPostTimeLimit: $('#modifyPostTimeLimit').val()
	};
	nkcAPI('/e/settings/role/'+id+'/base', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

function submitRolePermissions(id) {
	var arr = $('input[name="selectOperation"]');
	var operationsId = [];
	for(var i = 0; i < arr.length; i++) {
		var e = arr.eq(i);
		if(e.prop('checked')) {
			var operation = e.attr('data-operation');
			if(operationsId.indexOf(operation) === -1) {
				operationsId.push(operation);
			}
		}
	}
	var obj = {
		operationsId: operationsId,
	};
	nkcAPI('/e/settings/role/'+id+'/permissions', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
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

function newRole() {
	var displayName = prompt('请输入角色名称(运维、编辑...)：', '');
	if(displayName === null) {

	} else if(displayName === '') {
		return screenTopWarning('角色名称不能为空');
	} else {
		var id = prompt('请输入角色Id（dev, editor...）：', '');
		if(id === null) {

		} else if (id === '') {
			return screenTopWarning('角色Id不能为空');
		} else {
			nkcAPI('/e/settings/role', 'POST', {displayName: displayName, id: id})
				.then(function(data) {
					var roleId = data.role._id;
					window.location.href = '/e/settings/role/'+roleId+'/base';
				})
				.catch(function(data) {
					screenTopWarning(data.error || data);
				})
		}
	}
}

function deleteRole(id) {
	if(confirm('确认要删除当前角色？') === false) {
		return;
	}
	nkcAPI('/e/settings/role/'+id, 'DELETE', {})
		.then(function() {
			window.location.href = '/e/settings/role/dev/base';
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

$(function() {
	$('.operation-type-span').on('click', function() {
		var typeId = $(this).attr('data-operation-type');
		typeId = parseInt(typeId);
		createOperationsList(getSelectOperation(typeId));
	});
	initEvent();
});

function initEvent() {
	$('input[name="selectOperation"]').on('click', function() {
		var selected = $(this).prop('checked');
		var operationId = $(this).attr('data-operation');
		var element = $('input[data-operation='+operationId+']');
		if(selected) {
			try{
				element.iCheck('check');
			} catch(err) {
				element.prop('checked', true);
			}
		} else {
			try{
				element.iCheck('uncheck');
			} catch(err) {
				element.prop('checked', false);
			}
		}
	});
	$('input[name="selectOperation"]').on('ifChanged', function() {
		var operationId = $(this).attr('data-operation');
		var selected = $(this).prop('checked');
		var element = $('input[data-operation='+operationId+']');
		if(selected) {
			try{
				element.iCheck('check');
			} catch(err) {
				element.prop('checked', true);
			}
		} else {
			try{
				element.iCheck('uncheck');
			} catch(err) {
				element.prop('checked', false);
			}
		}
	});
}

function getSelectOperation(typeId) {
	var selectedOperations = [];
	for(var i = 0 ; i < operations.length; i++) {
		var operation = operations[i];
		if(operation.typeId.indexOf(typeId) !== -1 && (['visitor', 'banned', 'default'].includes(role._id) || defaultOperationsId.indexOf(operation._id) === -1)) {
			selectedOperations.push(operation);
		}
	}
	return selectedOperations;
}

function createOperationsList(arr) {
	var operationsDiv = $('#operationsDiv');
	var tbody = operationsDiv.find('tbody');
	tbody.html('');
	if(arr.length === 0) {
		return operationsDiv.hide();
	}
	var selectedOperations = getSelectedOperations();
	for(var i = 0; i < arr.length; i++) {
		var operation = arr[i];
		var tr = newElement('tr', {}, {});
		var th0 = newElement('th', {}, {}).text(i+1);
		var th1 = newElement('th', {}, {}).text(operation._id);
		var th2 = newElement('th', {}, {}).text(operation.description);
		var th3 = newElement('th', {}, {}).text(operation.errInfo);
		var th4 = newElement('th', {}, {});
		var select = newElement('input', {
			type:'checkbox',
			name:'selectOperation',
			'data-operation': operation._id
		}, {});
		if(selectedOperations.indexOf(operation._id) !== -1) {
			select.prop('checked', true);
		}
		th4.append(select);
		tr.append(th0);
		tr.append(th1);
		tr.append(th2);
		tr.append(th3);
		tr.append(th4);
		tbody.append(tr);
	}
	operationsDiv.show();
	initEvent();
}


function selectAll(){
	var elements = $('#operationsDiv input[name="selectOperation"]');
	var selectedCount = 0;
	for(var i = 0; i < elements.length; i++) {
		if(elements.eq(i).prop('checked')) {
			selectedCount++;
		}
	}
	if(selectedCount === elements.length) {
		elements.prop('checked', false);
	} else {
		elements.prop('checked', true);
	}
	for(var i = 0; i < elements.length; i++) {
		var e = elements.eq(i);
		var operationId = e.attr('data-operation');
		var selected = e.prop('checked');
		var element = $('input[data-operation='+operationId+']');
		if(selected) {
			try{
				element.iCheck('check');
			} catch(err) {
				element.prop('checked', true);
			}
		} else {
			try{
				element.iCheck('uncheck');
			} catch(err) {
				element.prop('checked', false);
			}
		}
	}
}

function removeUserFromRole(roleId, uid) {
	nkcAPI('/e/settings/role/'+roleId+'/users', 'PATCH', {uid: uid, operation: 'removeUserFromRole'})
		.then(function() {
			screenTopAlert('移除成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data)
		})
}
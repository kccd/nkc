var data = JSON.parse($('#data-forums').text());
var forums = data.forums;
var fid = data.forum.fid;
var threadTypes = data.threadTypes;
var selected = [];
var exchange = [];
var level1 = [
	{
		displayName: '作为主板',
		fid: null
	}
];
var forumsDiv = $('#forumsDiv');
var childrenForumsDiv = $('#childrenForumsDiv');
var childrenFid = [];
var threadTypesCid = [];

for(var i = 0; i < threadTypes.length; i++) {
	threadTypesCid.push((threadTypes[i].cid).toString());
}

$(function() {

	for(var i = 0; i < forums.length; i++) {
		var forum = forums[i];
		if(forum.parentsId.length === 0) {
			level1.push(forum);
		}
	}

	childrenFid = getChildrenForums(fid, 'fid');
	createChildForums(childrenFid);


	forumsDiv.append(createSelect(level1));

	createThreadType(threadTypes);
	createThreadTypesSelect(threadTypes);
});

function createChildForums(arr) {
	if(arr.length === 0) {
		childrenForumsDiv.html('暂无子版块');
	} else {
		childrenForumsDiv.html('');
	}

	for(var i = 0; i < arr.length; i++) {
		var forum = arr[i];
		if(typeof(forum) === 'string') {
			forum = getForumByFid(forum);
		}
		var span = newElement('span', {
			'onclick': 'exchangeChildForum("'+forum.fid+'")',
			'data-fid': forum.fid
		}, {
			'display': 'inline-block',
			'padding': '0.5rem',
			'background-color': forum.color,
			'border-radius': '5px',
			'color': '#ffffff',
			'margin-right': '0.5rem',
			'cursor': 'pointer',
			'border': '2px solid #ffffff'
		}).text(forum.displayName);
		childrenForumsDiv.append(span);
	}
}

function exchangeChildForum(fid) {
	if(exchange.length === 0) {
		exchange.push(fid);
		$('span[data-fid="'+fid+'"]').css('border', '2px solid #555555');
	} else {
		exchange.push(fid);
		var index = childrenFid.indexOf(exchange[0]);
		var index2 = childrenFid.indexOf(exchange[1]);
		childrenFid.splice(index, 1, exchange[1]);
		childrenFid.splice(index2, 1, exchange[0]);
		$('span[data-fid="'+exchange[0]+'"]').css('border', '2px solid #ffffff');
		exchange = [];
		createChildForums(childrenFid);
	}
}

function createSelect(arr, fid) {
	var select = newElement('select', {
		class: 'form-control',
		onchange: 'selectForum(this.value)'
	}, {});
	for(var i = 0; i < arr.length; i++) {
		var forum = arr[i];
		if(forum.fid !== window.fid){
			select.append(createOption(forum, (forum.fid === fid)));
		}
	}
	return select;
}

function createOption(forum, type) {
	var option = newElement('option', {}, {}).text(forum.displayName);
	if(type) {
		option.attr('selected', true)
	}
	return option;
}

function getFid(name) {
	var fid = null;
	for(var i = 0; i < forums.length; i++) {
		var forum = forums[i];
		if(forum.displayName === name) {
			fid = forum.fid;
			break;
		}
	}
	return fid;
}

function selectForum(name){
	selected = [];
	var fid = getFid(name);
	if(fid) {
		selected.push(fid);
		while (1) {
			var parentForum = getParentForum(fid);
			if(parentForum) {
				selected.unshift(parentForum.fid);
				fid = parentForum.fid;
			} else {
				break;
			}
		}
	}
	showSelect();
}

function getChildrenForums(fid, type) {
	var childrenForums = [];
	for(var i = 0; i < forums.length; i++) {
		var forum = forums[i];
		if(forum.parentsId.indexOf(fid) !== -1) {
			if(type === 'fid') {
				childrenForums.push(forum.fid);
			} else {
				childrenForums.push(forum);
			}
		}
	}
	return childrenForums;
}

function getParentForum(fid) {
	var parentForum = null;
	var forum = getForumByFid(fid);
	for(var i = 0; i < forums.length; i++) {
		if(forum.parentsId.indexOf(forums[i].fid) !== -1) {
			parentForum = forums[i];
		}
	}
	return parentForum;
}

function getForumByFid(fid) {
	var forum;
	for(var i = 0; i < forums.length; i++) {
		if(forums[i].fid === fid) {
			forum = forums[i];
			break;
		}
	}
	return forum;
}


function showSelect() {
	forumsDiv.html('');

	for(var i = 0; i < selected.length; i++) {
		var fid = selected[i];
		if(i === 0) {
			forumsDiv.append(createSelect(level1, fid));
		} else {
			var parentFid = selected[i-1];
			var nowForums = getChildrenForums(parentFid);
			if(nowForums.length > 0) {
				forumsDiv.append(createSelect(nowForums, fid));
			}
		}
		if(i === (selected.length - 1)) {
			var childrenForums = getChildrenForums(fid);
			if(childrenForums.length > 0) {
				childrenForums.unshift({
					fid: null,
					displayName: '当前'
				});
				forumsDiv.append(createSelect(childrenForums, null));
			}
		}
	}

	if(selected.length === 0) {
		forumsDiv.append(createSelect(level1, null));
	}
}

function moveForum(fid) {
	var obj = {
		parentId: null,
		operation: 'savePosition'
	};
	if(selected.length > 0) {
		obj.parentId = selected[(selected.length - 1)];
	}
	nkcAPI('/f/'+fid+'/settings/category', 'PATCH', obj)
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

function selectForumType(fid) {
	var forumType = $("input[name='forumType']:checked").val();
	var obj = {
		operation: 'selectForumType',
		forumType: forumType
	}
	nkcAPI('/f/'+fid+'/settings/category', 'PATCH', obj)
	.then(function() {
		window.location.reload();
	})
	.catch(function(data) {
		screenTopWarning(data.error || data)
	})
}

function getThreadTypeByCid(cid) {
	for(var i = 0; i < threadTypes.length; i++) {
		if(threadTypes[i].cid.toString() === cid) {
			return threadTypes[i];
		}
	}
}

function createThreadType(arr) {
	var threadTypeDiv = $('#threadTypeDiv');
	if(arr.length === 0) {
		threadTypeDiv.html('暂无分类');
	} else {
		threadTypeDiv.html('');
	}
	for(var i = 0; i < arr.length; i++) {
		var type = arr[i];
		if(typeof type === 'string') {
			type = getThreadTypeByCid(type);
		}
		var span = newElement('span', {
			'onclick': 'exchangeThreadTypes("'+type.cid+'")',
			'data-cid': type.cid
		}, {
			'display': 'inline-block',
			'padding': '0.5rem',
			'background-color': '#aaaaaa',
			'border-radius': '5px',
			'color': '#ffffff',
			'margin-right': '0.5rem',
			'cursor': 'pointer',
			'border': '2px solid #ffffff'
		}).text(type.name);
		threadTypeDiv.append(span);
	}
}
var typesExchange = [];
function exchangeThreadTypes(cid) {
	if(typesExchange.length === 0) {
		typesExchange.push(cid);
		$('span[data-cid="'+cid+'"]').css('border', '2px solid #555555');
	} else {
		typesExchange.push(cid);
		var index = threadTypesCid.indexOf(typesExchange[0]);
		var index2 = threadTypesCid.indexOf(typesExchange[1]);
		threadTypesCid.splice(index, 1, typesExchange[1]);
		threadTypesCid.splice(index2, 1, typesExchange[0]);
		$('span[data-cid="'+typesExchange[0]+'"]').css('border', '2px solid #ffffff');
		typesExchange = [];
		createThreadType(threadTypesCid);
	}
}

function addThreadType(fid) {
	var name = prompt('请输入分类名称：');
	if(name === null) return;
	if(name === '') {
		return screenTopWarning('分类名不能为空');
	}
	nkcAPI('/f/'+fid+'/settings/category', 'POST', {name: name})
		.then(function(data) {
			threadTypes.push(data.newType);
			threadTypesCid.push(data.newType.cid);
			createThreadType(threadTypes);
			createThreadTypesSelect(threadTypes);
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

function createThreadTypesSelect(arr) {
	if(arr.length !== 0) {
		var threadTypeSelect = $('#threadTypeSelect');
		threadTypeSelect.html('');
		for(var i = 0; i < arr.length; i ++) {
			threadTypeSelect.append(newElement('option', {}, {}).text(arr[i].name));
		}
	}
}

function getThreadTypeSelectValue() {
	return $('#threadTypeSelect').val() || '';
}


function deleteThreadType(fid) {
	var name = getThreadTypeSelectValue();
	if(!name) return screenTopWarning('暂无分类');
	nkcAPI('/f/'+fid+'/settings/category?name='+name, 'DELETE', {})
		.then(function() {
			screenTopAlert('删除成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}


function editorThreadType(fid) {
	var oldName = getThreadTypeSelectValue();
	if(!oldName) return screenTopWarning('暂无分类');
	var name = prompt('请输入分类名称：', oldName);
	var obj = {
		operation: 'changeThreadType',
		name: name,
		oldName: oldName
	};
	if(oldName === name) return screenTopWarning('分类名未更改');
	nkcAPI('/f/'+fid+'/settings/category', 'PATCH', obj)
		.then(function() {
			screenTopAlert('修改成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

function submit(fid) {
	var categoryDom = $('input[name="forumCategory"]');
	var categoryId;
	for(var i = 0; i < categoryDom.length; i ++) {
		var dom = categoryDom.eq(i);
		if(dom.prop('checked')) {
			categoryId = dom.val();
			break;
		}
	}
	if(!categoryId) return sweetError("请选择专业分类");
	var obj = {
		operation: 'saveOrder',
		childrenFid: childrenFid,
		threadTypesCid: threadTypesCid,
		categoryId: categoryId,
	};
	nkcAPI('/f/'+fid+'/settings/category', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})

}


/**
 * 专业添加类别
 * @param {String} kindName
 */
function saveKind(kindName) {
	var kindName = $("#kinds").val();
	nkcAPI("/f/"+fid+"/settings/kind", "PATCH", {kindName: kindName})
	.then(function(data) {
		screenTopAlert("类别设置成功");
		window.location.reload();
	})
	.catch(function(data) {
		screenTopWarning(data.error || data);
	})
}

/**
 * 专业清除类别
 * @param {String} fid
 */
function clearKind(fid) {
	var sureClear = confirm("确定要清除当前专业的类别吗？");
	if(sureClear) {
		nkcAPI("/f/"+fid+"/settings/kind/clear", "PATCH", {})
		.then(function(data) {
			screenTopAlert("类别已清除");
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error || data)
		})
	}
}

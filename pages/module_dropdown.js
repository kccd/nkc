var selectedArr = [];
var cat;
var dropdownDiv = $('#dropdownDiv');
var data = JSON.parse($('#forumListData').text());
var forumList = data.forumList;
var threadTypes = data.forumsThreadTypes;
var disabledCategory = data.disabledCategory;
var noShowCategory = data.noShowCategory
if(data.selectedArr) {
	selectedArr = data.selectedArr;
}
if(data.cat) {
	cat = parseInt(data.cat);
}
displaySelect();



function initEvent() {
	$('.dropdownSelect').on('change', function() {
		if(!$(this).hasClass('categorySelect')) {
			var num = $(this).attr('id').split('select')[1];
			var fid = $(this).val().split(':')[1];
			selectedArr.splice(num, 1, fid);
			if(selectedArr.length > 0) {
				var newArr = [];
				for(var i = 0; i < selectedArr.length; i++) {
					if(i >= num) {
						$('#select'+i).remove();
					}
					if(i <= num) {
						newArr.push(selectedArr[i]);
					}
				}
			}
			selectedArr = newArr;
			displaySelect();
		}
	})
}

function createSelect(arr, fid, category) {
	var text = '请选择专业';
	var klass = 'form-control dropdownSelect';
	if(category) {
		text = '请选择文章分类';
		klass = 'form-control dropdownSelect categorySelect';
	}
	var select = newElement('select', {class: klass}, {
		width: 'auto',
		display: 'inline-block',
		'margin-right': '0.2rem'
	});
	select.append(newElement('option', {}, {}).text(text));
	for(var i = 0; i < arr.length; i++) {
		var forum = arr[i];
		if (!category) {
			if(forum.forumType == "discipline") {
				var option = newElement('option', {}, {}).text('(学科)'+forum.displayName+':'+forum.fid);
			}else{
				var option = newElement('option', {}, {}).text('(话题)'+forum.displayName+':'+forum.fid);
			}
			if(forum.fid === fid) {
				option.attr('selected', true);
			}
		} else {
			var option = newElement('option', {}, {}).text(forum.name);
			if(forum.cid === fid) {
				option.attr('selected', true);
			}
		}

		select.append(option);
	}
	return select;
}

function displaySelect() {
	dropdownDiv.html('');
	if(selectedArr.length !== 0) {
		for(var i = 0; i < selectedArr.length; i++) {
			if(i === 0) {
				dropdownDiv.append(createSelect(parentForum(), selectedArr[i]).attr('id', 'select'+i));
			}
			var childrenForums = getChildrenForums(selectedArr[i]);
			if(childrenForums.length === 0) {
				if(disabledCategory) {
					// return window.location.href = '/f/'+selectedArr[i]+'/settings';
					return openToNewLocation('/f/'+selectedArr[i]+'/settings');
				}
				if(!noShowCategory){
					var types = getThreadTypes(selectedArr[i]);
					types.push({name: '不分类', cid: ''});
					dropdownDiv.append(createSelect(types, cat||'', true));
				}
			} else {
				dropdownDiv.append(createSelect(childrenForums, selectedArr[i + 1]).attr('id', 'select'+(i+1)));
			}
		}
	} else {
		dropdownDiv.append(createSelect(parentForum(), '').attr('id', 'select0'));
	}
	initEvent();
}


function parentForum() {
	var forum = [];
	for(var i = 0; i < forumList.length; i++) {
		if(forumList[i].parentsId.length == 0) {
			forum.push(forumList[i]);
		}
	}
	return forum;
}

function getChildrenForums(fid) {
	var forum = [];
	for(var i = 0; i < forumList.length; i++) {
		if(forumList[i].parentsId.indexOf(fid) > -1) {
			forum.push(forumList[i]);
		}
	}
	return forum;
}

function getThreadTypes(fid){
	var types = [];
	for(var i = 0; i < threadTypes.length; i++) {
		if(threadTypes[i].fid === fid) {
			types.push(threadTypes[i]);
		}
	}
	return types;
}

function getResult() {
	var arr = $('#dropdownDiv select');
	var fid, category;
	for(var i = 0; i < arr.length; i++) {
		if(!arr.eq(i).hasClass('categorySelect')) {
			var value = arr.eq(i).val();
			var valueArr = value.split(':');
			if(valueArr.length === 2) {
				fid = valueArr[1];
			} else {
				throw '请选择专业';
			}
		}
	}
	category = $('.categorySelect').val();
	if(category === '请选择文章分类') {
		throw '请选择文章分类'
	}
	if(!fid) throw '请选择专业';
	var cid;
	for(var i = 0; i < threadTypes.length; i++) {
		if(threadTypes[i].fid === fid && threadTypes[i].name === category) {
			cid = threadTypes[i].cid;
			break;
		}
	}
	return {
		fid: fid,
		cid: cid
	}
}

// 必须选一个
function getResultForumId() {
	var arr = $('#dropdownDiv select');
	var fid;
	for(var i = 0; i < arr.length; i++) {
		if(!arr.eq(i).hasClass('categorySelect')) {
			var value = arr.eq(i).val();
			var valueArr = value.split(':');
			if(valueArr.length === 2) {
				fid = valueArr[1];
			} else {
				throw '请选择专业';
			}
		}
	}
	if(!fid) throw '请选择专业';
	return fid;
}

// 可以不用非得选一个
function getResultHaveForumId() {
	var arr = $('#dropdownDiv select');
	var fid = "";
	for(var i = 0; i < arr.length; i++) {
		if(!arr.eq(i).hasClass('categorySelect')) {
			var value = arr.eq(i).val();
			var valueArr = value.split(':');
			if(valueArr.length === 2) {
				fid = valueArr[1];
			}
		}
	}
	return fid;
}

function selectbtn(){
	var arr = $('input.ThreadCheckboxes');
	var selected = false;
	for(var i = 0; i < arr.length; i++) {
		if(arr.eq(i).is(':checked')) {
			selected = true;
		}
	}
	if(selected) {
		arr.prop('checked', false);
	} else {
		arr.prop('checked', true);
	}
}
/* 
  移动专业文章列表中的文章
  @author pengxiguaa 2019/1/27
*/
function moveListThreads(fid) {
  var target;
  try {
		target = getResult();
	} catch(err) {
		return screenTopWarning(err);
  }
  var arr = $('input.ThreadCheckboxes');
	var tid = [];
	for(var i = 0; i < arr.length; i++) {
    var box = arr.eq(i);
    if(box.is(':checked')) {
      tid.push(box.attr('id'));
    }
  }
  if(tid.length === 0) return screenTopWarning('未勾选文章');
  var data = {
    fromFid: fid,
    toFid: target.fid,
    toCid: target.cid
  }
  var postTo = function(index, arr) {
    if(!arr[index]) return;
    var targetTid = arr[index];
    nkcAPI('/t/' + targetTid + '/forum', 'PATCH', data)
      .then(function() {
        screenTopAlert('文章 ' + targetTid + ' 已移动到专业 ' + data.toFid);
        postTo(index+1, arr);
      })
      .catch(function(data) {
        screenTopWarning(data.error || data);
      });
  }
  postTo(0, tid);
}

function moveThreads(id) {
	var target;
	try {
		target = getResult();
	} catch(err) {
		return screenTopWarning(err);
	}

	var arr = $('input.ThreadCheckboxes');
	var tid = [];
	if(id) {
		tid.push(id);
	} else {
		for(var i = 0; i < arr.length; i++) {
			var box = arr.eq(i);
			if(box.is(':checked')) {
				tid.push(box.attr('id'));
			}
		}
		if(tid.length === 0) return screenTopWarning('未勾选文章');
	}
	var n = -1;
	var fn = function(i) {
		i++;
		if(i < tid.length) {
			moveThread(tid[i], target.fid, target.cid, fn(i));
		}
	};
	fn(n);
}

/*function moveThread(tid,fid,cid, callback){
		return nkcAPI('/t/'+tid+'/moveThread','PATCH',{
			tid:tid,
			fid:fid,
			cid:cid,
		})
			.then(function(){
				screenTopAlert(tid + ' 已送 ' + fid + (cid?' 的 '+cid:''+'请等待刷新'))
				if(callback) {
					callback();
				}
		})
			.catch(function(data){
				screenTopWarning(data.error || data);
				// screenTopWarning(tid+ ' 无法送 ' + fid+ (cid?' 的 '+cid:''))
			})
	}*/
	
function moveThreadToRecycle(id,para) {
	var arr = $('input.ThreadCheckboxes');
	var tid = [];
	if(id) {
		tid.push(id)
	} else {
		for(var i = 0; i < arr.length; i++) {
			var box = arr.eq(i);
			if(box.is(':checked')) {
				tid.push(box.attr('id'));
			}
		}
		if(tid.length === 0) return screenTopWarning('未勾选文章');
	}
	var n = -1;
	var fn = function(i) {
		i++;
		if(i < tid.length) {
		  disabledThread(tid[i], para, fn(i));
			// moveThread(tid[i], 'recycle', '',para, fn(i));
		}
	};
	fn(n);
}
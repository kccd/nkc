var selectedArr = [];
var cat;
var dropdownDiv1 = $('#dropdownDiv1');
var data = JSON.parse($('#forumListData1').text());
var forumList = data.forumList;
var threadTypes = data.forumsThreadTypes;
var disabledCategory = data.disabledCategory;
if(data.selectedArr) {
	selectedArr = data.selectedArr;
}
if(data.cat) {
	cat = parseInt(data.cat);
}
displaySelect1();

function initEvent1() {
	$('.dropdownSelect1').on('change', function() {
		if(!$(this).hasClass('categorySelect1')) {
			var num = $(this).attr('id').split('selecta')[1];
			var fid = $(this).val().split(':')[1];
			selectedArr.splice(num, 1, fid);
			if(selectedArr.length > 0) {
				var newArr = [];
				for(var i = 0; i < selectedArr.length; i++) {
					if(i >= num) {
						$('#selecta'+i).remove();
					}
					if(i <= num) {
						newArr.push(selectedArr[i]);
					}
				}
      }
      selectedArr = newArr;
			displaySelect1();
		}
	})
}

function createSelect1(arr, fid, category) {
	var text = '请选择专业';
	var klass = 'form-control dropdownSelect1';
	if(category) {
		text = '请选择文章分类';
		klass = 'form-control dropdownSelect1 categorySelect1';
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

function displaySelect1() {
  dropdownDiv1.html('');
	if(selectedArr.length !== 0) {
		for(var i = 0; i < selectedArr.length; i++) {
			if(i === 0) {
				dropdownDiv1.append(createSelect1(parentForum1(), selectedArr[i]).attr('id', 'selecta'+i));
      }
			var childrenForums = getChildrenForums1(selectedArr[i]);
			if(childrenForums.length === 0) {
				if(disabledCategory) {
					return window.location.href = '/f/'+selectedArr[i]+'/settings';
				}
				var types = getThreadTypes1(selectedArr[i]);
				types.push({name: '不分类', cid: ''});
				dropdownDiv1.append(createSelect1(types, cat||'', true));
			} else {
				dropdownDiv1.append(createSelect1(childrenForums, selectedArr[i + 1]).attr('id', 'selecta'+(i+1)));
			}
		}
	} else {
		dropdownDiv1.append(createSelect1(parentForum1(), '').attr('id', 'selecta0'));
  }
  setTimeout(function(){
    initEvent1();
  },300)
}


function parentForum1() {
	var forum = [];
	for(var i = 0; i < forumList.length; i++) {
		if(forumList[i].parentId === '') {
			forum.push(forumList[i]);
		}
	}
	return forum;
}

function getChildrenForums1(fid) {
	var forum = [];
	for(var i = 0; i < forumList.length; i++) {
		if(forumList[i].parentId === fid) {
			forum.push(forumList[i]);
		}
	}
	return forum;
}

function getThreadTypes1(fid){
	var types = [];
	for(var i = 0; i < threadTypes.length; i++) {
		if(threadTypes[i].fid === fid) {
			types.push(threadTypes[i]);
		}
	}
	return types;
}

function getResult1() {
	var arr = $('#dropdownDiv1 select');
	var fid, category;
	for(var i = 0; i < arr.length; i++) {
		if(!arr.eq(i).hasClass('categorySelect1')) {
			var value = arr.eq(i).val();
			var valueArr = value.split(':');
			if(valueArr.length === 2) {
				fid = valueArr[1];
			} else {
				throw '请选择专业';
			}
		}
	}
	category = $('.categorySelect1').val();
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

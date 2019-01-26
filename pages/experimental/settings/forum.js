// var disciplinesData = $('#disciplinesData').text();
// var topicsData = $('#topicsData').text();
// var disciplines = [];
// var disciplinesFidArr = [];
// var topics = [];
// var topicsFidArr = [];
// var selectedFid = [];
// if(disciplinesData) {
// 	disciplinesData = JSON.parse(disciplinesData);
// 	disciplines = disciplinesData.disciplines || [];
// 	disciplinesFidArr = disciplinesData.fidArr || [];
// }
// if(topicsData) {
// 	topicsData = JSON.parse(topicsData);
// 	topics = topicsData.topics || [];
// 	topicsFidArr = topicsData.fidArr || [];
// }

// $(function() {
// 	createDisciplinesSpan(disciplinesFidArr);
// 	createTopicsSpan(topicsFidArr);
// });

// function createDisciplinesSpan(arr) {
// 	var forumsDiv = $('#disciplinesDiv');
// 	forumsDiv.html('');
// 	for(var i = 0; i < arr.length; i++ ) {
// 		var fid = arr[i];
// 		var forum = getForumByFid(fid, "discipline");
// 		var span = newElement('span', {
// 			class: 'forum-span',
// 			'data-fid': forum.fid
// 		}).css({
// 			'border': '2px solid #ffffff',
// 			'background-color': forum.color,
// 			'border-radius': '7px',
// 			padding: '0.5rem 1rem',
// 			'margin': '0 0.5rem 0.5rem 0'
// 		}).text(forum.displayName);
// 		forumsDiv.append(span);
// 	}
// 	initEvent("discipline");
// }
// function createTopicsSpan(arr) {
// 	var forumsDiv = $('#topicsDiv');
// 	forumsDiv.html('');
// 	for(var i = 0; i < arr.length; i++ ) {
// 		var fid = arr[i];
// 		var forum = getForumByFid(fid, "topic");
// 		var span = newElement('span', {
// 			class: 'forum-span',
// 			'data-fid': forum.fid
// 		}).css({
// 			'border': '2px solid #ffffff',
// 			'background-color': forum.color,
// 			'border-radius': '7px',
// 			padding: '0.5rem 1rem',
// 			'margin': '0 0.5rem 0.5rem 0'
// 		}).text(forum.displayName);
// 		forumsDiv.append(span);
// 	}
// 	initEvent("topic");
// }


// function getForumByFid(fid, type) {
// 	var forums;
// 	if(type == "discipline") {
// 		forums = disciplines
// 	}else{
// 		forums = topics
// 	}
// 	for(var i = 0; i < forums.length; i++) {
// 		var forum = forums[i];
// 		if(forum.fid === fid) {
// 			return forum;
// 		}
// 	}
// }

// function initEvent(type) {
// 	var fidsArr;
// 	if(type == "discipline"){
// 		fidsArr = disciplinesFidArr;
// 	}else{
// 		fidsArr = topicsFidArr;
// 	}
// 	var forumsSpan = $('span.forum-span');
// 	forumsSpan.on('click', function() {
// 		forumsSpan.css({
// 			'border': '2px solid #ffffff'
// 		});
// 		if(selectedFid.length === 0) {
// 			$(this).css({
// 				'border': '2px solid #000000'
// 			});
// 		}
// 		var fid = $(this).attr('data-fid');
// 		var newFid = [];
// 		if(!fid) screenTopWarning('数据错误，请刷新');
// 		selectedFid.push(fid);
// 		if(selectedFid.length === 2) {
// 			var index1 = fidsArr.indexOf(selectedFid[0]);
// 			var index2 = fidsArr.indexOf(selectedFid[1]);
// 			for(var i = 0; i < fidsArr.length; i++) {
// 				var fid = fidsArr[i];
// 				if(fid === selectedFid[0]) {
// 					newFid.push(fidsArr[index2]);
// 				} else if(fid === selectedFid[1]) {
// 					newFid.push(fidsArr[index1]);
// 				} else {
// 					newFid.push(fid);
// 				}
// 			}
// 			selectedFid = [];
// 			fidsArr = newFid;
// 			if(type == "discipline") {
// 				disciplinesFidArr = newFid;
// 				createDisciplinesSpan(fidsArr)
// 			}else{
// 				topicsFidArr = newFid;
// 				createTopicsSpan(fidsArr)
// 			}
// 		}
// 	});
// }


// function saveForumsOrder(type) {
// 	var obj;
// 	if(type == "discipline") {
// 		obj = {fidArr: disciplinesFidArr, forumType: type}
// 	}else{
// 		obj = {fidArr: topicsFidArr, forumType: type}
// 	}
// 	nkcAPI('/e/settings/forum', 'PATCH', obj)
// 		.then(function() {
// 			screenTopAlert('保存成功');
// 		})
// 		.catch(function(data) {
// 			screenTopWarning(data.error || data);
// 		})
// }




var data = $('#data').text();
var forums = [];
var fidArr = [];
var selectedFid = [];
if(data) {
	data = JSON.parse(data);
	forums = data.forums || [];
	fidArr = data.fidArr || [];
}

$(function() {
	createSpan(fidArr);
});

function createSpan(arr) {
	var forumsDiv = $('#forumsDiv');
	forumsDiv.html('');
	for(var i = 0; i < arr.length; i++ ) {
		var fid = arr[i];
		var forum = getForumByFid(fid);
		var span = newElement('span', {
			class: 'forum-span',
			'data-fid': forum.fid
		}).css({
			'border': '2px solid #ffffff',
			'background-color': forum.color,
			'border-radius': '7px',
			padding: '0.5rem 1rem',
			'margin': '0 0.5rem 0.5rem 0'
		}).text(forum.displayName);
		forumsDiv.append(span);
	}
	initEvent();
}


function getForumByFid(fid) {
	for(var i = 0; i < forums.length; i++) {
		var forum = forums[i];
		if(forum.fid === fid) {
			return forum;
		}
	}
}

function initEvent() {
	var forumsSpan = $('span.forum-span');
	forumsSpan.on('click', function() {
		forumsSpan.css({
			'border': '2px solid #ffffff'
		});
		if(selectedFid.length === 0) {
			$(this).css({
				'border': '2px solid #000000'
			});
		}
		var fid = $(this).attr('data-fid');
		var newFid = [];
		if(!fid) screenTopWarning('数据错误，请刷新');
		selectedFid.push(fid);
		if(selectedFid.length === 2) {
			var index1 = fidArr.indexOf(selectedFid[0]);
			var index2 = fidArr.indexOf(selectedFid[1]);
			for(var i = 0; i < fidArr.length; i++) {
				var fid = fidArr[i];
				if(fid === selectedFid[0]) {
					newFid.push(fidArr[index2]);
				} else if(fid === selectedFid[1]) {
					newFid.push(fidArr[index1]);
				} else {
					newFid.push(fid);
				}
			}
			selectedFid = [];
			fidArr = newFid;
			createSpan(fidArr);
		}
	});
}


function saveForumsOrder() {
	var obj = {
		fidArr: fidArr
	};
	nkcAPI('/e/settings/forum', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

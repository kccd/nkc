var data = $('#data').text();
data = JSON.parse(data);
var forums = data.forums;
var fidArr = data.fidArr;
var selectedFid = [];
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
	nkcAPI('/e/forum', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}
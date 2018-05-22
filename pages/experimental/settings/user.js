function searchUser() {
	var content = $('#searchInput').val();
	if(!content) return screenTopWarning('输入内容不能为空');
	var searchType = $('#searchType').val();
	if(searchType === '用户名') {
		searchType = 'username';
	} else {
		searchType = 'uid';
	}
	nkcAPI('/e/settings/user?searchType='+searchType+'&content='+content, 'GET', {})
		.then(function(data) {
			if(!data.targetUser) return screenTopWarning('未找到用户');
			createElement(data.targetUser);
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

function createElement(user) {
  var searchResult = $('#searchResult');
	var tbody = searchResult.find('tbody');
	tbody.html('');
	if(!user) return;
  var tr = newElement('tr', {}, {});
  var th1 = newElement('th', {}, {});
  var img = newElement('img', {
    src: '/avatar/'+user.uid
  }, {
    width: '2rem',
	  height: '2rem',
	  'margin-right': '0.5rem',
	  'border-radius': '50%'
  });
  var a = newElement('a', {href: '/u/'+user.uid}, {}).text(user.username);
  th1.append(img, a);

  var th2 = newElement('th', {}, {}).text(user.threadCount);
  var th3 = newElement('th', {}, {}).text(user.postCount);
  var th4 = newElement('th', {}, {}).text(user.toc.toLocaleString());
  var th5 = newElement('th', {}, {}).text(user.regIP + ' : ' + user.regPort);
  var th6 = newElement('th', {}, {});
  a = newElement('a', {href:'/e/settings/user/'+user.uid}, {}).text('编辑');
	th6.append(a);

  tr.append(th1, th2, th3, th4, th5, th6);
	tbody.append(tr);
	searchResult.show();
}

function saveUserInfo(uid, callback) {
	var obj = {
		username: $('#username').val(),
		description: $('#description').val(),
		email: $('#email').val(),
		nationCode: $('#nationCodeSelect').val(),
		mobile: $('#mobile').val()
	};
	obj.nationCode = parseInt(obj.nationCode);
	nkcAPI('/e/settings/user/'+uid, 'PATCH', obj)
		.then(function() {
			if(callback) {
				callback();
			} else {
				screenTopAlert('保存成功');
			}
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}


function editorRole(uid, type) {
	var roleDisplayName, obj;
	if(type === 'add') {
		roleDisplayName = $('#addSelect').val();
		obj = {
			operation: 'addRole',
			roleDisplayName: roleDisplayName
		};
	} else {
		roleDisplayName = $('#removeSelect').val();
		obj = {
			operation: 'removeRole',
			roleDisplayName: roleDisplayName
		};
	}
	nkcAPI('/e/settings/user/'+uid, 'PATCH', obj)
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}
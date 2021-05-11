function searchUser() {
	var content = $('#searchInput').val();
	if(!content) return screenTopWarning('输入内容不能为空');
	var searchType = $('#searchType').val();
	if(searchType === '用户名') {
		searchType = 'username';
	} else if(searchType === "UID") {
		searchType = 'uid';
	} else if(searchType === "手机号") {
	  searchType = "mobile";
  } else {
    searchType = "email";
  }
  NKC.methods.visitUrl('/e/settings/sensitive?searchType='+searchType+'&content='+content);
}

function createElements(users) {
  var searchResult = $('#searchResult');
	var tbody = searchResult.find('tbody');
	tbody.html('');
	if(!users) return;
	for(var i = 0; i < users.length; i++) {
	  var user = users[i];
    if(!user) return;
    var tr = newElement('tr', {}, {});
    var th1 = newElement('th', {}, {});
    var img = newElement('img', {
      src: NKC.methods.tools.getUrl('userAvatar', user.avatar)
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
    var klass = 'text-danger';
    var t = '未通过';
    if(user.volumeA) {
      t = '通过';
      klass = 'text-success';
    }
    var th31 = newElement('th', {class: klass}, {}).text(t);
    var th33a, th331;
    klass = 'text-danger';
    if(user.volumeB) {
      klass = 'text-success';
      if(user.paperB) {
        th33a = newElement('a', {
          'href': '/exam/categories/editor?cid='+ user.paperB._id,
          'target': '_blank',
          'class': klass
        });
        th331 = newElement('span', {}, {}).text('通过 - '+user.paperB.name);
        th33a.append(th331);
      } else {
        th331 = newElement('span', {}, {}).text('通过 - 试卷丢失');
      }
    } else {
      th331 = newElement('span', {}, {}).text('未通过');
    }
    var th32 = newElement('th', {class: klass}, {});
    if(th33a) {
      th32.append(th33a);
    } else {
      th32.append(th331);
    }
    var th33 = newElement('th', {}, {}).text(user.registerType==='mobile'?'手机':'邮箱');
    var th4 = newElement('th', {}, {}).text(NKC.methods.format("YYYY-MM-DD HH:mm:ss", user.toc));
    var th5 = newElement('th', {}, {}).text(user.regIP + ' : ' + user.regPort);
    var th6 = newElement('th', {}, {});
    a = newElement('button', {onclick: "editUserInfo('"+user.uid+"')"}, {}).text('编辑');
    a.addClass("btn btn-default btn-sm");
    th6.append(a);

    tr.append(th1, th2, th3, th31, th32, th33, th4, th5, th6);
    tbody.append(tr);
  }

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
	nkcAPI('/e/settings/user/'+uid, 'PUT', obj)
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
	nkcAPI('/e/settings/user/'+uid, 'PUT', obj)
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

$("#searchInput").keydown(function (e) {//当按下按键时
	if (e.which === 13) {//.which属性判断按下的是哪个键，回车键的键位序号为13
		searchUser();
	}
});
var ModifyAccountInfo;
$(function() {
  window.ModifyAccountInfo = new NKC.modules.ModifyAccountSensitiveInfo();
});
function editUserInfo(uid) {
  ModifyAccountInfo.open({
    uid: uid
  });
}

Object.assign(window, {
  searchUser,
  createElements,
  saveUserInfo,
  editorRole,
  editUserInfo,
});


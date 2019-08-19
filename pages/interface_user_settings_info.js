function submit(id) {
	var obj = {
		description: $('#description').val(),
		postSign: $('#postSign').val(),
		color: $('#color').val()
	};

	nkcAPI('/u/'+id+'/settings/info', 'PATCH', obj)
		.then(function() {
			screenTopAlert('修改成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function changeUsername() {
	$('#usernameInput').show();
}

function saveNewUsername(id) {
	var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
	var username = $('#username').val();
	if(pattern.test(username)){
		getFocus("#username")
		// throw('用户名含有非法字符')
		return screenTopWarning('用户名含有非法字符！')
	}
	return nkcAPI('/u/'+id+'/settings/username', 'PATCH', {newUsername: username})
		.then(function() {
			screenTopAlert('修改成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function getFocus(a){
  $(a).css('border-color','#f88')
  $(a).focus()
  $(a).blur(function(){
    $(a).css('border-color','')
  })
}
var selectImage;
$(function() {
  if(NKC.methods.selectImage) {
    selectImage = new NKC.methods.selectImage
  }
});

function selectAvatar() {
  selectImage.show(function(data) {
    var user = NKC.methods.getDataById("data").user;
    var formData = new FormData();
    formData.append("file", data);
    uploadFilePromise('/avatar/' + user.uid, formData, function(e, percentage) {
      $(".upload-info").text('上传中...' + percentage);
      if(e.total === e.loaded) {
        $(".upload-info").text('上传完成！');
        setTimeout(function() {
          $(".upload-info").text('');
        }, 2000);
      }
    }, "POST")
      .then(function(data) {
        $("#userAvatar").attr("src", "/avatar/" + data.user.avatar + '?time=' + Date.now());
        selectImage.close();
      })
      .catch(function(data) {
        screenTopWarning(data);
      });
  }, {
    aspectRatio: 1
  });
}

function selectBanner() {
  selectImage.show(function(data){
    var user = NKC.methods.getDataById("data").user;
    var formData = new FormData();
    formData.append("file", data);
    uploadFilePromise('/banner/' + user.uid, formData, function (e, percentage) {
      $(".upload-info-banner").text('上传中...' + percentage);
      if (e.total === e.loaded) {
        $(".upload-info-banner").text('上传完成！');
        setTimeout(function () {
          $(".upload-info-banner").text('');
        }, 2000);
      }
    }, "POST")
      .then(function (data) {
        $("#userBanner").attr("src", "/banner/" + data.user.banner + "?time=" + Date.now());
        selectImage.close();
      })
      .catch(function (data) {
        screenTopWarning(data);
      });
  }, {
    aspectRatio: 2
  });
}
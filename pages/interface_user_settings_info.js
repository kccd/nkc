function submit(id) {
	var obj = {
		description: $('#description').val(),
		postSign: $('#postSign').val(),
	};

	nkcAPI('/u/'+id+'/settings/info', 'PATCH', obj)
		.then(function(data) {
			screenTopAlert('修改成功');
      emitEventToUpdateLocalUser(data);
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function changeUsername() {
	$('#app').toggle();
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
    Promise.resolve()
      .then(function() {
        return NKC.methods.blobToFile(data);
      })
      .then(function(file) {
        formData.append("file", file);
        return uploadFilePromise('/avatar/' + user.uid, formData, function(e, percentage) {
          $(".upload-info").text('上传中...' + percentage);
          if(e.total === e.loaded) {
            $(".upload-info").text('上传完成！');
            setTimeout(function() {
              $(".upload-info").text('');
            }, 2000);
          }
        }, "POST")
      })
      .then(function(data) {
        $("#userAvatar").attr("src", NKC.methods.tools.getUrl('userAvatar', data.user.avatar) + '&time=' + Date.now());
        emitEventToUpdateLocalUser(data);
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
        $("#userBanner").attr("src", "/a/" + data.user.banner);
        emitEventToUpdateLocalUser(data);
        selectImage.close();
      })
      .catch(function (data) {
        screenTopWarning(data);
      });
  }, {
    aspectRatio: 2
  });
}

var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    usernameSettings: data.usernameSettings,
    user: data.user,
    modifyUsernameCount: data.modifyUsernameCount,
    newUsername: "",
    usernameScore: data.usernameScore
  },
  computed: {
    needScore: function () {
      if (this.usernameSettings.free) return 0;
      if (this.modifyUsernameCount < this.usernameSettings.freeCount) return 0;
      var reduce = this.modifyUsernameCount + 1 - this.usernameSettings.freeCount;
      if (reduce * this.usernameSettings.onceKcb < this.usernameSettings.maxKcb) {
        return reduce * this.usernameSettings.onceKcb;
      } else {
        return this.usernameSettings.maxKcb
      }
    }
  },
  methods: {
    saveNewUsername: function() {
      nkcAPI("/u/" + this.user.uid + "/settings/username", "PATCH", {newUsername: this.newUsername})
        .then(function(data) {
          sweetSuccess("修改成功");
          emitEventToUpdateLocalUser(data);
        })
        .catch(function(data) {
          sweetError(data);
        })
    }
  }
});


function emitEventToUpdateLocalUser(data) {
  if(NKC.configs.isApp) emitEvent("updateLocalUser", {user: data.user});
}

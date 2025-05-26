import { nkcUploadFile } from './lib/js/netAPI';
import { RNUpdateLocalUser } from './lib/js/reactNative';
import { getState } from './lib/js/state';
const { isApp, fileDomain } = getState();
function submit(id) {
  var obj = {
    description: $('#description').val(),
    postSign: $('#postSign').val(),
  };

  nkcAPI('/u/' + id + '/settings/info', 'PUT', obj)
    .then(function (data) {
      screenTopAlert('修改成功');
      emitEventToUpdateLocalUser(data);
    })
    .catch(function (data) {
      screenTopWarning(data.error);
    });
}

function changeUsername() {
  $('#app').toggle();
}

function getFocus(a) {
  $(a).css('border-color', '#f88');
  $(a).focus();
  $(a).blur(function () {
    $(a).css('border-color', '');
  });
}
window.selectImage = undefined;
$(function () {
  if (NKC.methods.selectImage) {
    window.selectImage = new NKC.methods.selectImage();
  }
  var data = NKC.methods.getDataById('data');
  const Pending = data.userAudit && data.userAudit.status === 'pending';
  new Vue({
    el: '#app',
    data: {
      usernameSettings: data.usernameSettings,
      user: data.user,
      modifyUsernameCount: data.modifyUsernameCount,
      newUsername: '',
      usernameScore: data.usernameScore,
      userAudit: data.userAudit,
      avatarFile: undefined,
      bannerFile: undefined,
      homeBannerFile: undefined,
      avatarUrl: NKC.methods.tools.getUrl(
        'userAvatar',
        Pending && data.userAudit.avatar
          ? data.userAudit.avatar
          : data.user.avatar,
      ),
      bannerUrl: NKC.methods.tools.getUrl(
        'userBanner',
        Pending && data.userAudit.banner
          ? data.userAudit.banner
          : data.user.banner,
      ),
      homeBannerUrl: NKC.methods.tools.getUrl(
        'userHomeBanner',
        Pending && data.userAudit.homeBanner
          ? data.userAudit.homeBanner
          : data.user.homeBanner,
      ),
      description:
        Pending && data.userAudit.description
          ? data.userAudit.description
          : data.user.description,
      postSign: data.user.postSign,
      showName: false,
      loading: false,
    },
    computed: {
      needScore: function () {
        if (this.usernameSettings.free) {
          return 0;
        }
        if (this.modifyUsernameCount < this.usernameSettings.freeCount) {
          return 0;
        }
        var reduce =
          this.modifyUsernameCount + 1 - this.usernameSettings.freeCount;
        if (
          reduce * this.usernameSettings.onceKcb <
          this.usernameSettings.maxKcb
        ) {
          return reduce * this.usernameSettings.onceKcb;
        } else {
          return this.usernameSettings.maxKcb;
        }
      },
      statusText() {
        if (this.isPending) {
          return '审核中';
        } else {
          return '完全公开';
        }
      },
      isPending() {
        return this.userAudit && this.userAudit.status === 'pending';
      },
      userName() {
        return this.isPending && this.userAudit.username
          ? this.userAudit.username
          : this.user.username;
      },
    },
    methods: {
      saveNewUsername: function () {
        return sweetQuestion(`确定要将用户名修改为“${this.newUsername}”吗？`)
          .then(() => {
            return nkcAPI('/u/' + this.user.uid + '/settings/username', 'PUT', {
              newUsername: this.newUsername,
            });
          })
          .then(function (data) {
            sweetSuccess('修改成功');
            emitEventToUpdateLocalUser(data);
          })
          .catch(function (data) {
            sweetError(data);
          });
      },
      viewImage(data) {
        const { name = '', url = '' } = data;
        const images = [
          {
            name,
            url,
          },
        ];
        const readyFiles = images.map((item) => {
          return { ...item, type: 'picture' };
        });
        window.RootApp.$refs.preview.setData(true, 0, readyFiles);
        window.RootApp.$refs.preview.init(0);
      },
      selectAvatar() {
        const self = this;
        window?.selectImage.show(
          (file) => {
            self.avatarFile = file;
            self.avatarUrl = URL.createObjectURL(file);
            //（可选）等保存完成后释放这个 URL
            // self.$once('saved', () => URL.revokeObjectURL(self.avatarUrl));
            selectImage.close();
          },
          {
            aspectRatio: 1,
          },
        );
      },
      selectBanner() {
        const self = this;
        window?.selectImage.show(
          (file) => {
            self.bannerFile = file;
            self.bannerUrl = URL.createObjectURL(file);
            //（可选）等保存完成后释放这个 URL
            selectImage.close();
          },
          {
            aspectRatio: 2,
          },
        );
      },
      selectBackBanner() {
        const self = this;
        window?.selectImage.show(
          (file) => {
            self.homeBannerFile = file;
            self.homeBannerUrl = URL.createObjectURL(file);
            //（可选）等保存完成后释放这个 URL
            selectImage.close();
          },
          {
            aspectRatio: 7,
          },
        );
      },
      changeUsername() {
        this.showName = !this.showName;
      },
      saveAll() {
        // 1. 先做校验，不改变 loading
        if (this.showName) {
          if (!this.newUsername.trim()) {
            return sweetWarning('新用户名不能为空');
          }
          if (this.newUsername === this.user.username) {
            return sweetWarning('新用户名不能与旧用户名相同');
          }
        }

        // 2. 校验通过后再开 loading
        this.loading = true;

        // 3. 构建 FormData
        const time = Date.now();
        const formData = new FormData();
        formData.append('type', 'save');
        formData.append('description', this.description || '');
        formData.append('postSign', this.postSign || '');
        if (this.showName) {
          formData.append('newUsername', this.newUsername);
        }
        if (this.avatarFile) {
          formData.append('avatarFile', this.avatarFile, time + 1 + '.png');
        }
        if (this.bannerFile) {
          formData.append('bannerFile', this.bannerFile, time + 2 + '.png');
        }
        if (this.homeBannerFile) {
          formData.append(
            'homeBannerFile',
            this.homeBannerFile,
            time + 3 + '.png',
          );
        }

        // 4. 调试输出
        // for (const [key, val] of formData.entries()) {
        //   console.log(key, val);
        // }
        // 5. 发请求
        nkcUploadFile(`/u/${this.user.uid}/settings/info`, 'PUT', formData)
          .then(() => {
            screenTopAlert('提交成功');
            setTimeout(() => {
              location.reload();
            }, 1500);
          })
          .catch((err) => {
            sweetError(err.error || '提交失败');
          })
          .finally(() => {
            this.loading = false;
          });
      },
      saveBack() {
        sweetQuestion(`修改的内容将会丢弃,确定不再等一等审核吗？`).then(() => {
          const formData = new FormData();
          formData.append('type', 'revoked');
          this.loading = true;
          nkcUploadFile(`/u/${this.user.uid}/settings/info`, 'PUT', formData)
            .then(() => {
              screenTopAlert('撤销修改成功');
              location.reload();
            })
            .catch((err) => {
              screenTopWarning(err.error || '撤销修改失败');
            })
            .finally(() => {
              this.loading = false;
            });
        });
      },
    },
  });
});

function selectAvatar() {
  selectImage.show(
    function (data) {
      var user = NKC.methods.getDataById('data').user;
      var formData = new FormData();
      Promise.resolve()
        .then(function () {
          formData.append('file', data, Date.now() + '.png');
          let url = '/avatar/' + user.uid;
          /*if(fileDomain) {
          url = fileDomain + url;
        }*/
          return uploadFilePromise(
            url,
            formData,
            function (e, percentage) {
              $('.upload-info').text('上传中...' + percentage);
              if (e.total === e.loaded) {
                $('.upload-info').text('上传完成！');
                setTimeout(function () {
                  $('.upload-info').text('');
                }, 2000);
              }
            },
            'POST',
          );
        })
        .then(function (data) {
          $('#userAvatar').attr(
            'src',
            NKC.methods.tools.getUrl('userAvatar', data.user.avatar) +
              '&time=' +
              Date.now(),
          );
          emitEventToUpdateLocalUser(data);
          selectImage.close();
        })
        .catch(function (data) {
          screenTopWarning(data);
        });
    },
    {
      aspectRatio: 1,
    },
  );
}

function selectBanner() {
  selectImage.show(
    function (data) {
      var user = NKC.methods.getDataById('data').user;
      var formData = new FormData();
      formData.append('file', data, Date.now() + '.png');
      let url = '/banner/' + user.uid;
      /*if(fileDomain) {
      url = fileDomain + url;
    }*/
      uploadFilePromise(
        url,
        formData,
        function (e, percentage) {
          $('.upload-info-banner').text('上传中...' + percentage);
          if (e.total === e.loaded) {
            $('.upload-info-banner').text('上传完成！');
            setTimeout(function () {
              $('.upload-ifo-bnanner').text('');
            }, 2000);
          }
        },
        'POST',
      )
        .then(function (data) {
          $('#userBanner').attr('src', data.data.url);
          emitEventToUpdateLocalUser(data);
          selectImage.close();
        })
        .catch(function (data) {
          screenTopWarning(data);
        });
    },
    {
      aspectRatio: 2,
    },
  );
}
function selectBackBanner() {
  selectImage.show(
    function (data) {
      var user = NKC.methods.getDataById('data').user;
      var formData = new FormData();
      formData.append('file', data, Date.now() + '.png');
      uploadFilePromise(
        '/banner/' + user.uid + '/homeBanner',
        formData,
        function (e, percentage) {
          $('.upload-info-home-banner').text('上传中...' + percentage);
          if (e.total === e.loaded) {
            $('.upload-info-home-banner').text('上传完成！');
            setTimeout(function () {
              $('.upload-info-home-banner').text('');
            }, 2000);
          }
        },
        'POST',
      )
        .then(function (data) {
          $('#userBackBanner').attr('src', data.data.url);
          emitEventToUpdateLocalUser(data);
          selectImage.close();
        })
        .catch(function (data) {
          screenTopWarning(data);
        });
    },
    {
      aspectRatio: 7,
    },
  );
}

// var data = NKC.methods.getDataById('data');
// var app = new Vue({
//   el: '#app',
//   data: {
//     usernameSettings: data.usernameSettings,
//     user: data.user,
//     modifyUsernameCount: data.modifyUsernameCount,
//     newUsername: '',
//     usernameScore: data.usernameScore,
//   },
//   computed: {
//     needScore: function () {
//       if (this.usernameSettings.free) {
//         return 0;
//       }
//       if (this.modifyUsernameCount < this.usernameSettings.freeCount) {
//         return 0;
//       }
//       var reduce =
//         this.modifyUsernameCount + 1 - this.usernameSettings.freeCount;
//       if (
//         reduce * this.usernameSettings.onceKcb <
//         this.usernameSettings.maxKcb
//       ) {
//         return reduce * this.usernameSettings.onceKcb;
//       } else {
//         return this.usernameSettings.maxKcb;
//       }
//     },
//   },
//   methods: {
//     saveNewUsername: function () {
//       return sweetQuestion(`确定要将用户名修改为“${this.newUsername}”吗？`)
//         .then(() => {
//           return nkcAPI('/u/' + this.user.uid + '/settings/username', 'PUT', {
//             newUsername: this.newUsername,
//           });
//         })
//         .then(function (data) {
//           sweetSuccess('修改成功');
//           emitEventToUpdateLocalUser(data);
//         })
//         .catch(function (data) {
//           sweetError(data);
//         });
//     },
//   },
// });

function emitEventToUpdateLocalUser() {
  if (isApp) {
    RNUpdateLocalUser();
  }
}

Object.assign(window, {
  submit,
  changeUsername,
  getFocus,
  selectAvatar,
  selectBanner,
  selectBackBanner,
  // app,
  emitEventToUpdateLocalUser,
});

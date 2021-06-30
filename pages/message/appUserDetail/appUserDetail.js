const data = NKC.methods.getDataById("data");
if(data.friend) {
  data.friend.info._phone = data.friend.info.phone.map(p => {
    return {
      number: p
    }
  });
  if(!data.friend.info._phone.length) {
    data.friend.info._phone = [{number: ''}]
  }
}
window.app = new Vue({
  el: '#app',
  data: {
    friend: data.friend,
    fc: data.friendCategories,
    targetUser: data.targetUser,
    targetUserName: data.targetUserName,
    inBlacklist: data.inBlacklist,
    friendImageUrl: '',
    showNote: false,

    file: null,
    fileUrl: ''
  },
  methods: {
    // 访问用户首页
    visitUserHome() {
      NKC.methods.visitUrl(`/u/${this.targetUser.uid}`, true)
    },
    _removeFriend() {
      const tUid = this.targetUser.uid;
      return nkcAPI(`/message/friend?uid=` + tUid, 'DELETE', {});
    },
    // 添加、删除好友
    addFriend(isFriend) {
      const _removeFriend = this._removeFriend;
      if(isFriend) {
        // 删除好友
        sweetQuestion('确定要删除该好友？')
          .then(() => {
            return _removeFriend();
          })
          .then(() => {
            NKC.methods.appToast('删除成功');
            NKC.methods.appReloadPage();
          })
          .catch(NKC.methods.appToast)
      } else {
        // 添加好友
        NKC.methods.visitUrl(`/message/addFriend?uid=${this.targetUser.uid}`, true);
      }
    },
    // 添加、移除黑名单
    moveToBlacklist() {
      const tUid = this.targetUser.uid;
      const inBlacklist = this.inBlacklist;
      const friend = this.friend;
      const _removeFriend = this._removeFriend;
      Promise.resolve()
        .then(() => {
          if(!inBlacklist && friend) {
            // return _removeFriend();
          }
        })
        .then(() => {
          if(!inBlacklist) {
            return NKC.methods.addUserToBlacklist(tUid, 'message');
          } else {
            return NKC.methods.removeUserFromBlacklist(tUid);
          }
        })
        .then((data) => {
          if(!data) return;
          // NKC.methods.appToast('操作成功');
          NKC.methods.appReloadPage();
        })
        .catch(NKC.methods.appToast)
    },
    // 打开聊天页面
    sendToUser() {
      const uid = this.targetUser.uid;
      const targetUserName = this.targetUserName;
      NKC.methods.rn.emit('toChat', {
        uid: uid,
        type: 'UTU',
        username: targetUserName
      });
    },
    // 选择地区
    selectLocation() {
      const self = this;
      NKC.methods.appSelectLocation()
        .then(data => {
          self.friend.info.location = data.location.join('  ');
        })
    },
    // 添加联系电话
    addPhone() {
      this.friend.info._phone.push({
        number: ''
      });
    },
    // 删除联系电话
    removePhone(index) {
      this.friend.info._phone.splice(index, 1);
    },
    // 获取好友图片链接
    setFriendImageUrl() {
      this.friendImageUrl = `/friend/${this.targetUser.uid}/image?t=${Date.now()}`;
    },
    // 选择图片
    selectFriendImage() {
      this.$refs.input.value = null;
      this.$refs.input.click();
    },
    // 删除图片
    removeFriendImage() {
      this.friend.info.image = false;
      this.file = null;
      this.fileUrl = '';
    },
    // 选择完图片后
    selectedFriendImage() {
      const self = this;
      const {files} = this.$refs.input;
      if(!files.length) return;
      const file = files[0];
      NKC.methods.fileToUrl(file)
        .then(fileUrl => {
          self.fileUrl = fileUrl;
          self.file = file;
        })
        .catch(sweetError);
    },
    // 显示，隐藏备注信息
    switchNote() {
      this.showNote = !this.showNote;
    },
    // 保存好友信息
    saveFriendInfo() {
      const {friend, file, fileUrl, targetUser} = this;
      friend.info.phone = friend.info._phone.map(p => p.number);
      const {info, cid} = friend;
      const {name, description, location, phone, image} = info;
      const formData = new FormData();
      formData.append('friend', JSON.stringify({
        cid,
        name,
        description,
        location,
        phone,
        image: !!fileUrl || image
      }));
      formData.append('uid', targetUser.uid);
      if(file) {
        formData.append('file', file);
      }
      nkcUploadFile(`/message/friend`, 'PUT', formData)
        .then(() => {
          NKC.methods.appToast('保存成功');
        })
        .catch(NKC.methods.appToast)
    }
  },
  mounted() {
    this.setFriendImageUrl();
  }
})

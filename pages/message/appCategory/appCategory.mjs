const data = NKC.methods.getDataById('data');
const usersObj = {};
data.users.map(ug => {
  ug.data.map(u => usersObj[u.uid] = u);
});
const app = new Vue({
  el: '#app',
  data: {
    edit: !data.category,
    category: data.category || {
      name: '',
      description: '',
      friendsId: [],
    },
    users: data.users,
    usersObj,
  },
  computed: {
    selectedUsers() {
      const arr = [];
      const self = this;
      this.category.friendsId.map(uid => {
        const u = self.usersObj[uid];
        if(u) arr.push(u);
      });
      return arr;
    },
    selectedUsersId() {
      const {selectedUsers} = this;
      return selectedUsers.map(u => u.uid);
    }
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    selectUser(u) {
      const friendsId = this.category.friendsId;
      const index = friendsId.indexOf(u.uid);
      if(index === -1) {
        friendsId.push(u.uid);
        // Vue.set(friendsId, friendsId.length, u.uid)
      } else {
        this.unSelectUser(u);
      }
    },
    unSelectUser(u) {
      const friendsId = this.category.friendsId;
      const index = friendsId.indexOf(u.uid);
      if(index !== -1) {
        friendsId.splice(index, 1);
      }
    },
    save() {
      const self = this;
      const {_id, name, description} = self.category;
      let method, url;
      if(_id) {
        method = 'PATCH';
        url = `/friend_category/${_id}`;
      } else {
        method = 'POST';
        url = `/friend_category`;
      }
      return nkcAPI(url, method, {
        name,
        description,
        friendsId: self.selectedUsersId
      })
        .then((data) => {
          self.edit = false;
          NKC.methods.appToast('保存成功');
          if(!_id) {
            NKC.methods.visitUrl(`/message/category?cid=${data.category._id}`);
          }
        })
        .catch(NKC.methods.appToast);
    },
    visitUserHome(u) {
      NKC.methods.visitUrl(NKC.methods.tools.getUrl('messageUserDetail', u.uid), true);
    },
    toEdit() {
      this.edit = true;
    },
    remove() {
      const self = this;
      sweetQuestion(`删除分组「${this.category.name}」？`)
        .then(() => {
          return nkcAPI(`/friend_category/${self.category._id}`, 'DELETE')
            .then(() => {
              NKC.methods.appToast('删除成功');
              NKC.methods.appClosePage();
            })
            .catch(NKC.methods.appToast);
        })
    }
  }
})

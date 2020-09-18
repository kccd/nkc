const data = NKC.methods.getDataById('data');
const usersObj = {};
data.users.map(u => {
  u.showDetail = false;
  usersObj[u.uid] = u
});
const app = new Vue({
  el: '#app',
  data: {
    t: data.t,
    searchType: data.searchType || 'username',
    searchContent: data.searchContent || '',
    users: data.users,
    usersObj,
    roles: data.roles,
    selectedUsersId: [],
  },
  computed: {
    selectedUsers() {
      const {usersObj} = this;
      return this.selectedUsersId.map(uid => usersObj[uid]);
    },
    isChecked() {
      return this.selectedUsersId.length === this.users.length;
    }
  },
  methods: {
    format: NKC.methods.format,
    getUrl: NKC.methods.tools.getUrl,
    getIpUrl: NKC.methods.tools.getIpUrl,
    search() {
      const {t, searchType, searchContent} = this;
      if(!searchContent) sweetError('请输入搜索内容');
      window.location.href = `/e/settings/user?t=${t}&c=${searchType},${searchContent}`;
    },
    switchDetail(u) {
      u.showDetail = !u.showDetail;
    },
    editUser(u) {
      if(!window.ModifyAccountInfo) {
        window.ModifyAccountInfo = new NKC.modules.ModifyAccountInfo();
      }
      window.ModifyAccountInfo.open({
        uid: u.uid
      });
    },
    toDisableUser(postType, type, disable, user) {
      let usersId;
      if(type === 'all') {
        usersId = [].concat(this.selectedUsersId);
      } else {
        usersId = [user.uid];
      }
      return Promise.resolve()
        .then(() => {
          if(!usersId.length) throw '未选择用户';
          return nkcAPI(`/e/settings/user`, 'PUT', {
            type: postType,
            usersId,
            disable: !!disable
          });
        })
        .then(() => {
          sweetSuccess('执行成功');
        })
        .catch(err => {
          console.log(err);
          sweetError(err);
        });
    },
    disableUsers(type, disable, user) {
      this.toDisableUser('disable', type, disable, user);
    },
    hiddenUsersHome(type, disable, user) {
      this.toDisableUser('hidden', type, disable, user);
    },
    selectAllUsers() {
      const {users, isChecked} = this;
      if(!isChecked) {
        this.selectedUsersId = users.map(u => u.uid);
      } else {
        this.selectedUsersId = [];
      }
    }
  },
  mounted() {
    setTimeout(() => {
      floatUserPanel.initPanel();
    }, 500)
  }
});

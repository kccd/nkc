const data = NKC.methods.getDataById('data');
const app = new Vue({
  el: "#app",
  data: {
    content: '',
    users: [],
    friendsUid: data.friendsUid,
    page: 0,
    pageCount: 999999,
    end: false,
    status: 'unSearch', // unSearch, searching
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    toast: NKC.methods.appToast,
    checkContent() {
      const self = this;
      return new Promise(((resolve, reject) => {
        if(!self.content) {
          reject('请输入内容');
        } else {
          resolve(self.content);
        }
      }));
    },
    resetStatus() {
      this.status = 'unSearch';
    },
    getUser() {
      const self = this;
      const {page, content} = this;
      if(self.status === 'searching') return;
      self.status = 'searching';
      return Promise.resolve()
        .then(() => {
          return nkcAPI(`/message/search?uid=${content}&username=${content}&page=${page}&t=${Date.now()}`, 'GET')
        })
        .then(data => {
          const {page, pageCount} = data.paging;
          self.page = page;
          self.pageCount = pageCount;
          self.users = self.users.concat(data.users);
          if(page + 1 >= pageCount) self.end = true;
          self.resetStatus();
        })

    },
    search() {
      const self = this;
      self.checkContent()
        .then(() => {
          self.page = 0;
          self.end = false;
          self.pageCount = 999999;
          return self.getUser();
        })
        .catch(data => {
          self.resetStatus();
          self.toast(data);
        });
    },
    loadMore() {
      const self = this;
      self.checkContent()
        .then(() => {
          if(self.page + 1 >= self.pageCount) throw '到底了';
          self.page += 1;
          return self.getUser();
        })
        .catch((data) => {
          self.resetStatus();
          self.toast(data);
        });
    },
    toSendMessage(u) {
      NKC.methods.toChat(u.uid);
    }
  },
  mounted() {
    this.content = '我';
    this.search();
  }
})

import Vue from 'vue';
import { getDataById } from '../../lib/js/dataConversion';
import { nkcAPI } from '../../lib/js/netAPI';
import { getUrl } from '../../lib/js/tools';
import {
  sweetQuestion,
  sweetError,
  sweetSuccess,
} from '../../lib/js/sweetAlert';

const data = getDataById('data');
const app = new Vue({
  el: '#app',
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
    getUrl,
    toast: NKC.methods.appToast,
    checkContent() {
      const self = this;
      return new Promise((resolve, reject) => {
        if (!self.content) {
          reject('请输入内容');
        } else {
          resolve(self.content);
        }
      });
    },
    resetStatus() {
      this.status = 'unSearch';
    },
    getUser() {
      const self = this;
      const { page, content } = this;
      if (self.status === 'searching') {
        return;
      }
      self.status = 'searching';
      return Promise.resolve()
        .then(() => {
          return nkcAPI(
            `/message/search?uid=${content}&username=${content}&page=${page}&t=${Date.now()}`,
            'GET',
          );
        })
        .then((data) => {
          const { page, pageCount } = data.paging;
          self.page = page;
          self.pageCount = pageCount;
          self.users = self.users.concat(data.users);
          if (page + 1 >= pageCount) {
            self.end = true;
          }
          self.resetStatus();
        });
    },
    search() {
      const self = this;
      self
        .checkContent()
        .then(() => {
          self.page = 0;
          self.end = false;
          self.users = [];
          self.pageCount = 999999;
          return self.getUser();
        })
        .catch((data) => {
          self.resetStatus();
          self.toast(data);
        });
    },
    loadMore() {
      const self = this;
      self
        .checkContent()
        .then(() => {
          if (self.page + 1 >= self.pageCount) {
            throw '到底了';
          }
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
    },
    addFriend(u) {
      return sweetQuestion(`确定添加「${u.username}」为联系人吗？`)
        .then(() => {
          return nkcAPI('/message/friend/apply', 'POST', {
            uid: u.uid,
          });
        })
        .then(() => {
          sweetSuccess('添加成功');
        })
        .catch(sweetError);
    },
  },
});

window.app = app;

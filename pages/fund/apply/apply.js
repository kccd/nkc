const data = NKC.methods.getDataById('data');
const selectUser = new NKC.modules.SelectUser();
const app = new Vue({
  el: '#app',
  data: {
    form: data.applicationForm,
    fund: data.fund,
    fundSettings: data.fundSettings,
    membersId: data.membersId,
    users: [],
  },
  computed: {
    usersObj() {
      const obj = {};
      for(const u of this.users) {
        obj[u.uid] = u;
      }
      return obj;
    },
    members() {
      const {membersId, usersObj} = this;
      const arr = [];
      for(const uid of membersId) {
        arr.push(usersObj[uid]);
      }
      return arr;
    }
  },
  mounted() {

  },
  methods: {
    selectMember() {
      const self = this;
      selectUser.open(data => {
        self.users = self.users.concat(data.users);
        self.membersId = [...new Set(self.membersId.concat(data.usersId))];
      });
    }
  }
});
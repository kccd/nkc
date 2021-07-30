import LifePhotoPanel from '../../publicModules/lifePhotoPanel.vue';
const data = NKC.methods.getDataById('data');
console.log(data);
const {
  applicationForm,
  fund,
  fundSettings,
  users,
  applicant,
  members
} = data.settingsData;
const selectUser = new NKC.modules.SelectUser();
const app = new Vue({
  el: '#app',
  data: {
    uid: NKC.configs.uid,
    form: applicationForm,
    fund,
    fundSettings: data.fundSettings,
    members,
    applicant,
    users,
  },
  components: {
    'life-photo-panel': LifePhotoPanel
  },
  computed: {
    usersObj() {
      const obj = {};
      for(const u of this.users) {
        obj[u.uid] = u;
      }
      return obj;
    },
    formMembers() {
      const arr = [];
      const {usersObj, members} = this;
      for(const m of members) {
        const {agree, uid} = m;
        const {avatar, username} = usersObj[uid];
        arr.push({
          agree,
          uid,
          avatar,
          username
        });
      }
      return arr;
    }
  },
  mounted() {

  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    selectMember() {
      const self = this;
      selectUser.open(data => {
        self.users = self.users.concat(data.users);
        return self.addMembers(data.usersId)
          .then(() => {
            // selectUser.close();
            setTimeout(floatUserPanel.initPanel);
          })
          .catch(err => {
            sweetError(err);
          });
      });
    },
    addMembers(usersId) {
      const self = this;
      return nkcAPI(`/fund/a/${this.form._id}/settings/member`, 'POST', {
        usersId
      })
        .then((data) => {
          self.members = data.members;
        })
    },
    removeMember(uid) {
      const self = this;
      sweetQuestion(`确定要移除当前组员？`)
        .then(() => {
          return nkcAPI(`/fund/a/${this.form._id}/settings/member?uid=${uid}`, 'DELETE');
        })
        .then(data => {
          self.members = data.members;
          console.log(data.members)
        })
        .catch(sweetError);
    }
  }
});
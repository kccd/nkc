import {getUrl} from "../../../lib/js/tools";
import UserSelector from '../../../lib/vue/UserSelector';
const data = NKC.methods.getDataById('data');

const app = new Vue({
  el: '#app',
  components: {
    'user-selector': UserSelector
  },
  data: {
    accessControl: data.accessControl,
    roles: data.roles,
    grades: data.grades
  },
  methods: {
    getUrl,
    submit() {
      const {accessControl} = this;
      const newAccessControl = [];
      for(const ac of accessControl) {
        const {source, app, web} = ac;
        newAccessControl.push({
          source,
          app: {
            enabled: app.enabled,
            whitelist: {
              rolesId: app.whitelist.rolesId,
              gradesId: app.whitelist.gradesId,
              relation: app.whitelist.relation,
              usersId: app.whitelist.users.map(user => user.uid),
            },
            userDesc: app.userDesc,
            visitorDesc: app.visitorDesc,
          },
          web: {
            enabled: web.enabled,
            whitelist: {
              rolesId: web.whitelist.rolesId,
              gradesId: web.whitelist.gradesId,
              relation: web.whitelist.relation,
              usersId: web.whitelist.users.map(user => user.uid),
            },
            userDesc: web.userDesc,
            visitorDesc: web.visitorDesc,
          },
        });
      }

      nkcAPI(`/e/settings/visit`, 'PUT', {
        accessControl: newAccessControl,
      })
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch(sweetError);
    },
    getAccessControlTitle(source) {
      return (({
        community: '社区',
        column: '专栏',
        zone: '空间',
        fund: '基金',
        global: '全局',
        user: '用户名片',
        search: '搜索',
      })[source]) || source;
    },
    removeFormArr(arr, index) {
      arr.splice(index, 1);
    },
    selectUser(users) {
      const existsUsersId = users.map(u => u.uid);
      this.$refs.userSelector.open((res) => {
        for(const selectedUser of res.users) {
          const {uid, avatar, username} = selectedUser;
          if(existsUsersId.includes(uid)) continue;
          users.push({
            uid,
            avatar,
            username
          });
          existsUsersId.push(uid);
        }
        this.$refs.userSelector.close();
      });
    }
  }
});

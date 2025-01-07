import { nkcAPI } from '../../../lib/js/netAPI';
import { visitUrl } from '../../../lib/js/pageSwitch';

const app = new window.Vue({
  el: '#app',
  data: {
    error: '',
    add: false,
    roleId: '',
    displayName: '',
    description: '',
    auto: false,
  },
  methods: {
    save: function () {
      var role = {};
      role._id = this.roleId;
      role.displayName = this.displayName;
      role.description = this.description;
      role.auto = this.auto;
      if (!role._id) {
        return (this.error = '请输入证书ID');
      }
      if (!role._id) {
        return (this.error = '请输入证书名称');
      }
      if (!role.displayName) {
        return (this.error = '请输入证书简介');
      }
      this.error = '';
      nkcAPI('/e/settings/role', 'POST', { role: role })
        .then(function () {
          visitUrl('/e/settings/role/' + role._id, true);
        })
        .catch(function (err) {
          app.error = err.error || err;
        });
    },
  },
});

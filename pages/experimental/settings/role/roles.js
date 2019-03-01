var app = new Vue({
  el: '#app',
  data: {
    error: '',
    add: false,
    roleId: '',
    displayName: '',
    description: '',
    type: 'common'
  },
  methods: {
    save: function() {
      var role = {};
      role._id = this.roleId;
      role.displayName = this.displayName;
      role.description = this.description;
      role.type = this.type;
      if(!role._id) return this.error = '请输入证书ID';
      if(!role._id) return this.error = '请输入证书名称';
      if(!role.displayName) return this.error = '请输入证书简介';
      if(['common', 'management'].indexOf(role.type) === -1) return this.error = '请选择证书分类';
      this.error = '';
      kcAPI('/e/settings/role', 'POST', {role: role})
        .then(function() {
          window.location.href = '/e/settings/role/' + role._id;
        })
        .catch(function(err) {
          app.error = err.error || err;
        });
    }
  }
});
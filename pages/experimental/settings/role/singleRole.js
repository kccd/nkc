var app = new Vue({
  el: '#app',
  data: {
    role: '',
    roles: [],
    cloneRoleId: "",
    operations: [],
    defaultOperationsId: [],
    type: '',
    types: [],
    users: []
  },
  mounted: function() {
    var data = document.getElementById('data');
    data = JSON.parse(data.innerHTML);
    this.role = data.role;
    this.roles = data.roles;
    this.users = data.users;
    this.operations = data.operations;
    this.defaultOperationsId = data.defaultOperationsId;
    this.types = this.extendCount(data.operationTypes);
    this.types.unshift({
      _id: 'all',
      displayName: '全部权限',
      operations: this.operations
    });
    this.selectType(this.types[0]);
    
  },
  updated: function() {
    NKC.methods.initSelectColor(this.changeColor);
  },
  methods: {
    format: NKC.methods.format,
    cloneOperations: function() {
      var roles = this.roles;
      var cloneRoleId = this.cloneRoleId;
      if(!cloneRoleId) return;
      var role;
      for(var i = 0; i < roles.length; i++) {
        var _role = roles[i];
        if(cloneRoleId === _role._id) role = _role;
      }
      if(!role) return;
      sweetQuestion("确定要复制“"+role.displayName+"”的权限设置？")
        .then(function() {
          app.role.operationsId = [].concat(role.operationsId);
        })
        .catch(sweetError)
    },
    isDefault: function(operationId) {
      return this.defaultOperationsId.indexOf(operationId) !== -1;
    },
    removeRole: function() {
      if(confirm('确认要删除“' + this.role.displayName + '”证书？') === false) return;
      nkcAPI('/e/settings/role/' + app.role._id, 'DELETE', {})
        .then(function() {
          // window.location.href = '/e/settings/role';
          openToNewLocation('/e/settings/role');
        })
        .catch(function(err) {
          screenTopWarning(err);
        })
    },
    extendCount: function(types) {
      for(var j = 0; j < types.length; j++) {
        var type = types[j];
        var operations = [];
        for(var i = 0; i < this.operations.length; i++) {
          var operation = this.operations[i];
          if(operation.typeId.indexOf(type._id) !== -1) {
            operations.push(operation);
          };
        }
        type.operations = operations;
      }
      return types;
    },
    selectType: function(type) {
      this.type = type;
    },
    changeColor: function(value) {
      this.role.color = value;
    },
    uploadIcon: function(e) {
      var input = e.target;
      var role = app.role;
      var file = input.files[0];
      var formData = new FormData();
      formData.append('file', file);
      input.value = '';
      uploadFilePromise('/e/settings/role/' + role._id + '/icon', formData)
        .then(function() {
          role.hasIcon = true;
          var img = app.$refs.img;
          if(img) {
            img.setAttribute('src', '/statics/role_icon/' + role._id + '.png?t=' + Date.now());
          }
        })
        .catch(function(err) {
          screenTopWarning(err);
        });
    },
    deleteIcon: function() {
      this.role.hasIcon = false;
    },
    clickIconButton: function() {
      var input = this.$refs.input;
      input.click();
    },
    save: function() {
      var role = this.role;
      nkcAPI('/e/settings/role/' + role._id, 'PUT', {role: role})
        .then(function() {
          screenTopAlert('保存成功');
        })
        .catch(function(err) {
          screenTopWarning(err);
        })
    }
  }
})

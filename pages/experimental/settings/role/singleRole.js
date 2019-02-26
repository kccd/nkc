var app = new Vue({
  el: '#app',
  data: {
    role: '',
    operations: [],
    type: '',
    types: [],
    users: []
  },
  mounted: function() {
    var data = document.getElementById('data');
    data = JSON.parse(data.innerHTML);
    this.role = data.role;
    console.log(data);
    this.users = data.users;
    this.operations = data.operations;
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
    removeRole: function() {
      if(confirm('确认要删除“' + this.role.displayName + '”证书？') === false) return;
      kcAPI('/e/settings/role/' + app.role._id, 'DELETE', {})
        .then(function() {
          window.location.href = '/e/settings/role';
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
      uploadFileAPI('/e/settings/role/' + role._id + '/icon', 'POST', formData)
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
      kcAPI('/e/settings/role/' + role._id, 'PATCH', {role: role})
        .then(function() {
          screenTopAlert('保存成功');
        })
        .catch(function(err) {
          screenTopWarning(err);
        })
    }
  }
})

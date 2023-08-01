import { getDataById } from '../../../lib/js/dataConversion';
import {
  sweetQuestion,
  sweetError,
  sweetSuccess,
} from '../../../lib/js/sweetAlert';
import { nkcAPI, nkcUploadFile } from '../../../lib/js/netAPI';
import { visitUrl } from '../../../lib/js/pageSwitch';
import { objToStr } from '../../../lib/js/dataConversion';
import { detailedTime } from '../../../lib/js/time';
import Vue from 'vue';

const data = getDataById('data');

var app = new Vue({
  el: '#app',
  data: {
    role: data.role,
    roles: data.roles,
    cloneRoleId: '',
    operations: data.operations,
    defaultOperationsId: data.defaultOperationsId,
    users: data.users,
  },
  computed: {
    rolesObj() {
      const obj = {};
      for (const role of this.roles) {
        obj[role._id] = role;
      }
      return obj;
    },
  },
  mounted() {
    NKC.methods.initSelectColor(this.changeColor);
  },
  updated: function () {
    NKC.methods.initSelectColor(this.changeColor);
  },
  methods: {
    detailedTime,
    objToStr,
    cloneOperations: function () {
      const targetRole = this.rolesObj[this.cloneRoleId];
      sweetQuestion('确定要复制“' + targetRole.displayName + '”的权限设置？')
        .then(function () {
          app.role.operationsId = [...targetRole.operationsId];
          sweetSuccess('复制成功');
        })
        .catch(sweetError);
    },
    isDefault: function (operationId) {
      return this.defaultOperationsId.indexOf(operationId) !== -1;
    },
    removeRole: function () {
      sweetQuestion(
        `当前操作不可撤销，确定要删除“${this.role.displayName}”证书？`,
      )
        .then(() => {
          return nkcAPI('/e/settings/role/' + app.role._id, 'DELETE', {});
        })
        .then(function () {
          visitUrl('/e/settings/role');
        })
        .catch(sweetError);
    },
    extendCount: function (types) {
      for (var j = 0; j < types.length; j++) {
        var type = types[j];
        var operations = [];
        for (var i = 0; i < this.operations.length; i++) {
          var operation = this.operations[i];
          if (operation.typeId.indexOf(type._id) !== -1) {
            operations.push(operation);
          }
        }
        type.operations = operations;
      }
      return types;
    },
    changeColor: function (value) {
      this.role.color = value;
    },
    uploadIcon: function (e) {
      var input = e.target;
      var role = app.role;
      var file = input.files[0];
      var formData = new FormData();
      formData.append('file', file);
      input.value = '';
      nkcUploadFile('/e/settings/role/' + role._id + '/icon', formData)
        .then(function () {
          role.hasIcon = true;
          var img = app.$refs.img;
          if (img) {
            img.setAttribute(
              'src',
              '/statics/role_icon/' + role._id + '.png?t=' + Date.now(),
            );
          }
        })
        .catch(sweetError);
    },
    deleteIcon: function () {
      this.role.hasIcon = false;
    },
    clickIconButton: function () {
      var input = this.$refs.input;
      input.click();
    },
    save: function () {
      var role = this.role;
      nkcAPI('/e/settings/role/' + role._id, 'PUT', { role: role })
        .then(function () {
          sweetSuccess('保存成功');
        })
        .catch(sweetError);
    },
  },
});

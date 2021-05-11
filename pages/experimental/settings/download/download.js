const data = NKC.methods.getDataById('data');
const hours = [];
for(let i = 0; i <=24; i++) {
  hours.push(i);
}
const gradeList = data.certList.filter(c => c.type.indexOf('grade-') === 0 || ['role-visitor'].includes(c.type));
const roleList = data.certList.filter(c => c.type.indexOf('role-') === 0 && !['role-visitor'].includes(c.type));
const app = new Vue({
  el: '#app',
  data: {
    hours,
    certList: data.certList,
    gradeList,
    roleList,
    settings: data.downloadSettings
  },
  methods: {
    addSpeed(arr) {
      arr.push({
        startingTime: 0,
        endTime: 24,
        speed: 0
      });
    },
    addFileCount(arr) {
      arr.push({
        startingTime: 0,
        endTime: 24,
        fileCount: 0
      });
    },
    removeFromArray(arr, index) {
      arr.splice(index, 1);
    },
    addCert(arr, type = 'speed') {
      const item = {
        type: '',
        data: []
      };
      if(type === 'speed') {
        this.addSpeed(item.data);
      } else {
        this.addFileCount(item.data);
      }
      arr.push(item);
    },
    addRole(arr) {
      arr.push({
        type:'',
        fileCount: 0
      })
    },
    save() {
      nkcAPI('/e/settings/download', 'PUT', {
        downloadSettings: this.settings
      })
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch(sweetError)
    }
  }
});

Object.assign(window, {
  hours,
  gradeList,
  roleList,
  app,
});

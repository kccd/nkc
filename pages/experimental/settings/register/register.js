import { sweetError } from '../../../lib/js/sweetAlert';
var app = new Vue({
  el: '#app',
  data: {
    regSettings: '',
    selectedForums: [],
    error: '',
    info: '',
    categories: [],
  },
  mounted: function () {
    var data = NKC.methods.getDataById('data');
    this.regSettings = data.regSettings;
    this.selectedForums = data.selectedForums;
    this.categories = data.categories;
    var this_ = this;
    vueSelectForum.init({
      func: this_.selectForum,
    });
  },
  computed: {
    selectedForumsId: function () {
      var arr = [];
      for (var i = 0; i < this.selectedForums.length; i++) {
        var f = this.selectedForums[i];
        arr.push(f.fid);
      }
      return arr;
    },
  },
  methods: {
    remove: function (f) {
      var index = this.selectedForumsId.indexOf(f.fid);
      if (index >= 0) {
        this.selectedForums.splice(index, 1);
      }
    },
    selectForum: function (f) {
      app.selectedForums.push(f);
    },
    select: function () {
      vueSelectForum.app.show();
    },
    addExam(event) {
      const newData = {
        _id: event.target.id,
        name: event.target.name,
      };
      const isDuplicate = this.regSettings.examSource.some(
        (examSource) => examSource._id === newData._id,
      );
      if (!isDuplicate) {
        this.regSettings.examSource.push(newData);
      } else {
        sweetError('请别重复添加相同试卷');
      }
    },
    deleteExam(event) {
      this.regSettings.examSource = this.regSettings.examSource.filter(
        (exam) => exam._id !== event.target.id,
      );
    },
    save: function () {
      var selectedForums = app.selectedForums;
      var fid = [];
      for (var i = 0; i < selectedForums.length; i++) {
        fid.push(selectedForums[i].fid);
      }
      app.info = '';
      nkcAPI('/e/settings/register', 'PUT', {
        defaultSubscribeForumsId: fid,
        regSettings: this.regSettings,
      })
        .then(function () {
          app.info = '保存成功';
        })
        .catch(function (data) {
          app.error = data.error || data;
        });
    },
  },
});

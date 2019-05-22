var app = new Vue({
  el: "#app",
  data: {
    regSettings: "",
    selectedForums: [],
    error: "",
    info: ""
  },
  mounted: function() {
    var data = getDataById("data");
    this.regSettings = data.regSettings;
    this.selectedForums = data.selectedForums;
    var this_ = this;
    vueSelectForum.init({
      func: this_.selectForum
    });
  },
  computed: {
    selectedForumsId: function() {
      var arr = [];
      for(var i = 0; i < this.selectedForums.length; i++) {
        var f = this.selectedForums[i];
        arr.push(f.fid);
      }
      return arr;
    }
  },
  methods: {
    remove: function(f) {
      var index = this.selectedForumsId.indexOf(f.fid);
      if(index >= 0) {
        this.selectedForums.splice(index, 1);
      }
    },
    selectForum: function(f) {
      app.selectedForums.push(f);
    },
    select: function() {
      vueSelectForum.app.show();
    },
    save: function() {
      var selectedForums = app.selectedForums;
      var fid = [];
      for(var i = 0; i < selectedForums.length; i++) {
        fid.push(selectedForums[i].fid);
      }
      nkcAPI("/e/settings/register", "PATCH", {
        defaultSubscribeForumsId: fid
      })
        .then(function() {
          app.info = "保存成功";
        })
        .catch(function(data) {
          app.error = data.error || data;
        });
    }
  }
});
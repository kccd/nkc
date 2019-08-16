var app;
var dealInfo = JSON.parse($("#dealInfo").text());

app = new Vue({
  el: "#app",
  data: {
    templates: dealInfo.templates,
    uid: dealInfo.uid,
    saveBtnDis: false
  },
  methods: {
    addOneTemplate: function() {
      app.templates.push({name: "", firstPrice: 0, addPrice: 0})
    },
    delCurrentTemplate: function(index) {
      this.templates.splice(index,1);
    },
    saveFreightTemplates: function() {
      for(var at=0;at < app.templates.length;at++) {
        if(!app.templates[at].name) {
          return sweetWarning("模板名称不可为空")
        }
      }
      var post = {
        templates: app.templates
      }
      app.saveBtnDis = true;
      nkcAPI("/shop/manage/"+app.uid+"/template", "PATCH", post)
      .then(function(data) {
        sweetAlert("保存成功");
        app.saveBtnDis = false;
      })
      .catch(function(data) {
        app.saveBtnDis = false;
        sweetWarning(data || data.error)
      })
    }
  }
})

var app = new Vue({
  el: "#app",
  data: {
    records: [],
    t: "",
    content: "",
    mainScore: "",
  },
  mounted: function() {
    var data = document.getElementById("data");
    data = JSON.parse(data.innerHTML);
    this.records = data.records;
    this.t = data.t || "username";
    this.content = data.content;
    this.mainScore = data.mainScore;
    setTimeout(function() {
      floatUserPanel.initPanel();
    }, 500)
  },
  methods: {
    format: NKC.methods.format,
    search: function() {
      // window.location.href = "/e/log/withdraw?t=" + app.t + "&content=" + app.content;
      openToNewLocation("/e/log/withdraw?t=" + app.t + "&content=" + app.content);
    },
    success: function(record) {
      if(confirm("此操作将会把“调用接口”的状态改为“成功”，确定要继续吗？") === false) return;
      // 退回用户kcb
      nkcAPI("/e/settings/kcb/record", 'PATCH', {
        type: "success",
        kcbsRecordId: record._id
      })
        .then(function() {
          window.location.reload();
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    },
    fail: function(record) {
      const mainScoreName = this.mainScore.name;
      if(confirm("此操作将会把“调用接口”的状态改为“失败”，并且退还给用户 " +record.num/100+ " "+mainScoreName+"，确定要继续吗？") === false) return;
      nkcAPI("/e/settings/kcb/record", 'PATCH', {
        type: "fail",
        kcbsRecordId: record._id
      })
        .then(function() {
          window.location.reload();
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    }
  }
});

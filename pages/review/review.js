var data = NKC.methods.getDataById("data");
var pid = [];
var review = {};

for(var i = 0; i < data.results.length; i++) {
  var p = data.results[i].post.pid;
  var tid = data.results[i].thread.tid;
  var isThread = data.results[i].thread.oc === p;
  pid.push(p);
  review[p] = {
    pid: p,
    pass: true,
    reason: "包括但不限于违反相关法律法规和政策，品质不佳，侵犯他人权益，分类错误",
    delType: "toDraft",
    isThread: isThread,
    noticeType: [true],
    illegalType: [],
    threadId: tid
  };
}
var app = new Vue({
  el: "#app",
  data: {
    selectedPid:[],
    showInputPid: [],
    pid: pid,
    review: review
  },
  methods: {
    selectAll: function() {
      if(this.selectedPid.length === this.pid.length) {
        this.selectedPid = []
      } else {
        this.selectedPid = [].concat(this.pid);
      }
    },
    post: function(arr, index) {
      var data = arr[index];
      if(!data) return;
      var d, url, method = "PATCH";
      if(data.pass) {
        // 通过
        d = {
          pid: data.postId
        };
        url = "/review";
      } else {
        // 不通过
        if(data.delType === "toRecycle") {
          /*d = {
            fid: "recycle",
            para: data
          };*/
          d = {
            postsId: [data.postId],
            reason: data.reason,
            remindUser: data.noticeType,
            violation: data.illegalType
          };
          method = "POST";
          // url = "/t/" + data.threadId + "/disabled";
          url = "/threads/recycle";
        } else {
          /*d = {
            para: data
          };*/
          d = {
            postsId: [data.postId],
            reason: data.reason,
            remindUser: data.noticeType,
            violation: data.illegalType
          };
          // url = "/t/" + data.threadId + "/moveDraft";
          url = "/threads/draft";
          method = "POST";
        }
      }

      nkcAPI(url, method, d)
        .then(function() {
          screenTopAlert("PID: " + data.postId + " 处理成功!");
          app.post(arr, index+1);
        })
        .catch(function(data) {
          screenTopWarning(data);
        });
    },
    submit: function(pid) {
      var pidArr;
      if(typeof pid === "string") { // 提交单个
        pidArr = [pid];
      } else { // 提交多个
        pidArr = this.selectedPid;
      }
      var arr = [];
      for(var i = 0; i < pidArr.length; i++) {
        var reviewData = this.review[pidArr[i]];
        arr.push({
          pass: reviewData.pass,
          reason: reviewData.reason,
          delType: reviewData.delType,
          postType: reviewData.isThread?"thread":"post",
          threadId: reviewData.threadId,
          postId: reviewData.pid,
          noticeType: reviewData.noticeType.length > 0,
          illegalType: reviewData.illegalType.length > 0
        });
      }
      this.post(arr, 0);
    },
    chooseAll: function(type) {
      var selectedPid = this.selectedPid;
      for(var i = 0; i < this.selectedPid.length; i++) {
        var p = this.selectedPid[i];
        var reviewData = this.review[p];
        reviewData.pass = type;
      }
    }
  }
});

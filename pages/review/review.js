var data = NKC.methods.getDataById("data");
var pid = [];
var did = [];
var review = {};
var reviewType = data.reviewType;
if(data.reviewType === 'post') {
  for(var i = 0; i < data.results.length; i++) {
    var p = data.results[i].post.pid;
    var tid = data.results[i].thread.tid;
    var isThread = data.results[i].thread.oc === p;
    pid.push(p);
    review[p] = {
      pid: p,
      pass: true,
      reason: "",
      delType: "toDraft",
      isThread: isThread,
      noticeType: [true],
      illegalType: [],
      threadId: tid
    };
  }
} else {
  for(var i = 0; i < data.results.length; i++) {
    var d = data.results[i].document.did;
    var aid = data.results[i].article._id;
    did.push(d);
    review[d] = {
      did: d,
      pass: true,
      reason: "",
      delType: "toDraft",
      noticeType: [true],
      illegalType: [],
      articleId: aid
    };
  }
}

var app = new Vue({
  el: "#app",
  data: {
    selectedPid:[],
    selectedDid: [],
    showInputPid: [],
    pid: pid,
    did: did,
    review: review,
    reviewType: reviewType?reviewType:'post',
  },
  mounted() {
  },
  methods: {
    selectAll: function() {
      if(this.reviewType === 'post') {
        if(this.selectedPid.length === this.pid.length) {
          this.selectedPid = []
        } else {
          this.selectedPid = [].concat(this.pid);
        }
      } else {
        if(this.selectedDid.length === this.did.length) {
          this.selectedDid = []
        } else {
          this.selectedDid = [].concat(this.did);
        }
      }

    },
    //提交document审核
    document(arr, index) {
      debugger
      let data = arr[index];
      if(!data) return;
      let d, url, method = "PUT";
      if(data.pass) {
        d = {
          did: data.did,
          type: 'document',
        };
        url = "/review";
      } else {
        if(data.delType === "toRecycle") {
          d = {
            did: [data.did],
            reason: data.reason,
            remindUser: data.noticeType,
            violation: data.illegalType
          };
          method = "POST";
          url = "/document/recycle";
        } else {
          //退修
          d = {
            did: [data.did],
            reason: data.reason,
            remindUser: data.noticeType,
            violation: data.illegalType
          };
          url = "/document/draft";
          method = "POST";
        }
      }

      nkcAPI(url, method, d)
        .then(function() {
          screenTopAlert("DID: " + data.did + " 处理成功!");
          app.document(arr, index+1);
        })
        .catch(function(data) {
          screenTopWarning("DID: " + data.did + ' 处理失败! error: ' + data.error || data);
          console.log(data);
          app.document(arr, index+1);
        });
    },
    //提交post审核
    post: function(arr, index) {
      let data = arr[index];
      if(!data) return;
      let d, url, method = "PUT";
      if(data.pass) {
        // 通过
        d = {
          pid: data.postId,
          type: 'post',
        };
        url = "/review";
      } else {
        // 不通过
        // 送回收站
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
          //退修
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
          screenTopWarning("PID: " + data.postId + ' 处理失败! error: ' + data.error || data);
          console.log(data);
          app.post(arr, index+1);
        });
    },
    submit: function(id) {
      if(this.reviewType === 'post') {
        let pidArr;
        if(typeof id === "string") { // 提交单个
          pidArr = [id];
        } else { // 提交多个
          pidArr = this.selectedPid;
        }
        let arr = [];
        for(let i = 0; i < pidArr.length; i++) {
          let reviewData = this.review[pidArr[i]];
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
      } else {
        let didArr;
        if(typeof id === "String") {//提交单个
          didArr = [id];
        } else {
          didArr = this.selectedDid;
        }
        let arr = [];
        for(let i = 0; i < didArr.length; i++) {
          let reviewData = this.review[didArr[i]];
          arr.push({
            did: reviewData.did,
            pass: reviewData.pass,
            reason: reviewData.reason,
            delType: reviewData.delType,
            articleId: reviewData.articleId,
            noticeType: reviewData.noticeType.length > 0,
            illegalType: reviewData.illegalType.length > 0
          });
        }
        this.document(arr, 0);
      }

    },
    chooseAll: function(type) {
      if(this.reviewType === 'post') {
        for(var i = 0; i < this.selectedPid.length; i++) {
          var p = this.selectedPid[i];
          var reviewData = this.review[p];
          reviewData.pass = type;
        }
      } else {
        for(var i = 0; i < this.selectedDid.length; i++) {
          var d = this.selectedDid[i];
          var reviewData = this.review[d];
          reviewData.pass = type;
        }
      }

    },
    //选择审核类型
    selectReviewType(type) {
      window.location.href = `/review?reviewType=${type}`;
    }
  }
});

Object.assign(window, {
  pid,
  review,
  app,
});

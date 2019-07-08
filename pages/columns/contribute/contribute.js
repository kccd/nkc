var data = getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    column: data.column,
    user: data.user,
    selectedThreads: [],
    threads: [],
    chooseTid: [],
    succeed: false,
    showThreads: false,
    categories: data.categories,
    categoriesId: [],
    paging: {
      page: 0
    },
    description: "",
    error: ""
  },
  mounted: function() {
    this.getThreads();
  },
  computed: {
    selectedThreadsId: function() {
      var selectedThreads = this.selectedThreads;
      var arr = [];
      for(var i = 0; i < selectedThreads.length; i++) {
        var t = selectedThreads[i];
        arr.push(t.tid);
      }
      return arr;
    }
  },
  methods: {
    selectPage: function(type, num) {
      if(type === "null") return;
      this.getThreads(num);
    },
    getThreadById: function(tid) {
      var threads = this.threads;
      for(var i = 0; i < threads.length; i++) {
        if(threads[i].tid === tid) return threads[i];
      }
    },
    remove: function(index) {
      this.selectedThreads.splice(index, 1);
    },
    getThreads: function(page) {
      page = page || 0;
      this.chooseTid = [];
      nkcAPI("/t?type=selfThreads&page=" + page, "GET")
        .then(function(data) {
          app.paging = data.paging;
          app.threads = data.threads;
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    },
    choose: function() {
      var selectedThreadsId = this.selectedThreadsId;
      var chooseTid = this.chooseTid;
      for(var i = 0; i < chooseTid.length; i++) {
        var tid = chooseTid[i];
        if(selectedThreadsId.indexOf(tid) === -1) {
          var thread = this.getThreadById(tid);
          this.selectedThreads.push(thread);
        }
      }
      this.chooseTid = [];
    },
    submit: function() {
      this.error = "";
      var selectedThreadsId = this.selectedThreadsId;
      if(selectedThreadsId.length === 0) return this.error = "请选择需要投稿的文章";
      if(!this.categoriesId || this.categoriesId.length === 0) return this.error = "请选择文章分类";
      nkcAPI("/m/" + this.column._id + "/contribute", "POST", {
        threadsId: selectedThreadsId,
        categoriesId: this.categoriesId,
        description: this.description
      })
        .then(function() {
          app.succeed = true;
        })
        .catch(function(data) {
          app.error = data.error || data;
        })
    }
  }
});
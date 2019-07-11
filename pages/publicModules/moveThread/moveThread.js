NKC.modules.MoveThread = function() {
  var this_ = this;
  this_.dom = $("#moduleMoveThread");
  this_.dom.modal({
    show: false
  });
  this_.app = new Vue({
    el: "#moduleMoveThreadApp",
    data: {
      forums: [],
      selectedForums: [],
      loading: true,
      moveType: "add", // replace, add
      forumType: "topic", // discipline, topic
      forum: "",

      submitting: false,
      showRecycle: false
    },
    computed: {
      selectedForumsId: function() {
        var arr = [];
        for(var i = 0; i < this.selectedForums.length; i++) {
          arr.push(this.selectedForums[i].fid);
        }
        return arr;
      },
      showForums: function() {
        var arr = [];
        for(var i = 0 ; i < this.forums.length; i++) {
          var forum = this.forums[i];
          if(forum.forumType === this.forumType) {
            arr.push(forum);
          }
        }
        return arr;
      }
    },
    methods: {
      getAllChildForums: function(forum, arr) {
        if(forum.childrenForums && forum.childrenForums.length > 0) {
          for(var i = 0; i < forum.childrenForums.length; i++) {
            var f = forum.childrenForums[i];
            if(!f.childrenForums || f.childrenForums.length === 0) {
              if(this.showRecycle || f.fid !== "recycle") {
                f.selectedThreadType = "";
                arr.push(f);
              }
            }
            this.getAllChildForums(f, arr);
          }
        }
        return arr;
      },
      selectForum: function(f) {
        if(this.selectedForumsId.indexOf(f.fid) !== -1) return;
        this.selectedForums.push(f);
        this.forum = "";
      },
      removeForum: function(index) {
        this.selectedForums.splice(index, 1);
        this.forum = "";
      },
      submit: function() {
        var forums = [];
        for(var i = 0; i < this.selectedForums.length;i ++) {
          var f = this.selectedForums[i];
          forums.push({
            fid: f.fid,
            cid: f.selectedThreadType? f.selectedThreadType.cid: ""
          });
        }
        if(forums.length === 0) return screenTopWarning("请至少选择一个专业");
        this_.callback({
          forumsId: this.selectedForumsId,
          forums: forums,
          moveType: this.moveType
        });
      },
      showThreadType: function(forum) {
        this.forum = forum;
      },
      selectThreadType: function(t) {
        this.forum.selectedThreadType = t;
        this.forum = "";
      },
      resetThreadType: function() {
        this.forum.selectedThreadType = "";
        this.forum = "";
      }
    }
  });
  this_.open = function(callback, options) {
    this_.callback = callback;
    this_.dom.modal("show");
    if(options) {
      this_.app.showRecycle = options.showRecycle || false;
    }
    nkcAPI("/f", "GET")
      .then(function(data) {
        for(var i = 0; i < data.forums.length; i++) {
          var forum = data.forums[i];
          forum.allChildForums = this_.app.getAllChildForums(forum, []);
        }
        this_.app.forums = data.forums;
        this_.app.loading = false;
      })
      .catch(function(data) {
        screenTopWarning(data);
      })
  };
  this_.close = function() {
    this_.dom.modal("hide");
    this_.app.selectedForums = [];
    this_.app.moveType = "replace";
    this_.app.forumType = "topic";
    this_.unlock();
  };
  this_.lock = function() {
    this_.app.submitting = true;
  };
  this_.unlock = function() {
    this_.app.submitting = false;
  }
};
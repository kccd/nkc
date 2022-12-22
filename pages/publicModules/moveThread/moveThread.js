import List from '../threadCategory/list';
import MoveCategory from '../../lib/vue/publicVue/moveThreadOrArticle/MoveCategory';
NKC.modules.MoveThread = function() {
  var this_ = this;
  this_.dom = $("#moduleMoveThread");
  this_.dom.modal({
    show: false
  });
  this_.app = new Vue({
    el: "#moduleMoveThreadApp",
    data: {
      mode: 'move', // move, selector
      forums: [],
      selectForumCategory: true,
      selectedForums: [],
      loading: true,
      moveType: "replace", // replace, add
      forumType: "", // discipline, topic
      forum: "",
      hideMoveType: false,
      forumCategories: [],
      showAnonymousCheckbox: false,
      onlyAnonymous: false,
      forumCountLimit: 20,
      submitting: false,
      showRecycle: false,
      threadCategories: [],
      selectedThreadCategoriesId: [],

      recycleId: '',

      violation: false,
      remindUser: true,
      reason: ''
    },
    components: {
      'thread-category-list': List,
      'move-category': MoveCategory,
    },
    computed: {

      canSelectForums: function() {
        var forums = this.forums;
        var arr = [];
        for(var i = 0; i < forums.length; i++) {
          arr = arr.concat(forums[i].allChildForums || []);
        }
        return arr;
      },

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
          // if(forum.forumType === this.forumType) {
          if(forum.categoryId === this.forumType) {
            if(!this.onlyAnonymous) {
              arr.push(forum);
              continue;
            }
            for(var ii = 0; ii < forum.allChildForums.length; ii++) {
              var ff = forum.allChildForums[ii];
              if(ff.allowedAnonymousPost) {
                arr.push(forum);
                break;
              }
            }
          }
        }
        return arr;
      }
    },
    methods: {
      getUrl: NKC.methods.tools.getUrl,
      getCategory: function(forum, categoriesId) {
        var threadTypes = forum.threadTypes;
        for(var i = 0; i < threadTypes.length; i++) {
          var threadType = threadTypes[i];
          if(categoriesId.indexOf(threadType.cid + "") !== -1 || categoriesId.indexOf(threadType.cid) !== -1) {
            return threadType;
          }
        }
      },
      getForumsById: function(fid) {
        var canSelectForums = this.canSelectForums;
        for(var i = 0; i < canSelectForums.length; i++) {
          if(fid === canSelectForums[i].fid) return canSelectForums[i];
        }
      },
      getAllChildForums: function(forum, arr) {
        if(forum.childrenForums && forum.childrenForums.length > 0) {
          for(var i = 0; i < forum.childrenForums.length; i++) {
            var f = forum.childrenForums[i];
            if(!f.childrenForums || f.childrenForums.length === 0) {
              if(this.showRecycle || f.fid !== this.recycleId) {
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
        if(this.selectedForums.length >= this.forumCountLimit) return sweetWarning("最多只能选择" + this.forumCountLimit + "个专业");
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
            cid: f.selectedThreadType? f.selectedThreadType.cid: "",
            fName: f.displayName,
            description: f.description,
            iconFileName: f.iconFileName,
            logo: f.logo,
            banner: f.banner,
            cName: f.selectedThreadType? f.selectedThreadType.name: "",
            color: f.color
          });
        }
        if(forums.length === 0 && this.moveType === 'replace') return screenTopWarning("请至少选择一个专业");
        let selectedThreadCategoriesId = [];
        if(this.mode === 'move') {
          selectedThreadCategoriesId = this.getSelectedThreadCategoriesId();
        }
        this_.callback({
          forumsId: this.selectedForumsId,
          forums: forums,
          moveType: this.moveType,
          originForums: this.selectedForums,
          violation: this.violation,
          reason: this.reason,
          remindUser: this.remindUser,
          threadCategoriesId: selectedThreadCategoriesId
        });
      },
      getSelectedThreadCategoriesId() {
        return this.$refs.moveCategoryList.getSelectedCategoriesId();
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
  this_.open = function(callback, options = {}) {
    this_.callback = callback;
    this_.dom.modal("show");
    nkcAPI("/f", "GET")
      .then(function(data) {
        this_.app.recycleId = data.recycleId;
        for(var i = 0; i < data.forums.length; i++) {
          var forum = data.forums[i];
          forum.allChildForums = this_.app.getAllChildForums(forum, []);
        }
        this_.app.forums = data.forums;
        this_.app.loading = false;
        this_.app.forumCategories = data.forumCategories;
        this_.app.threadCategories = data.threadCategories;
        this_.app.selectForumCategory = options.selectForumCategory;
        this_.app.selectedThreadCategoriesId = options.selectedThreadCategoriesId || [];
        this_.app.mode = options.mode || 'move';
        if(!this_.app.forumType) this_.app.forumType = this_.app.forumCategories[0]._id;
        this_.app.forumCountLimit = 20;
        if(options) {
          this_.app.showRecycle = options.showRecycle || false;
          if(options.selectedForumsId && options.selectedForumsId.length > 0) {
            var selectedForums = [];
            var forumsId = options.selectedForumsId;
            for(var i = 0; i < forumsId.length; i++) {
              var f = this_.app.getForumsById(forumsId[i]);
              if(f) {
                if(options.selectedCategoriesId) {
                  f.selectedThreadType = this_.app.getCategory(f, options.selectedCategoriesId);
                }
                selectedForums.push(f);
              }
            }
            this_.app.selectedForums = selectedForums;
          }
          if(options.hideMoveType) {
            this_.app.hideMoveType = true;
            this_.app.mode = 'selector';
          }
          this_.app.showAnonymousCheckbox = options.showAnonymousCheckbox || false;
          if(options.forumCountLimit) this_.app.forumCountLimit = options.forumCountLimit;
        }
      })
      .then(()=>{
        this_.app.$refs.moveCategoryList.open(()=>{},{source: 'thread'})
      })
      .catch(function(data) {
        screenTopWarning(data);
      })
  };
  this_.close = function() {
    this_.dom.modal("hide");
    this_.app.selectedForums = [];
    this_.app.moveType = "replace";
    this_.app.showAnonymousCheckbox = false;
    this_.app.onlyAnonymous = false;
    this_.app.forumType = "";
    this_.unlock();
  };
  this_.lock = function() {
    this_.app.submitting = true;
  };
  this_.unlock = function() {
    this_.app.submitting = false;
  }
};

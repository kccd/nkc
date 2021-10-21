window.SubscribeTypes = undefined;
var initComplexOptions = !!localStorage.getItem("search_complexOptions");

var app = new Vue({
  el: "#app",
  data: {
    selectedForums: [],
    excludedForums: [],
    onlyTitle: false,
    author: "",
    digest: false,
    timeStart: {
      year: 1970,
      month: 1,
      day: 1
    },
    timeEnd: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate()
    },
    sortType: "", // time, 默认相关度
    sort: "", // asc, 默认降序
    relation: "", // and, 默认or
    t: "",
    c: "",
    complexOptions: initComplexOptions
  },
  computed: {
    timeStartDay: function() {
      return NKC.methods.getDayCountByYearMonth(this.timeStart.year, this.timeStart.month);
    },
    timeEndDay: function() {
      return NKC.methods.getDayCountByYearMonth(this.timeEnd.year, this.timeEnd.month);
    },
    options: function() {
      var o = {
        fid: this.selectedForumsId,
        excludedFid: this.excludedForumsId,
        timeStart: this.timeStart,
        timeEnd: this.timeEnd,
        sort: this.sort,
        author: this.author,
        digest: this.digest,
        sortType: this.sortType,
        relation: this.relation,
        onlyTitle: this.onlyTitle,
      };
      return this.strToBase64(JSON.stringify(o));
    },
    selectedForumsId: function() {
      var arr = [];
      for(var i = 0 ; i < this.selectedForums.length; i++) {
        arr.push(this.selectedForums[i].fid);
      }
      return arr;
    },
    excludedForumsId: function() {
      return this.excludedForums.map(forum => forum.fid);
    }
  },
  methods: {
    strToBase64: function(str) {
      return window.btoa(encodeURIComponent(str));
    },
    base64ToStr: function(base64) {
      return decodeURIComponent(window.atob(base64))
    },
    selectForum: function(type) {
      var self = this;
      const forumsId = this.selectedForumsId.concat(this.excludedForumsId);
      const forums = type === 'selected'? this.selectedForums: this.excludedForums;
      if(!window.ForumSelector) window.ForumSelector = new NKC.modules.ForumSelector();
      window.ForumSelector.open(function(data) {
        if(forumsId.includes(data.forum.fid)) return;
        forums.push(data.forum)
      }, {
        from: 'readable',
        // selectedForumsId: self.selectedForumsId,
        needThreadType: false,
      });
    },
    removeFromArr(arr, index) {
      arr.splice(index, 1);
    },
    clickNav: function(type) {
      var t;
      if(type === "all") t = "";
      if(type === "user") t = "&t=user";
      if(type === "thread") t = "&t=thread";
      if(type === "post") t = "&t=post";
      if(type === "column") t = "&t=column";
      if(type === "resource") t= "&t=resource";
      // window.location.href = "/search?c=" + this.strToBase64(this.c || "") + t +"&d=" + this.options;
      NKC.methods.visitUrl("/search?c=" + this.strToBase64(this.c || "") + t +"&d=" + this.options)
    },
    // 搜索
    search: function() {
      if(!this.c) return screenTopWarning("请输入关键词");
      if(this.selectedForumsId.length > 0) {
        const forumsId = this.selectedForumsId.filter(fid => !this.excludedForumsId.includes(fid));
        if(forumsId.length === 0) {
          return screenTopWarning('专业筛选和专业排除冲突');
        }
      }
      NKC.methods.visitUrl("/search?c=" + this.strToBase64(this.c || "") + (this.t?"&t="+this.t:"") +"&d=" + this.options)
      // window.location.href = "/search?c=" + this.strToBase64(this.c || "") + (this.t?"&t="+this.t:"") +"&d=" + this.options;
    },
    // 展开或者关闭更多搜索选项
    openMoreOptions: function() {
      var isOpen = this.complexOptions;
      if(isOpen) {
        this.complexOptions = false;
        this.selectedForums.length = 0;
        this.excludedForums.length = 0;
        this.onlyTitle = false;
        this.author = "";
        this.digest = false;
        this.timeStart = {
          year: 1970,
          month: 1,
          day: 1
        };
        this.timeEnd = {
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          day: new Date().getDate()
        };
        this.sortType = "";
        this.sort = "";
        this.relation = "";
        this.t = "";
        localStorage.removeItem("search_complexOptions");
      } else {
        this.complexOptions = true;
        localStorage.setItem("search_complexOptions", "1");
      }
    }
  },
  mounted: function() {
    var data = NKC.methods.getDataById("data");
    try{
      this.c = this.base64ToStr(data.c);
    } catch(err) {
      console.log(err);
      this.c = data.c;
    }

    this.t = data.t || "";
    this.selectedForums = data.selectedForums || [];
    this.excludedForums = data.excludedForums || [];
    var options = data.d;
    if(options) {
      try{
        options = JSON.parse(this.base64ToStr(options));
        if(options.timeStart) this.timeStart = options.timeStart;
        if(options.timeEnd) this.timeEnd = options.timeEnd;
        if(options.sort) this.sort = options.sort;
        if(options.sortType) this.sortType = options.sortType;
        if(options.relation) this.relation = options.relation;
        if(options.author) this.author = options.author;
        if(options.digest) this.digest = options.digest;
        if(options.fid) this.fid = options.fid;
        if(options.excludedFid) this.excludedFid = options.excludedFid;
        if(options.onlyTitle) this.onlyTitle = options.onlyTitle;
      } catch(err) {}
    }
    if(NKC.modules.SubscribeTypes) {
      window.SubscribeTypes = new NKC.modules.SubscribeTypes();
    }
  }
});

window.ResourceInfo = undefined;

$(function() {
  window.ResourceInfo = new NKC.modules.ResourceInfo();
});

function showResource(lid) {
  ResourceInfo.open({lid: lid})
}

Object.assign(window, {
  initComplexOptions,
  app,
  showResource,
});

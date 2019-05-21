var app = new Vue({
  el: "#app",
  data: {
    selectedForums: [],
    author: "",
    digest: false,
    timeStart: {
      year: 2000,
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
  },
  computed: {
    timeStartDay: function() {
      return getDayCountByYearMonth(this.timeStart.year, this.timeStart.month);
    },
    timeEndDay: function() {
      return getDayCountByYearMonth(this.timeEnd.year, this.timeEnd.month);
    },
    options: function() {
      var fid = [];
      for(var i = 0; i < this.selectedForums.length; i++) {
        fid.push(this.selectedForums[i].fid);
      }
      var o = {
        fid: fid,
        timeStart: this.timeStart,
        timeEnd: this.timeEnd,
        sort: this.sort,
        author: this.author,
        digest: this.digest,
        sortType: this.sortType,
        relation: this.relation
      };
      return this.strToBase64(JSON.stringify(o));
    }
  },
  methods: {
    strToBase64: function(str) {
      return window.btoa(encodeURIComponent(str));
    },
    base64ToStr: function(base64) {
      return decodeURIComponent(window.atob(base64))
    },
    addForum: function(data) {
      for(var i = 0; i < this.selectedForums.length; i++) {
        if(this.selectedForums[i].fid === data.fid) return;
      }
      this.selectedForums.push(data);
    },
    selectForum: function() {
      vueSelectForum.app.show();
    },
    removeForum: function(f) {
      var index = this.selectedForums.indexOf(f);
      this.selectedForums.splice(index, 1);
    },
    clickNav: function(type) {
      var t;
      if(type === "all") t = "";
      if(type === "user") t = "&t=user";
      if(type === "thread") t = "&t=thread";
      if(type === "post") t = "&t=post";
      window.location.href = "/search?c=" + this.strToBase64(this.c || "") + t +"&d=" + this.options;
    },
    // 搜索
    search: function() {
      if(!this.c) return screenTopWarning("请输入关键词");
      window.location.href = "/search?c=" + this.strToBase64(this.c || "") + (this.t?"&t="+this.t:"") +"&d=" + this.options;
    }
  },
  mounted: function() {
    vueSelectForum.init({func: this.addForum, canChooseParentForum: true});
    var data = getDataById("data");
    try{
      this.c = this.base64ToStr(data.c);
    } catch(err) {
      console.log(err);
      this.c = data.c;
    }

    this.t = data.t;
    this.selectedForums = data.selectedForums || [];
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
      } catch(err) {}
    }
  }
});
import ArticleSelectorDialog from "../../lib/vue/publicVue/selectorArticleOrThread/ArticleSelectorDialog";
var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  components:{
    'article-selector-dialog': ArticleSelectorDialog,
  },
  data: {
    column: data.column,
    user: data.user,
    selectedThreads: [],
    threads: [],
    chooseTid: [],
    succeed: false,
    showThreads: false,
    categories: data.categories,
    mainCategoriesId: [],
    minorCategoriesId: [],

    mainCategories: data.mainCategories,
    minorCategories: data.minorCategories,

    pid: "",
    paging: {
      page: 0
    },
    description: "",
    error: ""
  },
  mounted: function() {
    // this.getThreads();
  },
  computed: {
    selectedThreadsArr: function() {
      const selectedThreads = this.selectedThreads;
      const arr = [];
      for(let i = 0; i < selectedThreads.length; i++) {
        const t = selectedThreads[i];
        arr.push({
          source: selectedThreads[i].source,
          id: selectedThreads[i].tid
        });
      }
      return arr;
    }
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    // reset: function() {
    //   this.pid = "";
    //   this.getThreads();
    // },
    // search: function() {
    //   if(!this.pid) return;
    //   nkcAPI("/t?type=selfThreads&pid=" + this.pid + "&columnId=" + this.column._id, "GET")
    //     .then(function(data) {
    //       app.paging = "";
    //       for(var i = 0; i < data.threads.length; i++) {
    //         data.threads[i].showInfo = false;
    //       }
    //       app.threads = data.threads;
    //     })
    //     .catch(function(data) {
    //       sweetError(data);
    //     })
    // },
    // selectPage: function(type, num) {
    //   if(type === "null") return;
    //   this.getThreads(num);
    // },
    // getThreadById: function(tid) {
    //   var threads = this.threads;
    //   for(var i = 0; i < threads.length; i++) {
    //     if(threads[i].tid === tid) return threads[i];
    //   }
    // },
    remove: function(index) {
      this.selectedThreads.splice(index, 1);
    },
    // getThreads: function(page) {
    //   page = page || 0;
    //   this.chooseTid = [];
    //   nkcAPI("/t?type=selfThreads&columnId="+this.column._id+"&page=" + page, "GET")
    //     .then(function(data) {
    //       app.paging = data.paging;
    //       for(var i = 0; i < data.threads.length; i++) {
    //         data.threads[i].showInfo = false;
    //       }
    //       app.threads = data.threads;
    //     })
    //     .catch(function(data) {
    //       screenTopWarning(data);
    //     })
    // },
    // choose: function() {
    //   var selectedThreadsArr = this.selectedThreadsArr;
    //   var chooseTid = this.chooseTid;
    //   for(var i = 0; i < chooseTid.length; i++) {
    //     var tid = chooseTid[i];
    //     if(selectedThreadsArr.indexOf(tid) === -1) {
    //       var thread = this.getThreadById(tid);
    //       this.selectedThreads.push(thread);
    //     }
    //   }
    //   this.chooseTid = [];
    // },
    // showThreadsToggle: function() {
    //   this.showThreads = !this.showThreads;
    //   this.chooseTid = [];
    // },
    // showAllThreadsInfo: function() {
    //   var threads = this.threads;
    //   var threadCount = threads.length;
    //   var show = 0;
    //   for(var i = 0; i < threadCount; i++) {
    //     if(threads[i].showInfo) show++;
    //   }
    //   var showInfo = true;
    //   if(threadCount === show) {
    //     showInfo = false;
    //   }
    //   for(i = 0; i < threadCount; i++) {
    //     threads[i].showInfo = showInfo
    //   }
    // },
    // checkAll: function() {
    //   var threads = this.threads;
    //   if(this.chooseTid.length === threads.length) {
    //     this.chooseTid = [];
    //   } else {
    //     this.chooseTid = [];
    //     for(var i = 0 ; i < this.threads.length; i++) {
    //       this.chooseTid.push(this.threads[i].tid);
    //     }
    //   }
    // },
    submit: function() {
      this.error = "";
      let selectedThreadsArr = this.selectedThreadsArr;
      if(selectedThreadsArr.length === 0) return this.error = "请选择需要投稿的文章";
      if(!this.mainCategoriesId || this.mainCategoriesId.length === 0) return this.error = "请选择文章分类";
      // nkcAPI("/m/" + this.column._id + "/contribute", "POST", {
      //   threadsId: selectedThreadsArr,
      //   mainCategoriesId: this.mainCategoriesId,
      //   minorCategoriesId: this.minorCategoriesId,
      //   description: this.description
      // })
      //   .then(function() {
      //     app.succeed = true;
      //   })
      //   .catch(function(data) {
      //     app.error = data.error || data;
      //   })
    },
    chooseArticles: function(articles) {
      this.selectedThreads = articles;
    },
    openSelector: function (){
      this.$refs.articleSelectorDialog.open(this.chooseArticles)
    }
  }
});

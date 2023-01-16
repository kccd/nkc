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
  computed: {
    selectedThreadsArr: function() {
      const selectedThreads = this.selectedThreads;
      const threadsId = [];
      const articlesId = [];
      for(let i = 0; i < selectedThreads.length; i++) {
        if(selectedThreads[i].source === 'thread'){
          threadsId.push(selectedThreads[i].tid);
        }else {
          articlesId.push(selectedThreads[i].tid);
        }
      }
      return {
        threadsId,
        articlesId,
      };
    }
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    remove: function(index) {
      this.selectedThreads.splice(index, 1);
    },
    submit: function() {
      this.error = "";
      let selectedThreadsArr = this.selectedThreadsArr;
      if(this.selectedThreads.length === 0) return this.error = "请选择需要投稿的文章";
      if(!this.mainCategoriesId || this.mainCategoriesId.length === 0) return this.error = "请选择文章分类";
      nkcAPI("/m/" + this.column._id + "/contribute", "POST", {
        threadsId: selectedThreadsArr.threadsId,
        articlesId: selectedThreadsArr.articlesId,
        mainCategoriesId: this.mainCategoriesId,
        minorCategoriesId: this.minorCategoriesId,
        description: this.description
      })
        .then(function() {
          app.succeed = true;
        })
        .catch(function(data) {
          app.error = data.error || data;
        })
    },
    chooseArticles: function(articles) {
      this.selectedThreads = articles;
    },
    openSelector: function (){
      this.$refs.articleSelectorDialog.open(this.chooseArticles)
    }
  }
});

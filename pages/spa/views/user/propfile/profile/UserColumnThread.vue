<template lang="pug">
  .user-column-thread.p-t-1
      paging(ref="paging" :pages="pageButtons" @click-button="clickBtn")
      .loading(v-if="loading") 加载中~
      blank(v-else-if="threads && threads.length === 0")
      article-list(ref="articleList" :articles="threads")
      paging(ref="paging" :pages="pageButtons" @click-button="clickBtn")
</template>
<style lang="less" scoped>
.loading {
  margin-top: 5rem;
  margin-bottom: 5rem;
  text-align: center;
}
</style>
<script>
import {nkcAPI} from "../../../../../lib/js/netAPI";
import {timeFormat, fromNow, getUrl} from "../../../../../lib/js/tools";
import Paging from "../../../../../lib/vue/Paging";//改路径
import Blank from '../../../../components/Blank';
import ArticleList from "../../../../../lib/vue/article/ArticleList";
export default {
  data: () => ({
    uid: '',
    loading: false,
    threads: null,
    paging: null,
    t: null,
  }),
  components:{
    "paging": Paging,
    'blank': Blank,
    'article-list': ArticleList
  },
  mounted() {
    this.initData();
    this.getColumnThreads();
  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
  },
  methods: {
    timeFormat:timeFormat,
    fromNow:fromNow,
    getUrl: getUrl,
    //获取基本数据
    initData() {
     const {params, name} = this.$route;
     const {uid} = params;
     this.t = name;
     this.uid = uid;
    },
    //获取用户在专栏下发表的文章
    getColumnThreads(page) {
      const self = this;
      self.loading = true;
      let url = `/u/${self.uid}/profile/columnData`;
      if(page) {
        if(url.indexOf('?') === -1) {
          url = url + `?page=${page}`;
        } else {
          url = url + `page=${page}`;
        }
      }
     nkcAPI(url, "GET")
     .then(res => {
        self.threads = res.threads;
        self.paging = res.paging;
     })
     .catch(err => {
       sweetError(err);
     })
     self.loading = false;
    },
    //点击分页按钮
    clickBtn(num) {
      this.getColumnThreads(num);
    },
    //跳转到指定路由
    toRoute(name) {
      this.t = name;
      this.$router.push({
        name
      });
    },
  }
}
</script>

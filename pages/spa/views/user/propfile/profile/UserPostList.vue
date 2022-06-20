<template lang="pug">
  .user-post
    .paging-button
      a.button(@click="toRoute(postRouteName)" :class="t === 'post'?'active':''") 回复
      a.button(@click="toRoute(threadRouteName)" :class="t === 'thread'?'active':''") 文章
    .user-post-list
      paging(ref="paging" :pages="pageButtons" @click-button="clickButton")
      blank(v-if="(!posts || posts.length === 0) && !loading")
      .user-list-warning(v-if="loading") 加载中~
      post-list(ref="postList" :posts="posts" :permissions="permissions")
      paging(ref="paging" :pages="pageButtons" @click-button="clickButton")
</template>
<style lang="less" scoped>
@import "../../../../../publicModules/base";
.user-post {
  padding-top: 1rem;
  .user-list-warning {
    margin-top: 5rem;
    margin-bottom: 5rem;
    text-align: center;
    font-size: 1.2rem;
  }
  .checkbox {
    display: inline-block;
    min-width: 15px;
    min-height: 15px;
  }
  .checkbox label{
    min-height: 15px;
  }
}
</style>
<script>
import PostList from "../../../../../lib/vue/post/PostList";
import Review from "../../../../../lib/vue/publicVue/postReview/Review";
import Paging from "../../../../../lib/vue/Paging";
import ToColumn from "../../../../../lib/vue/publicVue/toColumn/ToColumn";
import Blank from '../../../../components/Blank';
import {nkcAPI} from "../../../../../lib/js/netAPI";
import {getState} from "../../../../../lib/js/state";
import { routerName } from "../../../../routes/user"
export default {
  data: () => ({
    postRouteName: routerName.post,
    threadRouteName: routerName.thread,
    posts: [],
    paging: {},
    loading: true,
    uid: null,
    routeName: null,
    managementBtn: false,
    permissions: {},
    checkboxPosts: [],
    t: '',
  }),
  components: {
    "blank": Blank,
    "review": Review,
    "paging": Paging,
    "to-column": ToColumn,
    'post-list': PostList
  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
  },
  watch: {
    '$route.name': function (newVal, oldVal){
      if(newVal) this.initData();
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    initData() {
      const {params, path, name} = this.$route;
      const {uid: stateUid} = getState();
      this.routeName = name;
      const {uid} = params;
      this.t = name;
      this.uid = uid || stateUid;
      this.getPostList(0);
    },
    //获取用户卡片信息
    getPostList(page) {
      this.loading = true;
      const {uid, routeName} = this;
      const self= this;
      let url = `/u/${uid}/profile/${routeName}Data`;
      if(page) {
        const index = url .indexOf('?');
        if(index === -1) {
          url = url + `?page=${page}`;
        } else {
          url = url + `&page=${page}`;
        }
      }
      nkcAPI(url, "GET")
        .then(res => {
          self.paging = res.paging;
          self.posts = res.posts;
          self.permissions = res.permissions;
        })
        .catch(err => {
          sweetError(err);
        })
      self.loading = false;
    },
    //刷新当前页面
    refreshPage() {
      const {page} = this.paging;
      this.getPostList(page);
    },
    //点击分页
    clickButton(num) {
      this.getPostList(num);
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

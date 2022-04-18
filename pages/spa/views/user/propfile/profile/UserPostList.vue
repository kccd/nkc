<template lang="pug">
  .user-post
    to-column(ref="toColumn")
    .user-list-warning(v-if="(!posts || posts.length === 0) && !loading") 用户貌似未发表过任何内容
    .user-post-list
      paging(ref="paging" :pages="pageButtons" @click-button="clickButton")
      .paging-button(v-if="routeName === 'thread'" )
        a.pointer.button.radius-left.radius-right(@click="managementPosts()") 管理
        span.post-management-button
          a.pointer.button(@click="selectAll()") 全选
          a.pointer.button.radius-right(@click="toColumn()") 推送到专栏
      .post-item(v-for="(post, index) in posts")
        hr(v-if="index")
        review(ref="review" :post="post" :permissions="permissions" @refresh="refreshPage" v-if="!post.reviewed")
        .thread-draft-info(v-else-if="post.toDraft") 退修中，仅自己可见，修改后对所有人可见
        .thread-disabled-info(v-else-if="post.disabled" ) 已屏蔽，仅自己可见
        .checkbox(v-if="managementBtn" )
          label
            input(type="checkbox" :value="post.pid" v-model="checkboxPosts")
        single-post(ref="singlePost" :post="post")
</template>
<style lang="less" scoped>
@import "../../../../../publicModules/base";
.user-post {
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
  .user-post-list {
    padding: 0 15px;
  }
}
</style>
<script>
import Review from "../../../../../lib/vue/publicVue/postReview/Review";
import SinglePost from "../../../../../lib/vue/publicVue/postModel/SinglePost";
import Paging from "../../../../../lib/vue/Paging";
import ToColumn from "../../../../../lib/vue/publicVue/toColumn/ToColumn";
import {nkcAPI} from "../../../../../lib/js/netAPI";
export default {
  data: () => ({
    posts: [],
    paging: {},
    loading: true,
    uid: null,
    routeName: null,
    managementBtn: false,
    permissions: {},
    checkboxPosts: [],
  }),
  components: {
    "review": Review,
    "single-post": SinglePost,
    "paging": Paging,
    "to-column": ToColumn
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
      const {name, params} = this.$route;
      this.routeName = name;
      const {uid} = params;
      this.uid = uid;
      this.getPostList(0);
    },
    //获取用户卡片信息
    getPostList(page) {
      this.loading = true;
      const {uid, routeName} = this;
      const self= this;
      let url = `/u/${uid}/p/${routeName}`;
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
          self.t = res.t;
          self.paging = res.paging;
          self.posts = res.posts;
          self.permissions = res.permissions;
          this.loading = false;
        })
        .catch(err => {
          sweetError(err);
        })
    },
    //刷新当前页面
    refreshPage() {
      const {page} = this.paging;
      this.getPostList(page);
    },
    //post管理开关
    managementPosts() {
      this.managementBtn = !this.managementBtn;
    },
    //全选
    selectAll() {
      const {posts, checkboxPosts} = this;
      const postIds = [];
      for(const post of posts) {
        postIds.push(post.pid);
      }
      if(checkboxPosts.length === postIds.length) {
        this.checkboxPosts = [];
      } else {
        this.checkboxPosts = postIds;
      }
    },
    //推送到专栏
    toColumn() {
      const self = this;
      this.$refs.toColumn.open(function (data){
        const categoriesId = data.categoriesId;
        const columnId = data.columnId;
        nkcAPI('/m/' + columnId + '/post', 'POST', {
          categoriesId,
          type: 'addToColumnsId',
          postsId: self.checkboxPosts,
        })
          .then(() => {
            sweetSuccess("操作成功");
            self.checkboxPosts = [];
            self.$refs.toColumn.close();
          })
          .catch(err => {
            sweetError(err);
          })
      }, {
        selectMul :true,
      } );
    },
    //点击分页
    clickButton(num) {
      this.getPostList(num);
    }
  }
}
</script>

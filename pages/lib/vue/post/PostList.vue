<template lang="pug">
  .post-list(v-if="posts.length !== 0")
    to-column(ref="toColumn")
    .paging-button(v-if="permissions.type === 'thread'")
      a.pointer.button.radius-left.radius-right(@click="managementPosts()") 管理
      span.post-management-button
        a.pointer.button(@click="selectAll()" v-if="managementBtn") 全选
        a.pointer.button.radius-right(@click="toColumn()" v-if="managementBtn") 推送到专栏
    .post-item(v-for="(post, index) in posts")
      hr(v-if="index")
      review(ref="review" :post="post" :permissions="permissions" @refresh="refreshPage" v-if="!post.reviewed")
      .thread-draft-info(v-else-if="post.toDraft") 退修中，仅自己可见，修改后对所有人可见
        .reason(v-if="post.reviewReason") 理由: {{post.reviewReason}}
      .thread-disabled-info(v-else-if="post.disabled") 已屏蔽，仅自己可见
        .reason(v-if="post.reviewReason") 理由: {{post.reviewReason}}
      .checkbox(v-if="managementBtn" )
        label
          input(type="checkbox" :value="post.pid" v-model="checkboxPosts")
      single-post(ref="singlePost" :post="post")
</template>
<style lang="less" scoped>
@import "../../../publicModules/base";
.post-list {
  .post-list-warning {
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
import Review from "../publicVue/postReview/Review";
import Paging from "../Paging";
import ToColumn from "../publicVue/toColumn/ToColumn";
import Blank from "../../../spa/components/Blank";
import {nkcAPI} from "../../js/netAPI";
import SinglePost from "../publicVue/postModel/SinglePost";
export default {
  props: ['posts', 'permissions'],
  data: () => ({
    managementBtn: false,
    checkboxPosts: [],
  }),
  components: {
    paging: Paging,
    review: Review,
    blank: Blank,
    'to-column': ToColumn,
    'single-post': SinglePost
  },
  mounted() {
  },
  methods: {
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
        const mainCategoriesId = data.mainCategoriesId;
        const minorCategoriesId = data.minorCategoriesId;
        const columnId = data.columnId;
        nkcAPI('/m/' + columnId + '/post', 'POST', {
          type: 'addToColumn',
          postsId: self.checkboxPosts,
          mainCategoriesId: mainCategoriesId,
          minorCategoriesId: minorCategoriesId,
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
    },
  }
}
</script>

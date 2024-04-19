<template lang="pug">
  div
    .column-posts-post(v-for="(columnPost, index) in articles" :key="index")
      .thread-disabled-info(v-if="columnPost.type === 'thread' && columnPost.thread.disabled") 文章已被封禁
      .thread-draft-info(v-if="columnPost.type === 'thread' && columnPost.thread.recycleMark") 文章已被退修
      .thread-review-info(v-if="columnPost.type === 'thread' && !columnPost.thread.reviewed") 文章未审核
      .thread-review-info(v-if="columnPost.type === 'article' && columnPost.article.status === 'unknown'") 文章未审核
      .thread-disabled-info(v-if="columnPost.type === 'article' && columnPost.article.status === 'disabled'") 文章已被封禁
      .thread-draft-info(v-if="columnPost.type === 'article' && columnPost.article.status === 'faulty'") 文章已被退修
      .thread-deleted-info(v-if="columnPost.type === 'article' && columnPost.article.status === 'deleted'") 文章已被删除
      .column-post-body(:class="{ 'cover': (columnPost.thread && columnPost.thread.firstPost.cover) || (columnPost.article && columnPost.article.document.cover)}")
        .column-post-cover
          div(v-if="columnPost.thread && columnPost.thread.firstPost.cover" :style="`background-image: url(${columnPost.thread.firstPost.coverUrl})`")
          div(v-if="columnPost.article && columnPost.article.document.cover" :style="`background-image: url(${columnPost.article.document.coverUrl})`")
        .column-post-abstract
          .column-post-content.post(v-if="columnPost.type === 'post'")
            a.column-thread-author(v-if="!columnPost.post.anonymous" :href="`/u/${columnPost.post.uid}`" target='_blank'
              data-global-mouseover='showUserPanel'
              data-global-mouseout='hideUserPanel'
              :data-global-data = "objToStr({uid: columnPost.post.uid})"
              )
              span {{columnPost.post.user.username}}
            span.anonymous-name(v-else) {{anonymousInfo.username}}
            | ：
            span {{columnPost.post.c}}
          .column-post-title
            a(v-if="columnPost.post && columnPost.post.url" :href="columnPost.post.url") {{columnPost.thread.firstPost.t}}
            a(v-if="columnPost.article" :href="columnPost.article.url") {{columnPost.article.document.title}}
          //-if type === "thread"
          .column-post-content(v-if="columnPost.type === 'thread'") {{ columnPost.post.c }} 
          //-if type === "article"
          .column-post-content(v-if="columnPost.type === 'article'") {{columnPost.article.document.content}}
          .column-post-info
            a(v-if="columnPost.type === 'thread' && !columnPost.thread.firstPost.anonymous" :href="`/u/${columnPost.thread.firstPost.uid}`" target='_blank'
              data-global-mouseover='showUserPanel'
              data-global-mouseout='hideUserPanel'
              :data-global-data="objToStr({uid: columnPost.thread.firstPost.uid})"
            ).column-post-author
              img(:src="columnPost.thread.firstPost.user.avatarUrl")
              span(style='margin-right:0.32rem;') {{columnPost.thread.firstPost.user.username}}
            span.column-post-author(v-if="columnPost.type === 'thread' && columnPost.thread.firstPost.anonymous")
              img(:src="anonymousInfo.avatar")
              span(style='margin-right:0.32rem;').anonymous-name {{anonymousInfo.username}}
            //-else if type === 'article'
            a(v-if="columnPost.type === 'article'" :href="`/u/${columnPost.article.user.uid}`" target='_blank'
              data-global-mouseover='showUserPanel'
              data-global-mouseout='hideUserPanel'
              :data-global-data="objToStr({uid: columnPost.article.user.uid})"
            ).column-post-author
              img(:src="columnPost.article.user.avatarUrl")
              span(style='margin-right:0.32rem;') {{columnPost.article.user.username}}
            .column-post-time
              span.m-r-05 
                from-now(:time="columnPost.toc")
              //-if data.column && from === "contribute"
              span(v-if="column && columnPost.from === 'contribute'") 来自投稿
              //-else if type === 'thread' || type === 'post'
              span(v-else-if="columnPost.type === 'thread' || columnPost.type === 'post'") 链接自论坛
              //-else if type === 'article' && article.source === 'zone'
              span(v-else-if="columnPost.type === 'article' && columnPost.article.source === 'zone'") 来自电波
            .column-post-forums
              //-if data.column
                -var category = "";
                for c in mainCategories
                  if !category || category.level > c.level
                    -category = c;
                if category
              a.column-post-forum.m-r-05(v-if="column" v-for="(c, $index) in [columnPost.mainCategories[0]]" :key="$index" :href="`/m/${columnPost.columnId}?c=${c._id}`") {{ c.name }} 
              //-else
              a.column-post-forum(v-else :href="`/m/${columnPost.columnId}`") {{column.name}}
      transition(name="fade")
        .settingButtons(v-if="isShow")
          //- .centering-wrapper
          button.btn.btn-xs.btn-default(v-if="column.topped.indexOf(columnPost._id) === -1" @click="movePost('columnTop', [ columnPost._id ])") 首页置顶
          button.btn.btn-xs.btn-default(v-else @click="movePost('unColumnTop', [ columnPost._id ])") 取消首页置顶
          button.btn.btn-xs.btn-default(v-if="category  && category._id !== 'all' && category.topped.indexOf(columnPost._id) === -1" @click="movePost('categoryTop', [ columnPost._id ])") 分类置顶
          button.btn.btn-xs.btn-default(v-if="category  && category._id !== 'all' && category.topped.indexOf(columnPost._id) !== -1" @click="movePost('unCategoryTop', [ columnPost._id ])") 取消分类置顶
          button.btn.btn-xs.btn-default(v-if="!topped" @click="movePost('categoryUp', columnPost._id)") 上移
          button.btn.btn-xs.btn-default(v-if="!topped" @click="movePost('categoryDown', columnPost._id)") 下移
          button.btn.btn-xs.btn-default(v-if="!topped" @click="movePost('categoryToTop', [ columnPost._id ])") 上移到最新
          button.btn.btn-xs.btn-default(v-if="!topped" @click="movePost('categoryToBottom', [ columnPost._id ])") 下移到最老
          button.btn.btn-xs.btn-success(@click="move([ columnPost._id ], columnPost.cid, columnPost.mcid)") 移动
          button.btn.btn-xs.btn-danger(@click="remove([ columnPost._id ])")  撤稿
          button.btn.btn-default.btn-xs(onclick='editColumnPosts(false)') 退出管理
      //- paging(ref="paging" :pages="pageButtons" @click-button="clickButton")
</template>

<style lang="less" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter {
  opacity: 0;
  transform: translateY(100%);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.column-posts-post {
  position: relative;
}

.settingButtons {
  width: 100%;
  position: absolute;
  bottom: 0rem;
  // padding: 0.3rem 0;
  text-align: center;
  // height: 2.5rem;
  background: rgba(168, 228, 292, 0.6);

  // .centering-wrapper{
  //   width: 100%;
  //   position: absolute;
  //   top: 50%;
  //   left: 50%;
  //   transform: translate(-50%, -50%);
  //   text-align: center;
  //   button{
  //   margin: 0 1rem;
  // }
  // }
  button {
    margin: 0.2rem 1rem;
  }

}
</style>

<script>
import { nkcAPI } from '../../js/netAPI';
import { objToStr } from '../../js/tools';
import { screenTopWarning } from '../../js/topAlert';
import FromNow from '../FromNow.vue';
export default {
  props: ['articles', 'topped', 'column', 'show', 'category', 'tid'],
  components: {
    'from-now': FromNow,
  },
  data: () => ({
    anonymousInfo: {
      username: '匿名用户',
      avatar: '/default/default_anonymous_user_avatar.jpg',
    },
  }),
  mounted() {
    // moduleToColumn.init();
    // if (!topped) {
    //   this.articles = [...articles].filter(item => !toppedId.includes(item._id));
    // }
  },
  computed: {
    isShow() {
      return !!this.show
    },
    // pageButtons() {
    //   return this.paging && this.paging.buttonValue ? this.paging.buttonValue : [];
    // },
  },
  destroyed() { },
  methods: {
    objToStr: objToStr,
    // fromNow: fromNow,
    //点击分页
    clickButton(num) {
      // 如果不进行spa请求数据可直接跳转页面
      // this.getList(this.type, this.tab, num);
    },
    movePost(type, id) {
      const self = this;
      if(!this.column){
        return;
      }
      if (["sortByPostTimeDES", "sortByPostTimeASC"].indexOf(type) !== -1) {
        if (!confirm("按发表时间排序后，原有排序将会丢失，确定要执行此操作？")) return;
      }
      const urlParams = new URLSearchParams(window.location.search);
      const c = urlParams.get('c') || '';
      let categoryId = '';
      let minorCategoriesId = '';
      const {category} = this;
      if (category) {
        categoryId = category._id
        if (c.split('-').length === 2 && !isNaN(Number(c.split('-')[1]))) {
          minorCategoriesId = Number(c.split('-')[1]);
        }
      }
      nkcAPI("/m/" + this.column._id + "/post", "POST", {
        type: type,
        postsId: id,
        categoryId,
        minorCategoriesId,
      })
        .then(function (data) {
          // 请求数据
          self.getPostList();
        })
        .catch(function (data) {
          screenTopWarning(data);
        })
    },
    remove(_id) {
      if (!confirm("确认要从专栏删除该文章？")) return;
      if(!this.column){
        return;
      }
      const self =  this;
      nkcAPI("/m/" + this.column._id + "/post", "POST", {
        type: "removeColumnPostById",
        postsId: _id
      })
        .then(function() {
          self.getPostList();
        })
        .catch(function(err) {
          screenTopWarning(err);
        })
    },
    move(_id, selectedMainCategoriesId, selectedMinorCategoriesId){
      if(!this.column){
        return;
      }
      const self = this;
      moduleToColumn.show(function(data) {
        const minorCategoriesId = data.minorCategoriesId;
        const mainCategoriesId = data.mainCategoriesId;
        const operationType = data.operationType;
        const categoryType = data.categoryType;
        nkcAPI("/m/" + self.column._id + "/post", "POST", {
          type: "moveById",
          postsId: _id,
          operationType,
          categoryType,
          mainCategoriesId: mainCategoriesId,
          minorCategoriesId: minorCategoriesId
        })
          .then(function() {
            self.getPostList();
            moduleToColumn.hide();
          })
          .catch(function(err) {
            screenTopWarning(err);
          })
      }, {
        selectMul: true,
        showOperationType: true,
        showCategoryType: true,
        selectedMainCategoriesId: selectedMainCategoriesId,
        selectedMinorCategoriesId: selectedMinorCategoriesId
      });
    },
    getPostList(){
      this.$emit('refresh');
    }
  },
};
</script>

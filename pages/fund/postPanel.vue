<template lang="pug">
  .fund-post-panel
    //.fund-post-panel-header 请选择申请人（或组员）曾经的技术文章
    .fund-post-panel-body
      .form-inline
        input.form-control(type="text" placeholder="文号，标题" v-model="content").m-r-05
        button.btn.btn-default(@click="search") 搜索
      .m-t-05.m-b-05
        button.btn.btn-default.btn-xs.m-r-05(@click="getSelfPosts") 我的文章
        button.btn.btn-default.btn-xs(@click="reset") 清空
      .fund-post-panel-list
        //.p-t-05.p-b-05.text-center(v-if="loading") 加载中...
        .p-t-05.p-b-05.text-center(v-if="posts.length === 0") {{loading? '加载中...': '空空如也~'}}
        div(v-else)
          .paging-button(v-if="paging.buttonValue && paging.buttonValue.length")
            span(v-for="(b, index) in paging.buttonValue")
              a(
                v-if="b.type === 'null'"
                :class="{'radius-left': index === 0, 'radius-right': index + 1 === paging.buttonValue.length}"
                ) ...
              a.active(
                v-else-if="b.type === 'active'"
                :class="{'radius-left': index === 0, 'radius-right': index + 1 === paging.buttonValue.length}"
                ) {{b.num + 1}}
              a(
                v-else
                :class="{'radius-left': index === 0, 'radius-right': index + 1 === paging.buttonValue.length}"
                @click="getPosts(b.num)"
                ) {{b.num + 1}}
          .fund-post-panel-post(
            :href="getUrl('thread', post.tid)"
            v-for="post in posts"
            @click="selectPost(post)"
            ) {{post.t}}


</template>

<style lang="less" scoped>
  @import "../publicModules/base";
  .fund-post-panel{
    padding: 0.5rem;
    background: #f0f0f0;
    .fund-post-panel-header{
      margin-bottom: 0.5rem;
    }
    .fund-post-panel-body{
      .fund-post-panel-list{
        .fund-post-panel-post{
          display: block;
          font-weight: 700;
          cursor: pointer;
          margin: 0.5rem 0;
        }
      }
    }
  }
</style>

<script>
  export default {
    props: ['aid'],
    data: () => ({
      type: 'search', // search, self
      content: '',
      loading: false,
      paging: {},
      posts: [],
    }),
    mounted() {

    },
    methods: {
      getUrl: NKC.methods.tools.getUrl,
      reset() {
        this.posts = [];
        this.paging = {};
      },
      search() {
        this.type = 'search';
        this.getPosts();
      },
      selectPost(post) {
        this.$emit('selectpost', post);
      },
      getPosts(page = 0)  {
        const {type, aid, content} = this;
        const self = this;
        this.loading = true;
        nkcAPI(
          `/fund/a/${aid}/settings/post?page=${page}&type=${type}&content=${content}`,
          'GET'
        )
        .then(data => {
          self.posts = data.posts;
          self.paging = data.paging;
          self.loading = false;
        })
        .catch(err => {
          self.loading = false;
          sweetError(err);
        })
      },
      getSelfPosts() {
        this.type = 'self';
        this.getPosts();
      }
    }
  };
</script>
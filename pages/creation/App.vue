<template lang="pug">
    .row.creation-center
      .col-xs-12.col-md-2
        .creation-center-nav
          .creation-center-name(@click="navToPage('home')") 创作中心
          .creation-center-nav-list
            .creation-center-nav-item(@click="navToPage('categories')") 资源管理
            .creation-center-nav-item(@click="navToPage('drafts')") 草稿箱
            .creation-center-nav-item(@click="navToPage('books')") 章回创作
      .col-xs-12.col-md-10
        transition(:name="transitionName")
          router-view
</template>
<script>
  export default {
    data: () => ({
      transitionName: 'fade'
    }),
    watch: {
      $route (to, from) {
        const toDepth = to.path.split('/').length
        const fromDepth = from.path.split('/').length
        this.transitionName = toDepth < fromDepth ? 'fade' : 'fade'
      }
    },
    methods: {
      navToPage(page) {
        this.$router.push({name: page});
      }
    }
  }
</script>
<style lang="less" scoped>
  @import '../publicModules/base';

  .creation-center{
    .creation-center-nav{
      // 创作中心名称高度
      @creationCenterNameHeight: 4rem;
      // 导航列表单个高度
      @navListItem: 3rem;
      .creation-center-name{
        height: @creationCenterNameHeight;
        line-height: @creationCenterNameHeight;
        background: @accent;
        font-size: 2rem;
        color: #fff;
        font-style: oblique;
        text-align: center;
        margin-bottom: 1rem;
        cursor: pointer;
        user-select: none;
      }
      .creation-center-nav-list{
        user-select: none;
        .creation-center-nav-item{
          height: @navListItem;
          line-height: @navListItem;
          text-align: center;
          font-size: 1.25rem;
          background-color: @gray;
          cursor: pointer;
          opacity: 1;
          transition: opacity 200ms;
          margin-bottom: 0.5rem;
          &:hover{
            opacity: 0.7;
          }
        }
      }
    }
  }
</style>

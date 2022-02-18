<template lang="pug">
  .creation-center
    .creation-nav-container
      .creation-center-nav
        .creation-center-name(@click="navToPage('home')") 创作中心
        .creation-center-nav-list
          .creation-center-nav-item(@click="navToPage('categories')")
            .fa.fa-image
            span 媒体管理
            //.fa.fa-angle-right.right
          .creation-center-nav-item(@click="navToPage('drafts')")
            .fa.fa-file-text-o
            span 图文素材
            //.fa.fa-angle-right.right
          .creation-center-nav-item(@click="navToPage('books')")
            .fa.fa-article
            span 内容创作
            //.fa.fa-angle-right.right
          .creation-center-nav-item(@click="navToPage('books')")
            .fa.fa-book
            span 专题创作
            //.fa.fa-angle-right.right
          .creation-center-nav-item(@click="navToPage('books')")
            .fa.fa-book
            span 内容管理
            //.fa.fa-angle-right.right
    .creation-content-container
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
  @leftNavWidth: 16rem;
  @paddingTop: 4rem;
  .creation-nav-container{
    position: fixed;
    background-color: #fff;
    height: 100%;
    top: 0;
    padding-top: @paddingTop + 1rem;
    left: 0;
    width: @leftNavWidth;
    border-right: 1px solid #ddd;
  }
  .creation-content-container{
  }
  .creation-center{
    padding-left: @leftNavWidth;
    .creation-center-nav{
      // 创作中心名称高度
      @creationCenterNameHeight: 4rem;
      // 导航列表单个高度
      @navListItem: 3rem;
      @navListItemIconLeft: 2.8rem;
      @navListItemPaddingLeft: @navListItemIconLeft + 3rem;
      .creation-center-name{
        height: @creationCenterNameHeight;
        line-height: @creationCenterNameHeight;
        //background: @accent;
        font-size: 2rem;
        font-weight: 700;
        color: @accent;
        //font-style: oblique;
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
          font-size: 1.25rem;
          //background-color: @gray;
          cursor: pointer;
          opacity: 1;
          transition: opacity 200ms;
          margin-bottom: 0.5rem;
          position: relative;
          padding-left: @navListItemPaddingLeft;
          padding-right: @navListItem;
          .hideText(@line: 1);
          .fa{
            position: absolute;
            top: 0;
            left: @navListItemIconLeft;
            height: @navListItem;
            width: @navListItem;
            text-align: center;
            line-height: @navListItem;
            &.right{
              left: auto;
              right: 0;
            }
          }
          &:hover{
            opacity: 0.7;
          }
        }
      }
    }
  }
</style>

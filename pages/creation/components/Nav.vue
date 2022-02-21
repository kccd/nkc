<template lang="pug">
  .creation-nav
    .creation-nav-header 创作中心
    .creation-nav-item(v-for="item in list")
      .item(@click="selectItem(item)")
        .icon.left-icon
          .fa(:class="item.icon")
        .icon.right-icon
          .fa(
            :class="item.hidden?'fa-angle-down': 'fa-angle-up'"
            v-if="item.child && item.child.length > 0"
            )
        .title {{item.title}}
      .children(v-if="!item.hidden && item.child && item.child.length > 0")
        .item(
          v-for="childItem in item.child"
          @click="selectItem(childItem)"
          )
          .title {{childItem.title}}
</template>

<style scoped lang="less">
  @import '../../publicModules/base';
  .creation-nav{
    .creation-nav-header{
      @headerHeight: 4rem;
      height: @headerHeight;
      line-height: @headerHeight;
      font-size: 2rem;
      font-weight: 700;
      color: @accent;
      text-align: center;
      margin-bottom: 1rem;
      cursor: pointer;
      user-select: none;
    }
    .item{
      margin: 0 2rem 0 2rem;
      @itemHeight: 3rem;
      height: @itemHeight;
      line-height: @itemHeight;
      text-align: center;
      position: relative;
      font-size: 1.25rem;
      cursor: pointer;
      user-select: none;
      .icon{
        color: #555;
        height: @itemHeight;
        width: @itemHeight;
        line-height: @itemHeight;
        text-align: center;
        position: absolute;
        top: 0;
        &.left-icon{
          left: 0;
        }
        &.right-icon{
          right: 0;
        }
      }
      .title{

      }
    }
  }
</style>

<script>
  export default {
    data: () => ({
      list: [
        {
          type: 'categories',
          title: '媒体管理',
          icon: 'fa-image'
        },
        {
          type: 'drafts',
          title: '草稿管理',
          icon: 'fa-file-text-o'
        },
        {
          type: 'creatContent',
          title: '内容创作',
          icon: 'fa-file-text-o',
          hidden: false,
          child: [
            {
              type: 'aloneArticleEditor',
              title: '独立文章'
            },
            {
              type: 'columnArticleEditor',
              title: '专栏文章'
            }
          ]
        },
        {
          type: 'manageContent',
          title: '内容管理',
          icon: 'fa-file-text-o',
          hidden: false,
          child: [
            {
              type: 'manageArticle',
              title: '文章管理'
            },
            {
              type: 'manageComment',
              title: '评论管理'
            }
          ]
        },
        {
          type: 'books',
          title: '专题制作',
          icon: 'fa-book',
        }
      ]
    }),
    methods: {
      selectItem(item) {
        if(item.child && item.child.length > 0) {
          item.hidden = !item.hidden;
        } else {
          this.$emit('select', item.type);
        }
      }
    }
  }
</script>


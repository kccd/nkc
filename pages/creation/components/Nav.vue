<template lang="pug">
  .creation-nav
    .creation-nav-header 创作中心
    .creation-nav-item(v-for="item in list")
      .item(
        @click="selectItem(item)"
        :class="item.type === selected? 'active':''"
        )
        .icon.left-icon
          .fa(:class="item.icon")
        .icon.right-icon
          .fa(
            :class="item.hidden?'fa-angle-down': 'fa-angle-up'"
            v-if="item.children && item.children.length > 0"
            )
        .title {{item.title}}
      .childrenren(v-if="!item.hidden && item.children && item.children.length > 0")
        .item(
          v-for="childrenItem in item.children"
          @click="selectItem(childrenItem)"
          :class="childrenItem.type === selected? 'active':''"
          )
          .title {{childrenItem.title}}
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
      &:hover{
        color: @primary;
      }
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
      &.active{
        .title{
          color: @primary;
        }
      }
    }
  }
</style>

<script>
  export default {
    data: () => ({
      selected: 'creation',
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
          children: [
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
          children: [
            {
              type: 'articles',
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
        },
        {
          type: 'community',
          title: '社区内容',
          icon: 'fa-book',
          hidden: false,
          children: [
            {
              type: 'communityThreads',
              title: '我的文章'
            },
            {
              type: 'communityPosts',
              title: '我的回复'
            },
            {
              type: 'communityDrafts',
              title: '我的草稿'
            },
            {
              type: 'communityNotes',
              title: '我的笔记'
            }
          ]
        }
      ]
    }),
    watch: {
      $route: 'setNavActive'
    },
    mounted() {
      this.setNavActive()
    },
    methods: {
      setNavActive() {
        this.selected = this.$route.name;
      },
      selectItem(item) {
        if(item.children && item.children.length > 0) {
          item.hidden = !item.hidden;
        } else {
          this.$emit('select', item.type);
        }
      }
    }
  }
</script>


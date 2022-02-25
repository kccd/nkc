<template lang="pug">
  .creation-nav
    .creation-nav-header 创作中心
    .creation-nav-item(v-for="item in list")
      .item(
        @click="selectItem(item)"
        :class="selected.includes(item.type)? 'active':''"
        )
        .icon.left-icon
          .fa(:class="item.icon")
        .icon.right-icon
          .fa(
            :class="item.hidden?'fa-angle-down': 'fa-angle-up'"
            v-if="item.children && item.children.length > 0"
            )
        .title {{item.title}}
      .children(v-if="!item.hidden && item.children && item.children.length > 0")
        .item(
          v-for="childrenItem in item.children"
          @click="selectItem(childrenItem)"
          :class="selected.includes(childrenItem.type)? 'active':''"
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
      margin: 0 3rem 0 3rem;
      @itemHeight: 3rem;
      height: @itemHeight;
      line-height: @itemHeight;
      text-align: center;
      position: relative;
      font-size: 1.35rem;
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
    .children{
      .item{
        font-size: 1.2rem;
      }
    }
  }
</style>

<script>
  export default {
    data: () => ({
      selected: [],
      list: [
        {
          type: 'creatContent',
          title: '内容创作',
          icon: 'fa-pencil',
          hidden: false,
          children: [
            {
              type: 'zoneArticleEditor',
              title: '空间创作'
            },
            {
              type: 'columnArticleEditor',
              title: '专栏创作'
            },
            {
              type: 'communityThreadEditor',
              title: '社区创作'
            },
            {
              type: 'bookEditor',
              title: '专题制作',
            },
            {
              type: 'draftEditor',
              title: '片段创作'
            }
          ]
        },
        {
          type: 'manageContent',
          title: '内容管理',
          icon: 'fa-th-list',
          hidden: false,
          children: [
            {
              type: 'zone',
              title: '空间内容'
            },
            {
              type: 'column',
              title: '专栏内容'
            },
            {
              type: 'community',
              title: '社区内容'
            },
            {
              type: 'books',
              title: '专题内容'
            },
            {
              type: 'drafts',
              title: '片段内容'
            }
            /*{
              type: 'articles',
              title: '文章管理'
            },
            {
              type: 'manageComment',
              title: '评论管理'
            }*/
          ]
        },
        {
          type: 'categories',
          title: '媒体管理',
          icon: 'fa-image'
        },
        /*{
          type: 'drafts',
          title: '草稿管理',
          icon: 'fa-file-text-o'
        }*/
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
        const name = [];
        for(const m of this.$route.matched) {
          name.push(m.name);
        }
        this.selected = name;
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


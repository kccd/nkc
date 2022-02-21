<template lang="pug">
  .container-fluid.creation-articles
    .articles-nav
      .article-nav-item(
        v-for="item in navList"
        @click="selectNav(item)"
        :class="item.active? 'active': ''"
        ) {{item.title}}
    router-view
</template>

<style lang="less" scoped>
  @import "../../../publicModules/base";
  .creation-articles{
    .articles-nav{
      .article-nav-item{
        display: inline-block;
        margin: 0 1rem 0.5rem 0;
        font-size: 1.3rem;
        cursor: pointer;
        &.active, &:hover{
          color: @primary;
        }
      }
    }
  }
</style>

<script>
  export default {
    data: () => ({
      navList: [
        {
          title: '全部',
          type: 'articles',
          active: true
        },
        {
          title: '专栏',
          type: 'articlesColumn',
          active: false,
        }
      ]
    }),
    methods: {
      selectNav(nav) {
        const {type} = nav;
        console.log(`select nav:`, type);
        this.$router.replace({
          name: type,
        });
      }
    }
  }
</script>
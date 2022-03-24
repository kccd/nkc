<template lang="pug">
  .container-fluid.creation-articles
    .articles-nav
      .article-nav-item(
        v-for="item in navList"
        @click="selectNav(item)"
        :class="item.type === selectedNavType? 'active': ''"
        ) {{item.title}}
    router-view
</template>

<style lang="less" scoped>
  @import "../../../../publicModules/base";
  .creation-articles{
    .articles-nav{
      margin-bottom: 1rem;
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
  import ArticlesList from '../../../components/ArticlesList';
  export default {
    components: {
      'articles-list': ArticlesList
    },
    data: () => ({
      selectedNavType: 'articles',
      navList: [
        {
          title: '全部',
          type: 'articles'
        },
        {
          title: '专栏文章',
          type: 'articlesColumn'
        }
      ]
    }),
    watch: {
      $route: 'setActiveNav'
    },
    mounted() {
      this.setActiveNav();
    },
    methods: {
      setActiveNav() {
        this.selectedNavType = this.$route.name;
      },
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

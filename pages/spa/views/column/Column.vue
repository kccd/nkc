<template lang="pug">
  .standard-not-centered.column
    hor-nav(:list="navList")
    router-view
</template>

<script>
  import HorNav from '../../components/HorNav';
  export default {
    components: {
      'hor-nav': HorNav
    },
    data: () => ({
      navList: [
        {
          type: 'columnArticle',
          title: '文章'
        },
        {
          type: 'columnDraft',
          title: '草稿'
        }
      ]
    }),
    watch: {
      $route() {
        this.redirect();
      }
    },
    mounted() {
      this.redirect();
    },
    methods: {
      //路由重定向
      redirect() {
        if(this.$route.name === 'column') {
          this.$router.replace({
            name: 'columnArticle'
          });
        }
      }
    }
  }
</script>

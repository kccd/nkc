<template lang="pug">
  .standard-not-centered.column
    hor-nav(:list="navList")
    router-view
</template>

<script>
  import HorNav from '../../../components/HorNav';
  import { routesName } from '../../../routes/creation'
  export default {
    components: {
      'hor-nav': HorNav
    },
    data: () => ({
      navList: [
        {
          type: routesName.creationColumnArticle,
          title: '文章'
        },
        {
          type: routesName.creationColumnDraft,
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
        if(this.$route.name === 'creationColumn') {
          this.$router.replace({
            name: routesName.creationColumnArticle
          });
        }
      }
    }
  }
</script>

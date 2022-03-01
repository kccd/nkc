<template lang="pug">
  .zone-article-editor
    hor-nav(:list="navList")
    router-view
</template>

<script>
  import HorNav from '../../../components/HorNav';
  export default {
    components: {
      'hor-nav': HorNav
    },
    data: () => ({
      navList: [
        {
          type: 'zoneMomentEditor',
          title: '发表动态'
        },
        {
          type: 'zoneArticleEditor',
          title: '发表文章'
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
      redirect() {
        if(this.$route.name === 'zoneEditor') {
          this.$router.replace({
            name: 'zoneMomentEditor'
          });
        }
      }
    }
  }
</script>

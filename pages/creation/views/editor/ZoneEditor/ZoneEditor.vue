<template lang="pug">
  .zone-article-editor.standard-max-container
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
          title: '动态创作'
        },
        {
          type: 'zoneArticleEditor',
          title: '文章创作'
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

<template lang="pug">
  .zone-article-editor
    .standard-fluid-max-container
      hor-nav(:list="navList")
    router-view
</template>

<script>
  import HorNav from '../../../../components/HorNav';
  import { routesName } from '../../../../routes/creation'
  export default {
    components: {
      'hor-nav': HorNav
    },
    data: () => ({
      navList: [
        {
          type: routesName.creationZoneMomentEditor,
          title: '动态创作'
        },
        {
          type: routesName.creationZoneArticleEditor,
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
        if(this.$route.name === 'creationZoneEditor') {
          this.$router.replace({
            name: routesName.creationZoneMomentEditor
          });
        }
      }
    }
  }
</script>

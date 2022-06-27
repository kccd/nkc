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
          title: '发电文'
        },
        {
          type: routesName.creationZoneArticleEditor,
          title: '发长电文'
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

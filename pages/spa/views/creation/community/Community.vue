<template lang="pug">
  .standard-not-centered.community
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
          title: '文章',
          type: routesName.creationCommunityThread
        },
        {
          title: '回复',
          type: routesName.creationCommunityPost
        },
        {
          title: '草稿',
          type: routesName.creationCommunityDraft
        },
        {
          title: '笔记',
          type: routesName.creationCommunityNote
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
        if(this.$route.name === 'creationCommunity') {
          this.$router.replace({
            name: routesName.creationCommunityThread
          });
        }
      }
    }
  }
</script>

<template lang="pug">
  .standard-max-container.community
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
          title: '文章',
          type: 'communityThread'
        },
        {
          title: '回复',
          type: 'communityPost'
        },
        {
          title: '草稿',
          type: 'communityDraft'
        },
        {
          title: '笔记',
          type: 'communityNote'
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
        if(this.$route.name === 'community') {
          this.$router.replace({
            name: 'communityThread'
          });
        }
      }
    }
  }
</script>
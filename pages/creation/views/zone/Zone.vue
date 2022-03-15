<template lang="pug">
  .standard-not-centered.zone
    hor-nav(:list="navList" v-if="$route.name !== 'ZoneReviseEditor'" )
    router-view
</template>

<script>
import HorNav from "../../components/HorNav";
export default {
  data: () => ({
    navList: [
      {
        type: 'zoneMoment',
        title: '动态'
      },
      {
        type: 'zoneArticle',
        title: '文章'
      },
      {
        type: 'zoneDraft',
        title: '草稿'
      }
    ]
  }),
  components: {
    "hor-nav": HorNav
  },
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
      if(this.$route.name === 'zone') {
        this.$router.replace({
          name: 'zoneMoment'
        });
      }
    }
  }
}
</script>

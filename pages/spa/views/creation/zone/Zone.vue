<template lang="pug">
  .standard-not-centered.zone
    hor-nav(:list="navList" v-if="$route.name !== 'ZoneReviseEditor'" )
    router-view
</template>

<script>
import HorNav from "../../../components/HorNav";
import { routesName } from "../../../routes/creation.js"
export default {
  data: () => ({
    navList: [
      {
        type: routesName.creationZoneMoment,
        title: '动态'
      },
      {
        type: routesName.creationZoneArticle,
        title: '文章'
      },
      {
        type: routesName.creationZoneDraft,
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
      if(this.$route.name === 'creationZone') {
        this.$router.replace({
          name: routesName.creationZoneMoment
        });
      }
    }
  }
}
</script>

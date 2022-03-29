<template lang="pug">
  .account-url(v-if="navLink" v-for="navLink in navLinks")
    .account-name(v-if="navLink.name") {{navLink.name}}
    .account-lis
      a.acocunt-li(v-for="link in navLink.links" :href="link.url" :class="{'active': link.type===type}")
        .name {{link.name}}
          span {{link.count || ''}}
        .fa.fa-angle-right
</template>
<style lang="less">

</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";

export default {
  data: () => ({
    uid: NKC.configs.uid,
    navLinks: [],
  }),
  mounted() {
  },
  methods: {
    //获取用户个人主页链接
    getNavLinks() {
      nkcAPI(`/u/${this.uid}`, 'GET')
      .then(res => {
      })
      .catch(err => {
        sweetError(err);
      })
    }
  }

}
</script>

<template lang="pug">
  .forum-simple(v-for="forum in forums")
    a.forum-parent(:href="getUrl('forumHome', forum.fid)")

</template>

<script>
export default {
  props: ["forums"],
  data: () => ({
  }),
  components: {
  },
  mounted() {
    console.log(this.forums);
  },
  methods: {
    getUrl: nkcModule.tools.getUrl,
  }
}
</script>

<style lang="less" scoped>

</style>

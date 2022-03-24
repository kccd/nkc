<template lang="pug">
  div
    transition(:name="transitionName")
      router-view(v-if="isRouterAlive")
</template>
<script>
export default {
  data: () => ({
    transitionName: "fade",
    isRouterAlive: true,
  }),
  watch: {
    $route(to, from) {
      const toDepth = to.path.split("/").length;
      const fromDepth = from.path.split("/").length;
      this.transitionName = toDepth < fromDepth ? "fade" : "fade";
    },
  },
  methods: {
    reload() {
      this.isRouterAlive = false;
      this.$nextTick(() => (this.isRouterAlive = true));
    },
  },
};
</script>

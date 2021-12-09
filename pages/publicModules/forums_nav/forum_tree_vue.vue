<template lang="pug">
  .forums-container(v-if="forums")
    .forums-content(v-for="fc in forums")
      .m-b-1(v-if="fc.forums.length")
        .panel-header(:title="fc.description") {{fc.name}}
          .forum-box(v-if="1 || fc.displayStyle === 'simple'")
            SimpleForums(:forums="fc.forums")
          .forum-box(v-else)
            Forums(:forums="fc.forums")
</template>

<script>
import SimpleForums from "./renderSimpleForums"
import Forums from "./renderForums"
export default {
  props: ["forums"],
  data: () => ({
  }),
  components: {
    SimpleForums,
    Forums,
  },
  mounted() {
    console.log(this.forums);
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>

</style>

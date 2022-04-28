<template lang="pug">
  .forums-container(v-if="forums")
    .forums-content(v-for="fc in forums")
      .forums-box(v-if="fc.forums.length")
        .forums-header(:title="fc.description") {{fc.name}}
        simple-forums(:forums="fc.forums")
</template>

<script>
import SimpleForums from "../../../../publicModules/forums_nav/renderSimpleForums"
export default {
  props: ["forums"],
  data: () => ({
  }),
  components: {
    'simple-forums':SimpleForums,
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>
.forums-container{
  .forums-content{
    margin-bottom: 1rem;
    .forums-box{
      height: auto;
      .forums-header{
        font-size: 1.25rem;
        height: 3rem;
        color: #777;
        font-weight: 700;
        box-sizing: border-box;
        line-height: 3rem;
        position: relative;
      }
    }
  }
}
</style>

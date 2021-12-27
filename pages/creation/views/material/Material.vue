<template lang="pug">
  .row
    .col-xs-12.col-md-12
      .material-header-title
        span 我的素材
      material-box(ref="material")

</template>
<style lang="less" scoped>
.material-header-title {
  height: 5rem;
  span {
    font-size: 3rem;
  }
}
</style>
<script>
import MaterialBox from "./MaterialBox";
export default {
  data: function (){
    return {
    }
  },
  components: {
    "material-box": MaterialBox,
  },
  computed: {},
  methods: {}
}
</script>

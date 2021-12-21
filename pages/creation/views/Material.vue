<template lang="pug">
  .row
    .col-xs-12.col-md-12
      h2 我的素材
      material-box(ref="material")

</template>

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

<template lang="pug">

</template>
<script>
import 'viewerjs/dist/viewer.css'
import { component as Viewer } from "v-viewer"
export default {
  components: {
    Viewer
  },
  data() {
    return {
      options: {},
      images: []
    };
  },
  methods: {
    inited (viewer) {
      this.$viewer = viewer
    },
    open () {
      this.$viewer.show()
    }
  }
}
</script>
<template lang="pug">
  viewer.viewer(:images="images"
    @inited="inited"
    ref="viewer")
    template(#default="scope")
      img(v-for="src in scope.images" :src="src" :key="src" width="0")
</template>
<style lang="less">
  .viewer {
    width: 0;
    height: 0!important;
    img {
      width: 0;
    }
  }
</style>
<script>
import 'viewerjs/dist/viewer.css';
import { component as Viewer } from "v-viewer";
export default {
  components: {
    Viewer
  },
  data() {
    return {
      images: [
      ],
    };
  },
  methods: {
    inited (viewer) {
      this.$viewer = viewer
    },
    show (img) {
      this.images = img;
      this.$viewer.show()
    }
  }
}
</script>
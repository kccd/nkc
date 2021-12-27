<template lang="pug">
  viewer(ref="imageViewer" :images="images")
    img(v-for="src in images" :src="src" :key="src" width="300")
</template>
<style lang="less" scoped>
</style>
<script>
export default {
  data: function (){
    return {
      images: [],
      config: {
        button: false, // 顶部关闭按钮
        // navbar: true, // 底部图片缩略图 默认true
        title: false, // 图片标题
        toolbar: {
          // zoomIn: true,
          // zoomOut: true,
          // oneToOne: false,
          // reset: true,
          // prev: true,
          // play: {
          //   show: true,
          //   size: 'large'
          // },
          // next: true,
          // rotateLeft: true,
          // rotateRight: true,
          // flipHorizontal: false,
          // flipVertical: false
        },
        tooltip: true,
      }
    }
  },
  mounted() {
  },
  components: {
  },
  computed: {},
  methods: {
    show(img) {
      debugger
      this.list = img;
    }
  }
}
</script>

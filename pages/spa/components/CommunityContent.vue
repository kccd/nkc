<template>
  <!-- <div id='ifream-container'> -->
  <iframe
    id="inlineFrameExample"
    title="展示社区内容相关子项"
    importance="high"
    frameborder="0"
    scrolling="no"
    width="800"
    height="0"
    :src="iframeUrl"
  >
  </iframe>
  <!-- </div> -->
</template>
<script>
export default {
  props: {
    iframeUrl: {
      require: true,
      type: String,
    },
  },
  data() {
    return {};
  },
  created() {},
  mounted() {
    // this.hiddenIferam()
    this.$nextTick(() => {
      const iframe = document.querySelector("iframe");
      // iframe.style.height = 0 + "px";
      if (iframe.attachEvent) {
        iframe.attachEvent("onload", () => {
          iframe.onload = () => {
            var iDoc = iframe.contentDocument || iframe.contentWindow.document;
            var height = iDoc.body.scrollHeight || iDoc.body.clientHeight;
            if (type === "draft") {
              iframe.style.minHeight = "80vh";
              iframe.style.height = height + "px";
            } else {
              iframe.style.height = height + "px";
            }
            // this.showLoading(false);
            this.$emit("closeLoading");
          };
        });
      } else {
        const type = location.pathname.slice(-5);
        iframe.onload = () => {
          var iDoc = iframe.contentDocument || iframe.contentWindow.document;
          var height = iDoc.body.scrollHeight || iDoc.body.clientHeight;
          if (type === "draft") {
            iframe.style.minHeight = "80vh";
            iframe.style.height = height + "px";
          } else {
            iframe.style.height = height + "px";
          }

          this.$emit("closeLoading");
        };
      }
    });
  },
  methods: {
    // showLoading(status) {
    //   this.loadingShow = status;
    // },
  },
};
</script>

<style scoped>
/* #ifream-container{
  overflow: hidden;
} */
iframe {
  /* border: none; */
  width: 100%;
}
</style>
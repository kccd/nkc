<template lang="pug">
  canvas(style="$style.canvas" ref="canvas")
</template>

<style scoped module lang="less">
.canvas {
  height: 100%;
  width: 100%;
}
</style>

<script>
import { logger } from '../js/logger';
export default {
  data: () => ({}),
  props: ['text', 'width'],
  computed: {
    qrText() {
      return this.text || 'Unknown';
    },
  },
  mounted() {
    this.resetCanvas();
  },
  watch: {
    qrText() {
      this.resetCanvas();
    },
  },
  methods: {
    resetCanvas() {
      const canvas = this.$refs.canvas;
      window.QRCode.toCanvas(
        canvas,
        this.text || 'Unknown',
        {
          width: this.width || 125,
          color: {
            dark: '#333',
            light: '#f8f8f8',
          },
        },
        function (err) {
          if (err) return logger.error(err);
          logger.debug('QR success!');
        },
      );
    },
  },
};
</script>

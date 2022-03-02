<template>
  <div class="loading">
    <div class="loading-title">
      <i class="fa fa-spinner loading-icon" aria-hidden="true"></i>
      <p>拼命加载中...</p>
    </div>
  </div>
</template>
<script>
export default {
   methods: {
    // showLoading(status) {
    //   this.loadingShow = status;
    // },
  },
   data() {
    return {
    //   loadingShow: false,
    };
  },
}
</script>
<style scoped>
.loading {
  width: 100%;
  height: 100%;
  /* position: absolute; */
  /* top: 0; */
  /* left: 0; */
  /* background-color: #e0e2e51c; */
}
@keyframes rotate{
  0% {
  transform: rotate(0deg);
  }
  100% {
  transform: rotate(360deg);

  }
}
.loading-title{
  text-align: center;
  position: absolute;
  top: calc(100% - 53%);
  left: calc(100% - 53%);
}
.loading-title >p{
  font-weight: 600;
}
.loading-icon {
  /* bottom: 0; */
  /* right: 0; */
  font-size: 24px;
  animation: rotate 2.3s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
}
iframe {
  border: none;
  width: 100%;
}
.hidden {
  /* visibility:hidden */
  opacity: 0;
  /* display: none; */
}
.show {
  opacity: 1;
  /* display: block; */
  /* visibility: visible; */
}
</style>
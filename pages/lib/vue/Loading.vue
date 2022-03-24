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

}
</script>
<style scoped>
.loading {
  width: 100%;
  height: 100%;
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
}
.loading-title >p{
  font-weight: 600;
}
.loading-icon {
  font-size: 24px;
  animation: rotate 2.3s linear infinite;
}
</style>
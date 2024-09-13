<template>
  <div class="loading">
    <div class="fa fa-spinner fa-spin m-r-05" />
    <p>拼命加载中...</p>
  </div>
</template>
<script>

export default {
}
</script>
<style scoped>
.loading {
  user-select: none;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #555;
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
  animation: rotate 2.3s linear infinite;
}
</style>
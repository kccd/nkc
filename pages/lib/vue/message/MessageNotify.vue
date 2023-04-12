<template>
  <div></div>
</template>
<script lang="ts">
import { getSocket } from '../../js/socket.js'
export default {
  data: () =>({
    socket: null,
  }),
  mounted() {
    this.socket = getSocket();
  }

}
</script>
<style scoped lang="less"></style>

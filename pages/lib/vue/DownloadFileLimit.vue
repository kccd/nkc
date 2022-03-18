<template lang="pug">
  .download-file-limit(v-if="data")
    h5 当前账号的附件下载数量限制如下：
    table.table.table-bordered
      thead
        tr
          th 时段
          th 个数
      tbody
        tr(v-for='f in data')
          th {{f.startingTime}}点 - {{f.endTime}}点
          th {{f.fileCount}}


</template>

<style lang="less" scoped>

</style>

<script>
  export default {
    props: ['data'],
    data: () => ({

    })
  }
</script>
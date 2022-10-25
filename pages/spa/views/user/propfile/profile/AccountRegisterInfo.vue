<template lang="pug">
  .row(v-if="info")
    .col-xs-12 主体类型：{{info.subject}}
    .col-xs-12 所属领域：{{info.field}}
    .col-xs-12 认证方式：{{info.authType}}
    .col-xs-12 IP归属地：{{info.addr}}

</template>

<script>
export default {
  props: ['info'],
}
</script>

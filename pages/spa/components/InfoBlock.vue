<template lang="pug">
  .info-block(:class="info.bgClass")
    span.fa(:class="info.icon")
    slot

</template>

<style lang="less" scoped>
  .info-block{
    padding: 0.5rem 0.5rem;
    border: 1px solid #eee;
    span.fa{
      margin-right: 0.5rem;
      font-size: 1.3rem;
    }
  }
</style>

<script>
  export default {
    props: ['mode'],
    data: () => ({

    }),
    computed: {
      info() {
        const options = {
          info: {
            icon: 'fa-lightbulb-o',
            bgClass: 'bg-info text-info',
          },
          warning: {
            icon: 'fa-exclamation-circle',
            bgClass: 'bg-warning text-warning'
          },
          danger: {
            icon: 'fa-exclamation-circle',
            bgClass: 'bg-danger text-danger'
          }
        };
        return options[this.mode];
      }
    }
  }
</script>

<template lang="pug">
  span(
    data-type="nkcTimestamp"
    :data-time="timeNumber"
    data-time-type="fromNow"
    :title="timeString"
    ) {{fromNow(time)}}
</template>
<script>
  export default {
    props: ['time'],
    data: function() {
      return {
        timeString: this.timeFormat(new Date(this.time)),
        timeNumber: (new Date(this.time)).getTime(),
      }
    },
    methods: {
      fromNow: NKC.methods.tools.fromNow,
      timeFormat: NKC.methods.tools.timeFormat,
    }
  }
</script>
<template lang="pug">
  div
    h2 Team
</template>

<script>
  export default {
    data: () => ({
      team: null,
      teamId: null
    }),
    mounted() {
      this.teamId = this.$router.params.tid
    },
    getTeam() {
      const {teamId} = this;
    }
  }
</script>
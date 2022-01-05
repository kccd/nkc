<template lang="pug">
  div
    h2 我的团队
    v-btn(elevation="2" @click="nav") 新建团队
    div
      div(v-for="t in teams" @click="openTeam(t._id)")
        h4 {{t.name}}
        p {{t.description}}
</template>

<script>
  import {nkcAPI} from "../../../lib/js/netAPI";
  import {sweetError} from "../../../lib/js/sweetAlert";
  export default {
    data: () => ({
      teams: []
    }),
    mounted() {
      this.getTeams();
    },
    methods: {
      nav() {
        this.$router.push({
          name: 'teamCreator',
          params: {
            type: 'createTeam'
          }
        });
      },
      openTeam(tid) {
        this.$router.push({
          name: 'team',
          params: {
            tid
          }
        });
      },
      getTeams() {
        nkcAPI('/pim/teams', 'GET')
          .then(data => {
            this.teams = data.teams;
          })
          .catch(sweetError);
      }
    }
  }
</script>
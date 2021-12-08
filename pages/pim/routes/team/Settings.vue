<template lang="pug">
  div
    h3 {{pageName}}
    v-form(
      ref="form"
      v-model="valid"
      lazy-validation
      )
      v-text-field(
        v-model="team.name"
        :counter="30"
        :rules="nameRules"
        outlined
        label="团队名称"
        required
      )
      v-textarea(
        outlined
        name="input-7-4"
        label="团队介绍"
        :rules="descriptionRules"
        v-model="team.description"
      )
      v-btn(elevation="2" @click="submit") 提交

</template>

<script>
  import {nkcAPI} from '../../../lib/js/netAPI';
  import {sweetSuccess, sweetError} from "../../../lib/js/sweetAlert";

  export default {
    data: () => ({
      type: 'createTeam',
      teamId: null,
      team: {
        _id: null,
        uid: '',
        name: '',
        description: ''
      },
      nameRules: [
        v => !!v || '团队名称不能为空',
        v => (v && v.length <= 30) || '团队名称不能超过 30 个字',
      ],
      descriptionRules: [
        v => (v && v.length <= 500) || '团队名称不能超过 500 个字',
      ],
    }),
    computed: {
      pageName() {
        const {type} = this;
        return type === 'createTeam'? '新建团队': '修改团队信息';
      }
    },
    mounted() {
      if(
        this.$router &&
        this.$router.params
      ) {
        if(this.$router.params.type) {
          this.type = type;
        }
        const teamId = this.$router.params.tid;
        if(teamId) {
          this.teamId = teamId;
          // 编辑团队
          this.getTeamInfo();
        }
      }
    },
    methods: {
      getTeamInfo() {
        const {teamId} = this;
      },
      submit() {
        const {type, team} = this;
        if(type === 'createTeam') {
          nkcAPI(`/pim/teams`, 'POST', {
            team
          })
            .then(() => {
              sweetSuccess(`提交成功`);
            })
            .catch(sweetError);
        }
      }
    }
  }
</script>
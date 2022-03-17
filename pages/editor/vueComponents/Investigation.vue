<template lang="pug">
  //- data.createSurveyPermission && data.type === "newThread" || (data.type === "modifyThread" && data.post.surveyId)
  .investigation(v-if="data.createSurveyPermission && data.type === 'newThread' || (data.type === 'modifyThread' && data.post.surveyId)")
    .editor-header 调查
      button.btn.btn-xs(
        @click="disabledSurveyForm()"
        id="disabledSurveyButton"
        :class="{'btn-danger': !postSurvey.app.disabled , 'btn-success': postSurvey.app.disabled}"
      ) {{!postSurvey.app.disabled ? "取消" : "创建"}}
    //- include ../../publicModules/survey/edit
</template>

<script>
export default {
  data: () => ({
    postSurvey: null
  }),
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  created() {
    this.postSurvey = new NKC.modules.SurveyEdit();
    // console.log(this.postSurvey)
  },
  mounted() {
    this.$nextTick(() => {
      this.initPostSurvey();
    });
  },
  methods: {
    hideButton() {
      $("#disabledSurveyButton").hide();
    },
    initPostSurvey() {
      if (NKC.modules.SurveyEdit && $("#moduleSurveyEdit").length) {
        // window.PostSurvey = new NKC.modules.SurveyEdit();
        this.postSurvey .init({ surveyId: this.data?.post?.surveyId || "" });
        if (this.data.type !== "newThread") {
          this.hideButton();
        }
        if (this.data.post && this.data.post.surveyId) {
          this.disabledSurveyForm();
        }
      }
    },
    disabledSurveyForm() {
      this.postSurvey.app.disabled = !this.postSurvey.app.disabled;
      this.$forceUpdate()
    },
    getContent(){
      return {
        // 调查数据
      }
    },
  }
};
</script>

<style scope>
.btn-success {
  color: #fff;
  background-color: #5cb85c;
  border-color: #4cae4c;
}
.btn-success:focus,
.btn-success.focus {
  color: #fff;
  background-color: #449d44;
  border-color: #255625;
}
.btn-success:hover {
  color: #fff;
  background-color: #449d44;
  border-color: #398439;
}
.btn-success:active,
.btn-success.active,
.open > .dropdown-toggle.btn-success {
  color: #fff;
  background-color: #449d44;
  border-color: #398439;
}
.btn-success:active:hover,
.btn-success.active:hover,
.open > .dropdown-toggle.btn-success:hover,
.btn-success:active:focus,
.btn-success.active:focus,
.open > .dropdown-toggle.btn-success:focus,
.btn-success:active.focus,
.btn-success.active.focus,
.open > .dropdown-toggle.btn-success.focus {
  color: #fff;
  background-color: #398439;
  border-color: #255625;
}
.btn-success:active,
.btn-success.active,
.open > .dropdown-toggle.btn-success {
  background-image: none;
}
.btn-success.disabled:hover,
.btn-success[disabled]:hover,
fieldset[disabled] .btn-success:hover,
.btn-success.disabled:focus,
.btn-success[disabled]:focus,
fieldset[disabled] .btn-success:focus,
.btn-success.disabled.focus,
.btn-success[disabled].focus,
fieldset[disabled] .btn-success.focus {
  background-color: #5cb85c;
  border-color: #4cae4c;
}
.btn-success .badge {
  color: #5cb85c;
  background-color: #fff;
}
.btn-danger {
  color: #fff;
  background-color: #d9534f;
  border-color: #d43f3a;
}
.btn-danger:focus,
.btn-danger.focus {
  color: #fff;
  background-color: #c9302c;
  border-color: #761c19;
}
.btn-danger:hover {
  color: #fff;
  background-color: #c9302c;
  border-color: #ac2925;
}
.btn-danger:active,
.btn-danger.active,
.open > .dropdown-toggle.btn-danger {
  color: #fff;
  background-color: #c9302c;
  border-color: #ac2925;
}
.btn-danger:active:hover,
.btn-danger.active:hover,
.open > .dropdown-toggle.btn-danger:hover,
.btn-danger:active:focus,
.btn-danger.active:focus,
.open > .dropdown-toggle.btn-danger:focus,
.btn-danger:active.focus,
.btn-danger.active.focus,
.open > .dropdown-toggle.btn-danger.focus {
  color: #fff;
  background-color: #ac2925;
  border-color: #761c19;
}
.btn-danger:active,
.btn-danger.active,
.open > .dropdown-toggle.btn-danger {
  background-image: none;
}
.btn-danger.disabled:hover,
.btn-danger[disabled]:hover,
fieldset[disabled] .btn-danger:hover,
.btn-danger.disabled:focus,
.btn-danger[disabled]:focus,
fieldset[disabled] .btn-danger:focus,
.btn-danger.disabled.focus,
.btn-danger[disabled].focus,
fieldset[disabled] .btn-danger.focus {
  background-color: #d9534f;
  border-color: #d43f3a;
}
.btn-danger .badge {
  color: #d9534f;
  background-color: #fff;
}
.btn {
  vertical-align: top;
}
</style>

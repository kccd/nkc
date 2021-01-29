const data = NKC.methods.getDataById('data');
const fid = data.fid;
const wordGroupInfo = data.wordGroupInfo;
const useGroup = data.useGroup;
const allContentShouldReview = data.allContentShouldReview;
const roleGradeReview = data.roleGradeReview;
const app = new Vue({
  el: '#app',
  data: {
    roles: data.roles,
    grades: data.grades,
    keywordReview: {
      wordGroupInfo,
      selectedGroup: useGroup || [],
    },
    allContentShouldReview,
    roleGradeReview: {
      roles: roleGradeReview.roles || [],
      grades: roleGradeReview.grades || [],
      relationship: roleGradeReview.relationship || "or"
    }
  },
  methods: {
    submit() {
      const {
        keywordReview,
        allContentShouldReview,
        roleGradeReview
      } = this;
      return nkcAPI(`/f/${fid}/settings/review`, "PUT", {
        newUseWordGroup: keywordReview.selectedGroup,
        allContentShouldReview,
        roleGradeReview
      })
      .then(() => sweetAlert("保存成功"))
      .catch(sweetError);
    }
  }
})

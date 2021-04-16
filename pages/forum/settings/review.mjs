const data = NKC.methods.getDataById('data');
const fid = data.fid;
const wordGroupInfo = data.wordGroupInfo;
const keywordReviewPlanUseTo = data.keywordReviewPlanUseTo;
const useGroup = data.useGroup;
const reviewPlan = data.reviewPlan;
const roleGradeReview = data.roleGradeReview;
const app = new Vue({
  el: '#app',
  data: {
    roles: data.roles,
    grades: data.grades,
    keywordReview: {
      wordGroupInfo,
      keywordReviewPlanUseTo,
      selectedGroup: useGroup || [],
    },
    reviewPlan,
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
        reviewPlan,
        roleGradeReview
      } = this;
      return nkcAPI(`/f/${fid}/settings/review`, "PUT", {
        keywordReviewPlanUseTo: keywordReview.keywordReviewPlanUseTo,
        newUseWordGroup: keywordReview.selectedGroup,
        reviewPlan,
        roleGradeReview
      })
      .then(() => sweetAlert("保存成功"))
      .catch(sweetError);
    }
  }
})

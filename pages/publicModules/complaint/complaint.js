
/*
* 投诉
* @param {String} type 投诉类型 user: 用户, thread: 文章, post: 回复
* @param {String} id 投诉类型对应的ID
* @author pengxiguaa 2019-5-14
* */

var moduleComplaint = new Vue({
  el: "#moduleComplaint",
  data: {
    reasonType: "",
    reasonDescription: "",
    submitted: false,
    type: "",
    id: "",
    reasons: []
  },
  mounted: function() {
    var data = NKC.methods.strToObj(this.$refs.reasons.innerHTML);
    var reasons = [];
    for(var reason in data.reasons) {
      if(!data.reasons.hasOwnProperty(reason)) continue;
      reasons.push({
        type: reason,
        description: data.reasons[reason]
      })
    }
    this.reasons = reasons;
  },
  methods: {
    selectReason: function(r) {
      this.reasonType = r.type;
    },
    hide: function() {
      $("#moduleComplaint").hide();
      stopBodyScroll(false);
    },
    show: function() {
      closeDrawer();
      $("#moduleComplaint").show();
      this.submitted = false;
      this.reasonDescription = "";
      this.reasonType = "";
      stopBodyScroll(true);
    },
    open: function(type, id) {
      this.type = type;
      this.id = id;
      this.show();
    },
    submit: function() {
      nkcAPI("/complaint", "POST", {
        type: this.type,
        id: this.id,
        reasonType: this.reasonType,
        reasonDescription: this.reasonDescription
      })
        .then(function() {
          moduleComplaint.submitted = true;
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    }
  }
});
function complaint(type, id) {

}
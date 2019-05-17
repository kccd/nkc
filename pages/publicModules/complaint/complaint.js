
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
    reasons: [
      {
        type: "illegal",
        description: "违禁违法"
      },
      {
        type: "ad",
        description: "垃圾广告"
      },
      {
        type: "sexy",
        description: "低俗色情"
      },
      {
        type: "bloody",
        description: "血腥暴力"
      },
      {
        type: "abuse",
        description: "人身攻击"
      },
      {
        type: "other",
        description: "其他"
      }
    ]
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
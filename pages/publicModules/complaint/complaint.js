/*
 * 投诉
 * @param {String} type 投诉类型 user: 用户, thread: 文章, post: 回复
 * @param {String} id 投诉类型对应的ID
 * @author pengxiguaa 2019-5-14
 * */

const moduleComplaint = new Vue({
  el: "#moduleComplaint",
  data: {
    reasonTypeId: "",
    reasonDescription: "",
    submitted: false,
    type: "",
    id: "",
    reasons: []
  },
  mounted: function () {},
  methods: {
    getList: function () {
      const _this = this
      nkcAPI('/e/settings/complaintType', 'get', {})
        .then(function (data) {
          const reasons = [];
          for (const i in data.complaintTypes) {
            if (!data.complaintTypes.hasOwnProperty(i)) continue;
            reasons.push({
              _id: data.complaintTypes[i]._id,
              type: data.complaintTypes[i].type,
              disabled: data.complaintTypes[i].disabled,
              description: data.complaintTypes[i].description,
            })
          }
          _this.reasons = reasons;
        })
        .catch(function (data) {})
    },
    selectReason: function (r) {
      this.reasonTypeId = r._id;
    },
    hide: function () {
      $("#moduleComplaint").hide();
      stopBodyScroll(false);
    },
    show: function () {
      closeDrawer();
      $("#moduleComplaint").show();
      this.submitted = false;
      this.reasonDescription = "";
      this.reasonTypeId = "";
      stopBodyScroll(true);
    },
    open: function (type, id) {
      this.type = type;
      this.id = id;
      this.show();
      this.getList();
    },
    submit: function () {
      nkcAPI("/complaint", "POST", {
          type: this.type,
          id: this.id,
          reasonTypeId: this.reasonTypeId,
          reasonDescription: this.reasonDescription
        })
        .then(function () {
          moduleComplaint.submitted = true;
        })
        .catch(function (data) {
          screenTopWarning(data);
        })
    }
  }
});

function complaint(type, id) {

}

Object.assign(window, {
  moduleComplaint,
  complaint,
});
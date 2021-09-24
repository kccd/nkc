class ComplaintSelector extends NKC.modules.DraggablePanel {
  constructor() {
    const domId = `#moduleComplaintSelector`;
    super(domId);
    const self = this;
    self.dom = $(domId);
    self.app = new Vue({
      el: domId + 'App',
      data: {
        loading: true,
        reasonTypeId: "",
        reasonDescription: "",
        submitted: false,
        reasonType: "",
        type: "",
        id: "",
        reasons: []
      },
      computed: {
      },
      mounted() {
      },
      methods: {
        getUrl: NKC.methods.tools.getUrl,
        open(type, id) {
          this.submitted = false;
          this.reasonTypeId = "";
          this.reasonDescription = "";
          this.type = type;
          this.id = id;
          this.getList();
          self.showPanel();
          this.loading = false;
        },
        close() {
          self.hidePanel();
        },
        getList() {
          var _this=this
              nkcAPI('/complaint', 'get', {
          })
            .then(function(data) {
              var reasons = [];
              for(var i in data.complaintTypes) {
                if(!data.complaintTypes.hasOwnProperty(i)) continue;
                reasons.push({
                  _id:data.complaintTypes[i]._id,
                  type:data.complaintTypes[i].type,
                  disabled:data.complaintTypes[i].disabled,
                  description:data.complaintTypes[i].description,
                })
              }
              _this.reasons = reasons;
        })
            .catch(function(data) {
            })
        },
        selectReason(r) {
          this.reasonTypeId = r._id;
          this.reasonType = r.type;
        },
        hide() {
          $("#moduleComplaint").hide();
          stopBodyScroll(false);
        },
        show() {
          closeDrawer();
          $("#moduleComplaint").show();
          this.submitted = false;
          this.reasonDescription = "";
          this.reasonTypeId = "";
          stopBodyScroll(true);
        },
        // open: function(type, id) {
        //   this.type = type;
        //   this.id = id;
        //   this.show();
        //   this.getList();
        // },
        submit() {
          var _this = this;
          nkcAPI("/complaint", "POST", {
            type: this.type,
            id: this.id,
            reasonTypeId: this.reasonTypeId,
            reasonType: this.reasonType,
            reasonDescription: this.reasonDescription
          })
            .then(function() {
              _this.submitted = true;
            })
            .catch(function(data) {
              screenTopWarning(data);
            })
        }
      }
    })
  }
  open(type, id) {
    this.app.open(type, id);
  }
}
NKC.modules.ComplaintSelector = ComplaintSelector;

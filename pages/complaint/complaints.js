window.app = new Vue({
  el: "#app",
  data: {
    complaints: [],
    selectedComplaintsId: [],

  },
  mounted: function() {
    var data = NKC.methods.getDataById("data");
    for(var i = 0; i < data.complaints.length; i++) {
      data.complaints[i].open = false;
    }
    this.complaints = data.complaints;
  },
  methods: {
    format: NKC.methods.format,
    fromNow: NKC.methods.fromNow,
    save: function(c) {
      nkcAPI("/complaint/resolve", "POST", {
        result: c.result,
        informed: c.informed,
        _id: c._id
      })
        .then(function(data) {
          var complaint = data.complaints[0];
          c.resolved = complaint.resolved;
          c.result = complaint.result;
          c.handlerId = complaint.handlerId;
          c.handler = complaint.handler;
          c.resolveTime = complaint.resolveTime;
          c.informed = complaint.informed;
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    },
    selectAll: function() {
      var selected = [];
      for(var i = 0; i < this.complaints.length; i++) {
        if(this.complaints[i].resolved) continue;
        selected.push(this.complaints[i]._id);
      }
      if(this.selectedComplaintsId.length === selected.length) {
        this.selectedComplaintsId = [];
      } else {
        this.selectedComplaintsId = selected;
      }
    },
    saveAll: function() {
      var selectedComplaintsId = this.selectedComplaintsId;
      var complaints = [];
      for(var i = 0; i < this.complaints.length; i++) {
        var complaint = this.complaints[i];
        if(complaint.resolved) continue;
        if(selectedComplaintsId.indexOf(complaint._id) !== -1) {
          complaints.push({
            _id: complaint._id,
            informed: complaint.informed,
            result: complaint.result
          });
        }
      }
      nkcAPI("/complaint/resolve", "POST", {
        complaints: complaints
      })
        .then(function(data) {
          var complaints = data.complaints;
          for(var i = 0; i < complaints.length; i++) {
            var ci = complaints[i];
            for(var j = 0; j < app.complaints.length; j++) {
              var cj = app.complaints[j];
              if(ci._id === cj._id) {
                cj.handler = ci.handler;
                cj.resolved = true;
                cj.handlerId = ci.handlerId;
                cj.result = ci.result;
                cj.resolveTime = ci.resolveTime;
                cj.informed = ci.informed;
              }
            }
          }
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    }
  }
});

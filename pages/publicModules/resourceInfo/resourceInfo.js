NKC.modules.ResourceInfo = function() {
  var self = this;
  self.dom = $("#moduleResourceInfo").modal({
    show: false
  });
  self.app = new Vue({
    el: "#moduleResourceInfoApp",
    data: {
      type: "",
      loading: true,
      forums: [],
      resource: "",
      uid: NKC.configs.uid || "",
      modifyAllResource: false
    },
    methods: {
      getUrl: NKC.methods.tools.getUrl,
      visitUrl: NKC.methods.visitUrl,
      format: NKC.methods.format,
      getSize: NKC.methods.tools.getSize,
      removeResourceFromLibrary: removeResourceFromLibrary,
      getResource: function(rid) {
        self.app.type = "resource";
        nkcAPI("/r/" + rid + "/info", "GET")
          .then(function(data) {
            self.app.loading = false;
            self.app.resource = data.resource;
            self.app.forums = data.forums;
            self.app.modifyAllResource = !!data.modifyAllResource;
          })
          .catch(function(data) {
            sweetError(data);
          });
      },
      getLibrary: function(lid) {
        self.app.type = "library";
        nkcAPI("/library/" + lid + "?info=true", "GET")
          .then(function(data) {
            self.app.loading = false;
            self.app.resource = data.library;
          })
          .catch(function(data) {
            sweetError(data);
          })
      },
      open: function(options) {
        options = options || {};
        self.dom.modal("show");
        if(options.lid) {
          this.getLibrary(options.lid);
        } else if(options.rid) {
          this.getResource(options.rid);  
        }
        
      },
      close: function() {
        self.dom.modal("hide");
      }
    }
  });
  self.open = self.app.open;
  self.close = self.app.close;
};
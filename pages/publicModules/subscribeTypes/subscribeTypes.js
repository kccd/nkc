NKC.modules.SubscribeTypes = function() {
  var this_ = this;
  this_.dom = $("#moduleSubscribeTypes");
  this_.app = new Vue({
    el: "#moduleSubscribeTypesApp",
    data: {
      edit: false,
      fastAdd: false,
      uid: this_.dom.attr("data-uid"),
      loaded: false,
      types: [],

      selectedTypesId: [],

      type: {
        name: "",
        pid: null
      }
    },
    computed: {
      selectedTypes: function() {
        var arr = [];
        for(var i = 0; i < this.selectedTypesId.length; i++) {
          var _id = this.selectedTypesId[i];
          var t = this.getTypeById(_id);
          if(t) arr.push(t);
        }
        return arr;
      },
      parentTypes: function() {
        var arr = [];
        for(var i = 0; i < this.types.length; i++) {
          var type = this.types[i];
          if(!type.pid) arr.push(type);
        }
        return arr;
      }
    },
    methods: {
      getTypeById: function(id) {
        for(var i = 0; i < this.types.length; i++) {
          var type = this.types[i];
          if(type._id === id) return type;
        }
      },
      getTypes: function() {
        return nkcAPI("/account/subscribe_types", "GET")
          .then(function(data) {
            this_.app.types = data.types;
            this_.app.loaded = true;
            return Promise.resolve()
          })
          .catch(function(data) {
            sweetError(data);
          })
      },
      addType: function() {
        this.fastAdd = true;
        this.edit = true;
      },
      complete: function() {
        var selectedTypesId = this.selectedTypesId;
        this_.callback(selectedTypesId);
      },
      closeForm: function() {
        if(this.fastAdd) {
          this.edit = false;
          this.fastAdd = false;
        } else {
          this_.callback();
        }
        this.type = {
          name: "",
          pid: null
        }
      },
      save: function() {
        var name = this.type.name;
        var pid = this.type.pid;
        var _id = this.type._id;
        var url = "/account/subscribe_types";
        var method = "POST";
        var body = {
          name: name,
          pid: pid
        };
        if(_id) {
          url = "/account/subscribe_types/" + _id;
          method = "PATCH";
          body.type = "info";
        }
        nkcAPI(url, method, body)
          .then(function() {
            this_.app.getTypes();
            this_.app.closeForm();
          })
          .catch(function(data) {
            sweetError(data);
          })
      }
    }
  });
  this_.dom.modal({
    show: false,
    backdrop: "statics"
  });
  this_.open = function(callback, options) {
    options = options || {};
    this_.app.edit = !!options.edit;
    this_.app.selectedTypesId = [];
    this_.callback = callback;
    this_.dom.modal("show");
    this_.app.getTypes()
      .then(function() {
        // 修改分类
        if(this_.app.edit && options.typeId) {
          var type = this_.app.getTypeById(options.typeId);
          if(type) {
            this_.app.type = type;
          }
        }
        // 更改关注分类
        if(options.selectedTypesId && options.selectedTypesId.length > 0) {
          this_.app.selectedTypesId = [];
          for(var i = 0; i < options.selectedTypesId.length; i++) {
            var typeId = options.selectedTypesId[i];
            var t = this_.app.getTypeById(typeId);
            if(t) this_.app.selectedTypesId.push(t._id);
          }
        }
      });
  };
  this_.close = function() {
    this_.dom.modal("hide");
  }
};
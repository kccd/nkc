NKC.modules.SelectAddress = function() {
  var self = this;
  self.dom = $("#moduleSelectAddress");
  self.dom.modal({
    show: false
  });
  self.app = new Vue({
    el: "#moduleSelectAddressApp",
    data: {
      locationsOrigin: NKC.configs.locations,
      onlyChina: true,
      selectedLocations: [],
      activeLocation: "",
    },
    computed: {
      canClickButton: function() {
        var selectedLocations = this.selectedLocations;
        if(!selectedLocations.length) return false;
        var arr = selectedLocations[selectedLocations.length - 1].childrens;
        return !arr || !arr.length;
      },
      childrenLocations: function() {
        if(!this.activeLocation) {
          return this.locations;
        } else {
          return this.activeLocation.childrens;
        }
      },
      locationsObj: function() {
        var locations = this.locations;
        var obj = {};
        var arr = [];
        var func = function(ls) {
          for(var i = 0; i < ls.length; i++) {
            var lss = ls[i];
            arr.push(lss);
            if(lss.childrens && lss.childrens.length > 0) {
              func(lss.childrens);
            }
          }
        };
        func(locations);
        for(var i = 0; i < arr.length; i++) {
          var a = arr[i];
          obj[a.id] = a;
        }
        return obj;
      },
      locations: function() {
        if(this.onlyChina) {
          return this.locationsOrigin[0].childrens;
        } else {
          return this.locationsOrigin;
        }
      }
    },
    methods: {
      selected: function() {
        var arr = [];
        for(var i = 0; i < this.selectedLocations.length; i++) {
          arr.push(this.selectedLocations[i].cname);
        }
        self.callback(arr);
        self.close();
      },
      selectAll: function() {
        this.activeLocation = "";
      },
      getLocationById: function(id) {
        return this.locationsObj[id];
      },
      getLevel: function(location) {
        var index = 0;
        var locations = this.locations;
        var l = location;
        while(1) {
          var parent = this.getLocationById(l.pid);
          if(parent) {
            index++;
            l = parent;
          } else {
            break;
          }
        }
        return index;
      },
      selectLocation: function(location) {
        var selectedLocations = this.selectedLocations;
        var level = this.getLevel(location);
        if(selectedLocations[level] === location) return;
        selectedLocations[level] = location;
        selectedLocations.splice(level+1, 100);
        this.activeLocation = location;
      },
      // 点击已选择的地区，清除下级已选择的地区
      cancelSelect: function(location) {
        this.activeLocation = location;
        /*var selectedLocations = this.selectedLocations;
        var index = selectedLocations.indexOf(location);
        selectedLocations.splice(index, 99);*/
      }
    }

  });
  self.open = function(callback, options) {
    self.callback = callback;
    options = options || {};
    if(options.onlyChina !== undefined) {
      self.app.onlyChina = options.onlyChina;
    } else {
      self.app.onlyChina = true;
    }
    self.dom.modal("show");
  };
  self.close = function() {
    self.dom.modal("hide");
    setTimeout(function() {
      self.app.selectedLocations = [];
      self.app.activeLocation = "";
    }, 1000);
  }
};
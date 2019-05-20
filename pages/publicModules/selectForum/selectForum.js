var vueSelectForum = {};
vueSelectForum.init = function(options) {
  var func = options.func;
  var canChooseParentForum = options.canChooseParentForum || false;
  if(!func) throw 'callback function is required';
  $('#vueSelectForum').modal({show: false});
  vueSelectForum.app = new Vue({
    el: '#vueSelectForum2',
    data: {
      forums: [],
      selectedForums: []
    },
    computed: {
      childForums: function() {
        if(this.selectedForums.length === 0) {
          return this.forums;
        }
        var forum = this.selectedForums[this.selectedForums.length - 1];
        return forum.childrenForums || [];
      }
    },
    mounted: function() {
      nkcAPI('/f', 'GET')
      .then(function(data) {
        vueSelectForum.app.forums = data.forums;
      })
      .catch(function(data) {
        screenTopWarning(data);
      });
      var this_ = this;
      $('#vueSelectForum').on('hidden.bs.modal', function (e) {
        this_.selectedForums = [];
      })
    },
    methods: {
      all: function() {
        this.selectedForums = [];
      },
      backTo: function(forum) {
        for(var i = 0; i < this.selectedForums.length; i++) {
          var f = this.selectedForums[i];
          if(f.fid === forum.fid) {
            this.selectedForums.splice(i+1, 9999999);
            break;
          }
        }
      },
      selectForum: function(forum) {
        this.selectedForums.push(forum);
      },
      done: function() {
        var selectedForums = this.selectedForums;
        if(selectedForums.length === 0) return screenTopWarning('请选择专业');
        if(!canChooseParentForum && this.childForums.length !== 0) return screenTopWarning('请选择下级专业');
        $('#vueSelectForum').modal('hide');
        func(selectedForums[selectedForums.length - 1]);
        setTimeout(function() {
          vueSelectForum.app.selectedForums = [];
        }, 500);
      },
      show: function() {
        $('#vueSelectForum').modal('show');
      },
      hide: function() {
        $('#vueSelectForum').modal('hide');
      }
    }
  });
};
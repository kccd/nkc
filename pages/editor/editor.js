var editor;
$(function() {
  editor = UE.getEditor("content", NKC.configs.editor.defaultOptions);
  editor.addListener( 'ready', function( editor ) {
    resetBodyPaddingTop();
  });
});


var PostInfo = new Vue({
  el: "#postInfo",
  data: {
    forums: [],
    selectedForums: [],
  },
  computed: {
    selectedForumsId: function() {
      var arr = [];
      var selectedForums = this.selectedForums;
      for(var i = 0; i < selectedForums.length; i++) {
        var forum = selectedForums[i];
        if(forum.fid) arr.push(forum.fid);
      }
      return arr;
    },
    selectedCategoriesId: function() {
      var arr = [];
      var selectedForums = this.selectedForums;
      for(var i = 0; i < selectedForums.length; i++) {
        var forum = selectedForums[i];
        if(forum.cid) arr.push(forum.cid);
      }
      return arr;
    }
  },
  methods: {
    getForumById: function(fid) {
      var forums = this.forums;
      for(var i = 0; i < forums.length; i++) {
        var forum = forums[i];
        if(forum.fid === fid) return forum;
      }
    },
    removeSelectedForums: function(index) {
      this.selectedForums.splice(index, 1);
    },
    addKeyword: function() {

    },
    selectForums: function() {
      var self = this;
      if(!NKC.modules.MoveThread) {
        return sweetError("未引入专业选择模块");
      }
      if(!window.MoveThread) {
        window.MoveThread = new NKC.modules.MoveThread();
      }
      console.log(this.selectedForumsId, this.selectedCategoriesId)
      MoveThread.open(function(data) {
        self.selectedForums = data.forums;
        MoveThread.close();
      }, {
        hideMoveType: true,
        forumCountLimit: 2,
        selectedForumsId: this.selectedForumsId,
        selectedCategoriesId: this.selectedCategoriesId
      });
    }
  }
});


// 根据导航栏和工具栏的高度重置body的padding-top
function resetBodyPaddingTop() {
  var header = $(".navbar.navbar-default.navbar-fixed-top.nkcshade");
  var tools = $(".edui-editor-toolbarbox.edui-default");
  var height = header.height() + tools.height();
  $("body").css("padding-top", height + 40);
}

window.onresize=function(){
  resetBodyPaddingTop();
};


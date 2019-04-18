
var vue_forums_Nav = new Vue({
  el: '#vue_forums_Nav',
  data: {
    width: 0,
    height: 0,
    forums: [],
    forumsList: [],
    forumsIdList: []
  },
  mounted: function() {
    nkcAPI("/f", "GET")
      .then(function(data) {
        vue_forums_Nav.forums = data.forums;
      })
      .catch(function(data) {
        screenTopWarning(data);
      });
  },
  methods: {
    openForum: function(forum) {
      window.location.href= '/f/' + forum.fid;
    },
    displayChildForums: function(forum, num) {

      var dom = this.$refs.forumNav;

      this.height = dom.offsetHeight;
      this.width = dom.offsetWidth;

      var childNavDiv = document.getElementsByClassName('child-forums-nav-div');

      for(var i = 0; i < childNavDiv.length; i++) {
        var h = childNavDiv[i].offsetHeight;
        if(h > this.height) this.height = h;
      }

      this.forumsList = this.forumsList.slice(0, num);
      this.forumsList[num] = forum;

      /*if(!forum.childrenForums || forum.childrenForums.length === 0) {
        this.forumsList = this.forumsList.slice(0, num-1);
      }*/

      var arr = [];
      for(var i = 0; i < this.forumsList.length; i++) {
        arr.push(this.forumsList[i].fid);
      }
      this.forumsIdList = arr;
    }
  }
});
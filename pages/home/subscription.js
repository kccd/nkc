var swiper = new Swiper('.swiper-container', {
  pagination: {
    el: '.swiper-pagination',
    type: 'fraction',
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  loop: true,
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
});

var forumNav = new Vue({
  el: '#forumsNav',
  data: {
    width: 0,
    height: 0,
    forums: [],
    forumsList: [],
    forumsIdList: []
  },
  mounted: function() {
    this.forums = JSON.parse(this.$refs.forums.innerText);
    NKC.methods.initScrollTo({
      top: true,
      bottom: true
    }, function(data) {

    });
  },
  methods: {
    openForum: function(forum) {
      // window.location.href= '/f/' + forum.fid;
      openToNewLocation('/f/' + forum.fid);
    },
    displayChildForums: function(forum, num) {

      var dom = this.$el;

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
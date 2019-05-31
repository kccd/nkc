var app = new Vue({
  el: "#app",
  data: {
    tab: "thread", // thread, post
  },
  methods: {
    switchTab: function(type) {
      this.tab = type;
    }
  }
});

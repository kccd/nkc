alert(123)
var app = new Vue({
  el: '#app',
  computed: {
    toBrowser: function() {
      var ua = window.navigator.userAgent.toLowerCase();
      return ua.indexOf('micromessenger') > -1 || ua.indexOf(' qq') > -1;
    }
  },
  methods: {
    toHome: function() {
      // window.location.href = '/';
      openToNewLocation("/");
    }
  }
});
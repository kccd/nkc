const data = NKC.methods.getDataById('data');

const app = new Vue({
  el: '#app',
  data: {
    fund: data.fund
  }
});
import {getState} from "../../lib/js/state";
const state = getState();

const app = new Vue({
  el: '#app',
  data: {
    logged: !!state.uid,
  }
})

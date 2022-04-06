import {getDataById} from "../lib/js/dataConversion";
const data = getDataById('data');

$(function() {
  window.RootApp.$refs.login.open('login', data.type || 'login');
});

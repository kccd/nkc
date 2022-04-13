import {getDataById} from "../lib/js/dataConversion";
import {LoginType} from '../lib/vue/Login';
const data = getDataById('data');

$(function() {
  window.RootApp.$refs.login.open(data.type || LoginType.SignIn);
});

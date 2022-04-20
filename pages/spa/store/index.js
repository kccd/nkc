import Vue from 'vue';
import Vuex from 'vuex';
import mutations from './mutations';
import actions from './actions';
import states from './states';
import modules from "./modules";

Vue.use(Vuex);

export default new Vuex.Store({
  states,
  mutations,
  actions,
  modules
})

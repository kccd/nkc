import Vue from 'vue';
import PublicPaper from '../lib/vue/PublicPaper.vue';
// Vue.directive('translate', {
//   update(el, binding, vnode) {
//     const { value } = binding;

//     if (value && typeof value === 'object') {
//       const language = vnode.context.$data.currentLanguage;
//       const translation = value[language];

//       if (translation) {
//         el.textContent = translation;
//       }
//     }
//   },
// });
new Vue({
  el: '#take-exam',
  data() {
    return {};
  },
  components: {
    PublicPaper,
  },
});

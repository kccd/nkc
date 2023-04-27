import { getDataById } from '../../lib/js/dataConversion';
import { visitUrl } from '../../lib/js/pageSwitch';
import { objToStr } from '../../lib/js/dataConversion';
import Vue from 'vue';
const { source, sourceContent, targetSource, targetSourceContent } =
  getDataById('data');

new Vue({
  el: '#app',
  data: {
    source,
    sourceContent,
    targetSource,
    targetSourceContent,
  },
  methods: {
    reset() {
      this.source = 'name';
      this.sourceContent = '';
      this.targetSource = 'name';
      this.targetSourceContent = '';
      this.submit();
    },
    getUrlData() {
      const { source, sourceContent, targetSource, targetSourceContent } = this;
      return objToStr({
        source,
        sourceContent,
        targetSource,
        targetSourceContent,
      });
    },
    submit() {
      const url = `${window.location.pathname}?c=${this.getUrlData()}`;
      visitUrl(url);
    },
  },
});

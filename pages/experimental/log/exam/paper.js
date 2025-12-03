import Vue from 'vue';
import { getDataById } from '../../../lib/js/dataConversion';
import { getUrl } from '../../../lib/js/tools';
import { objToStr } from '../../../lib/js/dataConversion';
import { detailedTime } from '../../../lib/js/time';
import { markdownToHTML } from '../../../lib/js/dataConversion';
import { renderFormula } from '../../../lib/js/formula';

const data = getDataById('data');
new Vue({
  el: '#app',
  data: {
    paper: data.paper,
    category: data.category,
    paperUser: data.paperUser,
    optionIndex: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  },
  computed: {
    recordResults() {
      const obj = {};
      for (const record of this.paper.record) {
        obj[record.qid] = !!record.correct;
      }
      return obj;
    },
  },
  mounted() {
    setTimeout(() => {
      renderFormula(document.querySelectorAll('.question-list'));
    }, 100);
  },
  methods: {
    detailedTime,
    markdownToHTML,
    objToStr,
    getUrl,
  },
});

import { getDataById } from '../../../lib/js/dataConversion';
import { getUrl } from '../../../lib/js/tools';
import SurveyView from './components/Survey.vue';
import VoteView from './components/Vote.vue';
import ScoreView from './components/Score.vue';
import { timeFormat } from '../../../lib/js/time';
const data = getDataById('data');

const app = new window.Vue({
  el: '#app',
  components: {
    SurveyView,
    VoteView,
    ScoreView,
  },
  data: {
    surveyPosts: data.surveyPosts,
    survey: data.survey,
  },
  methods: {
    getUrl,
    timeFormat,
    translateType(type) {
      switch (type) {
        case 'vote': {
          return '投票';
        }
        case 'survey': {
          return '问卷调查';
        }
        case 'score':
        default: {
          return '评分';
        }
      }
    },
  },
});

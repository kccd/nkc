import { getDataById, objToStr } from '../../../lib/js/dataConversion';
import { getUrl } from '../../../lib/js/tools';
import { timeFormat } from '../../../lib/js/time';
const data = getDataById('data');

const usersSelected = {};
for (const post of data.surveyPosts) {
  for (const option of post.options) {
    const key = `${option.optionId}-${option.answerId}`;
    if (!usersSelected[key]) {
      usersSelected[key] = [];
    }
    if (option.selected) {
      usersSelected[key].push(post.uid);
    }
  }
}

const app = new window.Vue({
  el: '#app',
  data: {
    surveyPosts: data.surveyPosts,
    survey: data.survey,
    usersSelected,
    selectedUsersId: [],
  },
  methods: {
    getUrl,
    timeFormat,
    objToStr,
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
    selectUser(uid) {
      if (this.selectedUsersId.includes(uid)) {
        this.selectedUsersId = this.selectedUsersId.filter((id) => id !== uid);
      } else {
        this.selectedUsersId.push(uid);
      }
    },
  },
});

<template lang="pug">
.survey-detail
	div(v-for="option, index in survey.options" :key="option._id")
		h4 {{ index + 1 }}. {{ option.content }}
		div
			a(v-for="link in option.links" :key="link" :href="link" target="_blank") {{ link }}
		div
			img(v-for="rid in option.resourcesId" :key="rid" :src="getUrl('resource', rid)")
		div(v-for="answer, answerIndex in option.answers" :key="answer._id")
			h5 {{ index + 1 }}-{{ answerIndex + 1 }}. {{ answer.content }}
			div
				a(v-for="link in answer.links" :key="link" :href="link" target="_blank") {{ link }}
			div
				img(v-for="rid in answer.resourcesId" :key="rid" :src="getUrl('resource', rid)")
			.score-users
				a.score-user(
					v-for="row in scoresByAnswer[option._id + '-' + answer._id]"
					:key="row.uid + '-' + row.index"
					:href="'/u/' + row.uid"
					target="_blank"
				) {{ row.username }}({{ row.score }})
</template>

<script>
import { getUrl } from '../../../../lib/js/tools';

export default {
  name: 'ScoreView',
  props: {
    survey: {
      type: Object,
      required: true,
    },
    surveyPosts: {
      type: Array,
      required: true,
    },
  },
  computed: {
    scoresByAnswer() {
      const map = {};
      for (const post of this.surveyPosts) {
        if (!post.uid) {
          continue;
        }
        const user = post.user || {
          uid: post.uid,
          username: post.username || post.uid,
        };
        const options = post.options || [];
        for (const option of options) {
          const key = `${option.optionId}-${option.answerId}`;
          if (!map[key]) {
            map[key] = [];
          }
          map[key].push({
            uid: user.uid,
            username: user.username,
            score: option.score,
            index: map[key].length,
          });
        }
      }
      return map;
    },
  },
  methods: {
    getUrl,
  },
};
</script>

<style lang="less" scoped>
.survey-detail img {
  max-width: 10rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}
.score-users {
  margin: 0.4rem 0 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.score-user {
  display: inline-block;
  font-size: 1.2rem;
}
</style>

<template lang="pug">
.survey-detail
	div(v-if="voteOption")
		h4 1. {{ voteOption.content }}
		div
			a(v-for="link in voteOption.links" :key="link" :href="link" target="_blank") {{ link }}
		div
			img(v-for="rid in voteOption.resourcesId" :key="rid" :src="getUrl('resource', rid)")
		div(v-for="answer, answerIndex in voteOption.answers" :key="answer._id")
			h5 1-{{ answerIndex + 1 }}. {{ answer.content }}
			div
				a(v-for="link in answer.links" :key="link" :href="link" target="_blank") {{ link }}
			div
				img(v-for="rid in answer.resourcesId" :key="rid" :src="getUrl('resource', rid)")
			.survey-users
				a.survey-user(
					v-for="user in usersByAnswer[voteOption._id + '-' + answer._id]"
					:key="user.uid"
					:href="'/u/' + user.uid"
					target="_blank"
				) {{ user.username }}
</template>

<script>
import { getUrl } from '../../../../lib/js/tools';

export default {
  name: 'VoteView',
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
    voteOption() {
      return this.survey.options && this.survey.options.length
        ? this.survey.options[0]
        : null;
    },
    usersByAnswer() {
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
          if (!option.selected) {
            continue;
          }
          const key = `${option.optionId}-${option.answerId}`;
          if (!map[key]) {
            map[key] = [];
          }
          map[key].push(user);
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
.survey-users {
  margin: 0.4rem 0 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.survey-user {
  display: inline-block;
  font-size: 1.2rem;
}
</style>

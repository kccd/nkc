       <template lang="pug">
  .score-container(v-if="scores && scores.length || xsf")
    .user-scores(v-for="s in scores")
      .user-score(:title="s.name + ': ' + s.number/100")
        img(v-if="!sicon" :src="getUrl('scoreIcon', s.icon)")
        img(v-else :src="s.icon")
        span {{s.number/100}}
      .user-score(:title="'学术分: ' + xsf" v-if="xsf !== undefined")
        img(v-if="xsficon" :src="xsficon")
        img(v-else :src="getUrl('defaultFile', 'xsf.png')")
        span {{xsf}}
</template>

<style lang="less" scoped>
.user-scores{
  text-align: center;
  padding: 0.5rem 0;
  .user-score{
    display: inline-block;
    margin-right: 0.5rem;
    img{
      height: 1.4rem;
      width: 1.4rem;
      margin-right: 0.2rem;
      vertical-align: text-bottom;
    }
    span{
      font-size: 1rem;
      color: #555;
    }
  }
}
</style>

<script>
import {getUrl} from "../../../js/tools";
export default {
  props: ["scores", "xsf", "sicon", "xsficon"],
  data: () => ({
  }),
  methods: {
    getUrl: getUrl,
  }
}
</script>



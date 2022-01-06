import {getDataById} from "../../../lib/js/dataConversion";
const data = getDataById('data');
let defaultSourceType;
for(const sourceType in data.documentPostSettings) {
  if(!defaultSourceType) defaultSourceType = sourceType;
  const {postPermission, postReview} = data.documentPostSettings[sourceType];
  const [status, limited, count] = postPermission.examNotPass.split(':');
  postPermission._examNotPass = {
    status: status === 'true',
    limited: limited === 'true',
    count: Number(count)
  };
  const defaultIntervalArr = postPermission.defaultInterval.split(':');
  const defaultCountArr = postPermission.defaultCount.split(':');
  postPermission._defaultInterval = {
    limited: defaultIntervalArr[0] === 'true',
    count: Number(defaultIntervalArr[1])
  };
  postPermission._defaultCount = {
    limited: defaultCountArr[0] === 'true',
    count: Number(defaultCountArr[1])
  };
  postPermission._intervalLimit = [];
  for(const item of postPermission.intervalLimit) {
    const [type, value, limited, count] = item.split(':');
    postPermission._intervalLimit.push({
      limited: limited === 'true',
      count: Number(count),
      valueString: `${type}-${value}`
    });
  }
  postPermission._countLimit = [];
  for(const item of postPermission.countLimit) {
    const [type, value, limited, count] = item.split(':');
    postPermission._countLimit.push({
      limited: limited === 'true',
      count: Number(count),
      valueString: `${type}-${value}`
    });
  }
  const postReviewDefault = postReview.default.split(':');
  postReview._default = {
    type: postReviewDefault[0],
    count: Number(postReviewDefault[1])
  };
  postReview._list = [];
  for(const l of postReview.list) {
    const [type, value, reviewType, count] = l.split(':');
    postReview._list.push({
      valueString: `${type}-${value}`,
      type: reviewType,
      count: Number(count)
    });
  }
  console.log(postReview._list)
}
const app = new Vue({
  el: "#app",
  data: {
    documentPostSettings: data.documentPostSettings,
    sources: data.sources,
    selectSourceType: defaultSourceType,
    roleList: data.roleList,
  },
  computed: {
    settings() {
      return this.documentPostSettings[this.selectSourceType] || null;
    }
  },
  methods: {
    selectSource(type) {
      this.selectSourceType = type;
    },
    addItem(arr) {
      arr.push({
        valueString: '',
        count: 0,
        limited: false
      });
    },
    addReviewItem() {
      this.settings.postReview._list.push({
        valueString: '',
        type: 'none',
        count: 1
      });
    },
    removeItem(arr, index) {
      arr.splice(index, 1);
    },
    submit() {
      const {documentPostSettings} = this;
      for(const sourceType in documentPostSettings) {
        const {postPermission, postReview} = documentPostSettings[sourceType];
        const {
          _examNotPass,
          _defaultInterval,
          _defaultCount,
          _intervalLimit,
          _countLimit
        } = postPermission;
        const {
          _default,
          _list
        } = postReview;
        postPermission
          .examNotPass= `${_examNotPass.status}`
      }
    }
  }
});
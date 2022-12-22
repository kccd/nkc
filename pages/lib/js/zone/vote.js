/*
* 动态或动态评论的点赞或点踩
* @param {String} type 点赞（voteType.voteUp）点踩（voteType.voteDown）
* @param {String} 动态或动态评论ID
* */

import {nkcAPI} from '../netAPI';

/*
* 点赞点踩或取消点赞点踩
* @param {String} id 动态或评论ID
* @param {String} voteType 点赞或点踩 up(点赞), down(点踩)
* @param {Boolean} cancel 取消点赞或点踩
* */
export function momentVote(id, voteType, cancel = false) {
  return Promise.resolve()
    .then(() => {
      if(!['up', 'down'].includes(voteType)) {
        throw new Error(`voteType error. voteType=${voteType}`);
      }
      return nkcAPI(`/zone/m/${id}/vote`, 'POST', {
        voteType,
        cancel
      });
    })
    .then(res => {
      const {voteUp, voteDown} = res.vote;
      return {
        voteUp,
        voteDown,
      }
    });
}

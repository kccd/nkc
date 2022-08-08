module.exports = {
  a: {
    PARAMETER: {
      GET: 'visitZoneArticle'
    }
  },
  m: {
    PARAMETER: {
      GET: 'visitZoneSingleMoment',
      vote: {
        POST: 'zoneMomentVote'
      },
      options: {
        GET: 'getZoneMomentOption'
      },
      comments: {
        GET: 'getZoneMomentComments',
        child: {
          GET: 'getZoneMomentComments',
        }
      },
      repost: {
        GET: 'getZoneMomentComments'
      },
      comment: {
        PARAMETER: {
          DELETE: 'deleteZoneMomentComment',
          vote: {
            POST: 'zoneMomentCommentVote'
          },
          options: {
            GET: 'getZoneMomentCommentOptions'
          }
        }
      }
    }
  }
}

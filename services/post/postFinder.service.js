const PostModel = require('../../dataModels/PostModel');
const ResourceModel = require('../../dataModels/ResourceModel');
const nkcRender = require('../../nkcModules/nkcRender/index');
class PostFinderService {
  async getPostAsArticle(pid) {
    const post = await PostModel.findOnly({ pid });

    return {
      content: {
        tid: post.tid,
        pid: post.pid,
        title: nkcRender.replaceTextLinkToHTML(post.t),
        abstractEN: '',
        abstractCN: '',
        keywordsEN: '',
        keywordsCN: '',
        html: '',
        toc: new Date(),
        tlm: new Date(),
        ip: '',
      },
      forums: [
        {
          fid: '',
          name: '',
          homeUrl: '',
        },
      ],
      user: {
        uid: '',
        name: '',
        avatarUrl: '',
        homeUrl: '',
      },
    };
  }

  getPostAsPost() {}

  getPostAsComment() {}
}
module.exports = {
  postFinderService: new PostFinderService(),
};

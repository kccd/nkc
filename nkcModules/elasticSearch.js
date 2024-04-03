const func = {};

const elasticSearch = require('../settings/elasticSearch');
const client = elasticSearch();
const { ThrowCommonError } = require('../nkcModules/error');
const esConfig = require('../config/elasticSearch');
const cheerio = require('cheerio');
const filterSearchContent = require('./xssFilters/filterSearchContent');

const { analyzer, searchAnalyzer, indexName } = esConfig;

func.client = client;

func.init = async () => {
  let indexExist = await client.indices.exists({
    index: indexName,
  });
  if (!indexExist) {
    await client.indices.create({
      index: indexName,
      body: {
        settings: {
          analysis: {
            filter: {
              ng_filter: {
                type: 'ngram',
                min_gram: 1,
                max_gram: 256,
                // token_chars: ['letter', 'digit', 'punctuation', 'symbol'],
                token_chars: ['letter', 'digit'],
              },
              eg_filter: {
                type: 'edge_ngram',
                min_gram: 1,
                max_gram: 256,
                token_chars: ['letter', 'digit', 'punctuation', 'symbol'],
                // token_chars: ['letter', 'digit'],
              },
            },
            analyzer: {
              ng_analyzer: {
                // tokenizer: 'ng_tokenizer',
                // filter: ['lowercase'],
                type: 'custom',
                tokenizer: 'standard',
                //char_filter: ['my_char_filter'],
                filter: ['lowercase', 'ng_filter'],
              },
              eg_analyzer: {
                // tokenizer: 'ng_tokenizer',
                // filter: ['lowercase'],
                type: 'custom',
                tokenizer: 'standard',
                char_filter: ['my_char_filter'],
                filter: ['lowercase', 'eg_filter'],
              },
              search_analyzer: {
                tokenizer: 'standard',
                char_filter: ['my_char_filter'],
              },
            },
            tokenizer: {
              ng_tokenizer: {
                type: 'ngram',
                min_gram: 1,
                max_gram: 256,
                token_chars: ['letter', 'digit', 'punctuation', 'symbol'],
              },
              eg_tokenizer: {
                type: 'edge_ngram',
                min_gram: 1,
                max_gram: 256,
                token_chars: ['letter', 'digit', 'punctuation', 'symbol'],
              },
            },
            char_filter: {
              my_char_filter: {
                type: 'mapping',
                mappings: ['+=> 加'],
              },
            },
          },
        },
        mappings: {
          documents: {
            properties: {
              docType: {
                // 文档类型：thread， user， post，document_article， document_comment
                type: 'keyword',
              },
              uid: {
                type: 'keyword',
              },
              username: {
                type: 'text',
                analyzer: analyzer,
                search_analyzer: searchAnalyzer,
              },
              description: {
                type: 'text',
                analyzer: analyzer,
                search_analyzer: searchAnalyzer,
              },
              pid: {
                type: 'keyword',
              },
              toc: {
                type: 'date',
              },
              title: {
                type: 'text',
                analyzer: analyzer,
                search_analyzer: searchAnalyzer,
              },
              abstractCN: {
                type: 'text',
                analyzer: analyzer,
                search_analyzer: searchAnalyzer,
              },
              abstractEN: {
                type: 'text',
                analyzer: analyzer,
                search_analyzer: searchAnalyzer,
              },
              content: {
                type: 'text',
                analyzer: analyzer,
                search_analyzer: searchAnalyzer,
              },
              mainForumsId: {
                type: 'keyword',
              },
              tcId: {
                type: 'keyword',
              },
              digest: {
                type: 'boolean',
              },
              tid: {
                type: 'keyword',
              },
              aid: {
                type: 'keyword',
              },
              keywordsCN: {
                type: 'keyword',
              },
              keywordsEN: {
                type: 'keyword',
              },
              authors: {
                type: 'keyword',
              },
              voteUp: {
                type: 'long',
              },
              voteDown: {
                type: 'long',
              },
            },
          },
        },
      },
    });

    //已有索引数据迁移
  }
};

/*
 * 更新数据，若数据不存在则创建
 * @param {String} docType 文档类型：user, post, thread, document_article
 * @param {Object} document 数据
 * @author pengxiguaa 2019-5-17
 * */
func.save = async (docType, document) => {
  const apiFunction = require('../nkcModules/apiFunction');
  const FundApplicationFormModel = require('../dataModels/FundApplicationFormModel');
  if (
    ![
      'user',
      'post',
      'thread',
      'column',
      'columnPage',
      'resource',
      'document_article',
      'document_comment',
      'document_moment',
    ].includes(docType)
  ) {
    ThrowCommonError(500, 'docType error');
  }

  let aid = '';
  const {
    pid = '',
    toc = new Date(),
    tid = '',
    uid = '',
    mainForumsId = [],
    t = '',
    c = '',
    digest = false,
    abstractEn = '',
    abstractCn = '',
    keyWordsEn = [],
    keyWordsCn = [],
    authorInfos = [],
    voteUp = 0,
    voteDown = 0,
    description = '',
    username = '',
    tcId = [],
  } = document;

  if (docType === 'thread') {
    const fundForm = await FundApplicationFormModel.findOne({ tid });
    if (fundForm) {
      aid = fundForm.code;
    }
  }

  // 唯一ID，存在测更新body，不存在则新建数据。
  let id;

  if (docType === 'thread') {
    id = `thread_${tid}`;
  } else if (docType === 'post') {
    id = `post_${pid}`;
  } else if (docType === 'user') {
    id = `user_${uid}`;
  } else if (docType === 'column') {
    id = `column_${tid}`;
  } else if (docType === 'columnPage') {
    id = `columnPage_${tid}`;
  } else if (docType === 'resource') {
    id = `resource_${tid}`;
  } else if (docType === 'document_article') {
    id = `article_${tid}`;
  } else if (docType === 'document_comment') {
    id = `comment_${tid}`;
  }

  return await client.index({
    index: indexName,
    type: 'documents',
    id,
    body: {
      docType,
      toc,
      pid,
      description,
      username,
      uid,
      tid,
      aid,
      digest,
      mainForumsId,
      tcId,
      title: t,
      content: apiFunction.obtainPureText(c),
      abstractCN: abstractCn,
      abstractEN: abstractEn,
      keywordsCN: keyWordsCn,
      keywordsEN: keyWordsEn,
      authors: authorInfos.map((a) => a.name),
      voteUp,
      voteDown,
    },
  });
};

// 搜索
func.search = async (t, c, options) => {
  const SettingModel = require('../dataModels/SettingModel');
  const UserModel = require('../dataModels/UserModel');
  const ThreadCategoryModel = require('../dataModels/ThreadCategoryModel');
  let {
    page = 0,
    sortType,
    timeStart,
    timeEnd,
    tcId = [],
    fid,
    relation,
    sort,
    excludedFid,
    author,
    digest,
    onlyTitle = false,
  } = options;

  // 若只有一个关键词则默认or
  relation = relation === 'or' || c.split(' ').length < 2 ? 'or' : 'and';

  if (timeStart) {
    const { year, month, day } = timeStart;
    timeStart = new Date(`${year}-${month}-${day} 00:00:00`);
  }
  if (timeEnd) {
    const { year, month, day } = timeEnd;
    timeEnd = new Date(`${year}-${month}-${day} 23:59:59`);
  }

  page = Number(page);

  const {
    searchThreadList,
    searchPostList,
    searchAllList,
    searchUserList,
    searchColumnList,
    searchResourceList,
    searchDocumentList,
  } = await SettingModel.getSettings('page');

  let size;
  if (t === 'user') {
    size = searchUserList;
  } else if (t === 'post') {
    size = searchPostList;
  } else if (t === 'thread') {
    size = searchThreadList;
  } else if (t === 'column') {
    size = searchColumnList;
  } else if (t === 'resource') {
    size = searchResourceList;
  } else if (t === 'document_article' || t === 'document_comment') {
    size = searchDocumentList;
  } else {
    size = searchAllList;
  }
  const body = {
    from: page * size,
    size,
    min_score: 1,
    sort: [],
    highlight: {
      pre_tags: ['<span style="color: #e85a71;">'],
      post_tags: ['</span>'],
      fields: {
        tid: {
          pre_tags: ['<span style="color: #e85a71;">D'],
          post_tags: ['</span>'],
        },
        pid: {},
        aid: {},
        title: {},
        content: {},
        username: {},
        authors: {},
        description: {},
        abstractCN: {},
        abstractEN: {},
        keywordsCN: {},
        keywordsEN: {},
      },
    },
  };

  // 只搜标题
  const threadConditions = [
    createMatch('title', c, 5, relation),
    createMatch('content', c, 2, relation),
    createMatch('pid', c.toLowerCase(), 100, relation),
    createMatch('aid', c, 100, relation),
    createMatch('authors', c, 80, relation),
    createMatch('abstractEN', c, 50, relation),
    createMatch('abstractCN', c, 50, relation),
    createMatch('keywordsEN', c, 80, relation),
    createMatch('keywordsCN', c, 80, relation),
  ];
  //搜索文章
  if (t === 'thread' && onlyTitle) {
    threadConditions.length = 1;
  }

  body.query = {
    bool: {
      must: [
        // 最后一个元素用于docType筛选
        {
          bool: {
            should: [
              // 第1、2元素是关于文章回复的内容，后边会增加其他筛选条件
              {
                bool: {
                  must: [
                    {
                      match: {
                        docType: 'thread',
                      },
                    },
                    {
                      bool: {
                        should: threadConditions,
                      },
                    },
                  ],
                },
              },
              {
                bool: {
                  must: [
                    {
                      match: {
                        docType: 'post',
                      },
                    },
                    {
                      bool: {
                        should: [
                          createMatch('title', c, 5, relation),
                          createMatch('content', c, 2, relation),
                          createMatch('pid', c.toLowerCase(), 100, relation),
                          createMatch('authors', c, 80, relation),
                          createMatch('abstractEN', c, 50, relation),
                          createMatch('abstractCN', c, 50, relation),
                          createMatch('keywordsEN', c, 80, relation),
                          createMatch('keywordsCN', c, 80, relation),
                        ],
                      },
                    },
                  ],
                },
              },
              {
                bool: {
                  must: [
                    {
                      match: {
                        docType: 'user',
                      },
                    },
                    {
                      bool: {
                        should: [
                          createMatch('username', c, 6, relation),
                          createMatch('description', c, 3, relation),
                        ],
                      },
                    },
                  ],
                },
              },
              {
                bool: {
                  must: [
                    {
                      match: {
                        docType: 'column',
                      },
                    },
                    {
                      bool: {
                        should: [
                          createMatch('username', c, 6, relation),
                          createMatch('description', c, 3, relation),
                        ],
                      },
                    },
                  ],
                },
              },
              {
                bool: {
                  must: [
                    {
                      match: {
                        docType: 'columnPage',
                      },
                    },
                    {
                      bool: {
                        should: [
                          createMatch('title', c, 5, relation),
                          createMatch('content', c, 2, relation),
                        ],
                      },
                    },
                  ],
                },
              },
              {
                bool: {
                  must: [
                    {
                      match: {
                        docType: 'resource',
                      },
                    },
                    {
                      bool: {
                        should: [
                          createMatch('title', c, 5, relation),
                          createMatch('content', c, 2, relation),
                        ],
                      },
                    },
                  ],
                },
              },
              {
                bool: {
                  must: [
                    {
                      match: {
                        docType: 'document_article',
                      },
                    },
                    {
                      bool: {
                        should: [
                          createMatch(
                            'tid',
                            (() => {
                              let targetKeyword = c.toUpperCase();
                              if (
                                targetKeyword.indexOf('D') === 0 &&
                                targetKeyword.slice(1)
                              ) {
                                targetKeyword = targetKeyword.slice(1);
                              }
                              return targetKeyword;
                            })(),
                            5,
                            relation,
                          ),
                          createMatch('title', c, 5, relation),
                          createMatch('content', c, 2, relation),
                          createMatch('authors', c, 80, relation),
                          createMatch('abstractEN', c, 50, relation),
                          createMatch('abstractCN', c, 50, relation),
                          createMatch('keywordsEN', c, 80, relation),
                          createMatch('keywordsCN', c, 80, relation),
                        ],
                      },
                    },
                  ],
                },
              },
              {
                bool: {
                  must: [
                    {
                      match: {
                        docType: 'document_comment',
                      },
                    },
                    {
                      bool: {
                        should: [
                          createMatch(
                            'tid',
                            (() => {
                              let targetKeyword = c.toUpperCase();
                              if (
                                targetKeyword.indexOf('D') === 0 &&
                                targetKeyword.slice(1)
                              ) {
                                targetKeyword = targetKeyword.slice(1);
                              }
                              return targetKeyword;
                            })(),
                            5,
                            relation,
                          ),
                          createMatch('content', c, 2, relation),
                          createMatch('authors', c, 80, relation),
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
  if (t === 'post') {
    body.query.bool.must.push({
      bool: {
        should: [
          {
            match: {
              docType: 'post',
            },
          },
          {
            match: {
              docType: 'document_comment',
            },
          },
        ],
      },
    });
  } else if (t === 'thread') {
    body.query.bool.must.push({
      bool: {
        should: [
          {
            match: {
              docType: 'thread',
            },
          },
          {
            match: {
              docType: 'document_article',
            },
          },
        ],
      },
    });
  } else if (t === 'user') {
    body.query.bool.must.push({
      match: {
        docType: 'user',
      },
    });
  } else if (t === 'column') {
    body.query.bool.must.push({
      bool: {
        should: [
          {
            match: {
              docType: 'column',
            },
          },
          {
            match: {
              docType: 'columnPage',
            },
          },
        ],
      },
    });
  } else if (t === 'resource') {
    body.query.bool.must.push({
      match: {
        docType: 'resource',
      },
    });
  } else if (t === 'document_article') {
    body.query.bool.must.push({
      match: {
        docType: 'document_article',
      },
    });
  } else if (t === 'document_comment') {
    body.query.bool.must.push({
      match: {
        docType: 'document_comment',
      },
    });
  }

  if (!['user', 'column'].includes(t)) {
    if (fid && fid.length > 0) {
      const fidMatch = {
        bool: {
          should: fid.map((id) => {
            return {
              match: {
                mainForumsId: id,
              },
            };
          }),
        },
      };
      body.query.bool.must[0].bool.should[0].bool.must.push(fidMatch);
      body.query.bool.must[0].bool.should[1].bool.must.push(fidMatch);
    }

    if (excludedFid && excludedFid.length > 0) {
      const excludedFidMatch = {
        bool: {
          must_not: excludedFid.map((id) => {
            return {
              match: {
                mainForumsId: id,
              },
            };
          }),
        },
      };
      body.query.bool.must[0].bool.should[0].bool.must.push(excludedFidMatch);
      body.query.bool.must[0].bool.should[1].bool.must.push(excludedFidMatch);
    }

    if (t === 'thread' && tcId && tcId.length) {
      const must = [];
      const categoryTree = await ThreadCategoryModel.getCategoryTree();
      const categoryTreeObj = {};
      for (const c of categoryTree) {
        categoryTreeObj[c._id] = c.nodes.map((n) => n._id);
      }
      const categoryObj = {};
      for (const id of tcId) {
        let [categoryId, nodeId] = id.split('-');
        if (!categoryObj[categoryId]) {
          categoryObj[categoryId] = new Set();
        }
        if (categoryObj[categoryId].has(nodeId)) {
          continue;
        }
        categoryObj[categoryId].add(nodeId);
      }
      for (let categoryId in categoryObj) {
        let nodesId = categoryObj[categoryId];
        categoryId = Number(categoryId);
        const hasDefault = nodesId.has('default');
        nodesId.delete('default');
        nodesId = [...nodesId].map((n) => Number(n));
        const should = nodesId.map((nodeId) => {
          return {
            match: {
              tcId: nodeId,
            },
          };
        });
        if (hasDefault) {
          should.push({
            bool: {
              must_not: categoryTreeObj[categoryId].map((id) => {
                return {
                  match: {
                    tcId: id,
                  },
                };
              }),
            },
          });
        }
        must.push({
          bool: {
            should,
          },
        });
      }
      body.query.bool.must[0].bool.should[0].bool.must.push(...must);
    }

    if (author) {
      let uid = '';
      const user = await UserModel.findOne(
        {
          usernameLowerCase: (author || '').toLowerCase(),
        },
        { uid: 1 },
      );
      if (user) {
        uid = user.uid;
      }
      const authorMatch = {
        match: {
          uid,
        },
      };
      //添加只查看该用户的搜索结果
      body.query.bool.must[0].bool.should[0].bool.must.push(authorMatch);
      body.query.bool.must[0].bool.should[1].bool.must.push(authorMatch);
      body.query.bool.must[0].bool.should[2].bool.must.push(authorMatch);
      body.query.bool.must[0].bool.should[3].bool.must.push(authorMatch);
      body.query.bool.must[0].bool.should[4].bool.must.push(authorMatch);
      body.query.bool.must[0].bool.should[5].bool.must.push(authorMatch);
      body.query.bool.must[0].bool.should[6].bool.must.push(authorMatch);
      body.query.bool.must[0].bool.should[7].bool.must.push(authorMatch);
    }

    if (digest) {
      const digestMatch = {
        match: {
          digest: true,
        },
      };
      body.query.bool.must[0].bool.should[0].bool.must.push(digestMatch);
      body.query.bool.must[0].bool.should[1].bool.must.push(digestMatch);
    }

    // 时间范围
    if (timeStart || timeEnd) {
      const range = {
        toc: {},
      };
      if (timeEnd) {
        range.toc.lt = new Date(new Date(timeEnd).getTime() + 1000);
      }
      if (timeStart) {
        range.toc.gte = timeStart;
      }
      body.query.bool.filter = { range };
    }

    // 按时间排序 升序/降序
    if (sortType === 'time') {
      const toc = {
        order: 'desc',
      };
      if (sort === 'asc') {
        toc.order = 'asc';
      }
      body.sort.push({ toc });
    } else {
      // 按匹配程度排序 升序/降序
      const _score = {
        order: 'desc',
      };
      if (sort === 'asc') {
        _score.order = 'asc';
      }
      body.sort.push({ _score });
    }
  }
  return await client.search({
    index: indexName,
    type: 'documents',
    body,
  });
};
// 搜索文章
func.searchThreadOrArticle = async (t, c, options) => {
  const SettingModel = require('../dataModels/SettingModel');
  let { page = 0, relation = 'or', uid, fid = [] } = options;
  const { searchThreadList } = await SettingModel.getSettings('page');
  let size;
  size = searchThreadList;
  const body = {
    from: page * size,
    size,
    min_score: 1,
    sort: [],
    highlight: {
      pre_tags: ['<span style="color: #e85a71;">'],
      post_tags: ['</span>'],
      fields: {
        tid: {
          pre_tags: ['<span style="color: #e85a71;">D'],
          post_tags: ['</span>'],
        },
        pid: {},
        aid: {},
        title: {},
        content: {},
        username: {},
        authors: {},
        description: {},
        abstractCN: {},
        abstractEN: {},
        keywordsCN: {},
        keywordsEN: {},
      },
    },
  };

  // 只搜标题和文号
  const threadConditions = [
    createMatch('title', c, 5, relation),
    createMatch('pid', c.toLowerCase(), 100, relation),
  ];

  body.query = {
    bool: {
      must: [
        // 最后一个元素用于docType筛选
        {
          bool: {
            should: [
              {
                bool: {
                  must: [
                    {
                      match: {
                        docType: 'thread',
                      },
                    },
                    {
                      bool: {
                        should: threadConditions,
                      },
                    },
                  ],
                },
              },
              {
                bool: {
                  must: [
                    {
                      match: {
                        docType: 'user',
                      },
                    },
                    {
                      bool: {
                        should: [createMatch('username', c, 6, relation)],
                      },
                    },
                  ],
                },
              },
              {
                bool: {
                  must: [
                    {
                      match: {
                        docType: 'document_article',
                      },
                    },
                    {
                      bool: {
                        should: [
                          createMatch(
                            'tid',
                            (() => {
                              let targetKeyword = c.toUpperCase();
                              if (
                                targetKeyword.indexOf('D') === 0 &&
                                targetKeyword.slice(1)
                              ) {
                                targetKeyword = targetKeyword.slice(1);
                              }
                              return targetKeyword;
                            })(),
                            5,
                            relation,
                          ),
                          createMatch('title', c, 5, relation),
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
  if (t === 'thread') {
    body.query.bool.must.push({
      bool: {
        should: [
          {
            match: {
              docType: 'thread',
            },
          },
        ],
      },
    });
  } else if (t === 'document_article') {
    body.query.bool.must.push({
      match: {
        docType: 'document_article',
      },
    });
  }

  if (t === 'thread' && fid.length > 0) {
    const fidMatch = {
      bool: {
        should: fid.map((id) => {
          return {
            match: {
              mainForumsId: id,
            },
          };
        }),
      },
    };
    body.query.bool.must[0].bool.should[0].bool.must.push(fidMatch);
  }
  const authorMatch = {
    match: {
      uid,
    },
  };
  //添加只查看该用户的搜索结果
  body.query.bool.must[0].bool.should[0].bool.must.push(authorMatch);
  body.query.bool.must[0].bool.should[2].bool.must.push(authorMatch);

  return await client.search({
    index: indexName,
    type: 'documents',
    body,
  });
};

func.delete = async (docType, id) => {
  id = docType + '_' + id;
  return await client.delete({
    index: indexName,
    type: 'documents',
    id,
  });
};

// 更新帖子的专业信息
func.updateThreadForums = async (thread) => {
  return await client.updateByQuery({
    index: indexName,
    type: 'documents',
    body: {
      query: {
        bool: {
          // must = and
          must: [
            // 条件 tid = thread.tid
            { match: { tid: thread.tid } },
            {
              bool: {
                // should = or
                should: [
                  { match: { docType: 'post' } },
                  { match: { docType: 'thread' } },
                ],
              },
            },
          ],
        },
      },
      // 对匹配到的每一条数据执行此脚本
      script: {
        source:
          'ctx._source.tcId = ' +
          JSON.stringify(thread.tcId) +
          '; ctx._source.mainForumsId = ' +
          JSON.stringify(thread.mainForumsId),
      },
    },
  });
};

func.replaceSearchResultHTMLLink = (content = '') => {
  const nkcRender = require('./nkcRender');
  let html = content;
  const $ = cheerio.load(html);
  const body = $('body');
  nkcRender.replaceLinkInfo($, body[0]);
  html = body.html();
  return filterSearchContent(html);
};

module.exports = func;

function createMatch(property, query, boost, relation) {
  relation = relation === 'or' ? 'should' : 'must';
  const obj = {
    bool: {},
  };
  let keywords = query.split(' ').filter((k) => !!k);
  keywords = keywords.map((a) => {
    const obj = {
      match_phrase: {},
    };
    obj.match_phrase[property] = a;
    return obj;
  });
  obj.bool[relation] = keywords;
  obj.bool.boost = boost;
  return obj;
}

const func = {};

func.UserModel = {};
func.PostModel = {};

const esConfig = require("../config/elasticSearch");
const ES = require("elasticsearch");

const {address, port, analyzer, searchAnalyzer, indexName} = esConfig;
const client = new ES.Client({
  node: address + ":" + port,
  requestTimeout: 90000
});

func.client = client;

func.init = async () => {
  let indexExist = await client.indices.exists({
    index: indexName
  });
  if(!indexExist) {
    await client.indices.create({
      index: indexName,
      body: {
        mappings: {
          documents: {
            properties: {
              docType: { // 文档类型：thread，user，post
                type: "keyword"
              },
              uid: {
                type: "keyword"
              },
              username: {
                type: "text",
                analyzer: analyzer,
                search_analyzer: searchAnalyzer
              },
              description: {
                type: "text",
                analyzer: analyzer,
                search_analyzer: searchAnalyzer
              },
              pid: {
                type: "keyword"
              },
              toc: {
                type: "date"
              },
              title: {
                type: "text",
                analyzer: analyzer,
                search_analyzer: searchAnalyzer
              },
              abstractCN: {
                type: "text",
                analyzer: analyzer,
                search_analyzer: searchAnalyzer
              },
              abstractEN: {
                type: "text",
                analyzer: analyzer,
                search_analyzer: searchAnalyzer
              },
              content: {
                type: "text",
                analyzer: analyzer,
                search_analyzer: searchAnalyzer
              },
              mainForumsId: {
                type: "keyword"
              },
              digest: {
                type: "boolean"
              },
              tid: {
                type: "keyword"
              },
              aid: {
                type: "keyword"
              },
              keywordsCN: {
                type: "keyword"
              },
              keywordsEN: {
                type: "keyword"
              },
              authors: {
                type: "keyword"
              },
              voteUp: {
                type: "long"
              },
              voteDown: {
                type: "long"
              }
            }
          }
        }
      }
    });
  }
};


/*
* 更新数据，若数据不存在则创建
* @param {String} docType 文档类型：user, post, thread
* @param {Object} document 数据
* @author pengxiguaa 2019-5-17
* */
func.save = async (docType, document) => {
  const apiFunction = require("../nkcModules/apiFunction");
  const FundApplicationFormModel = require("../dataModels/FundApplicationFormModel");
  if(!["user", "post", "thread", "column", "columnPage", "resource"].includes(docType)) throwErr(500, "docType error");

  let aid = "";
  const {

    pid = "", toc = new Date(), tid = "", uid = "",
    mainForumsId = [],
    t = "", c = "",
    digest = false,
    abstractEn = "", abstractCn = "", keyWordsEn = [], keyWordsCn = [],
    authorInfos = [],
    voteUp = 0, voteDown = 0,
    description = "",
    username = ""

  } = document;

  if(docType === "thread") {
    const fundForm = await FundApplicationFormModel.findOne({tid});
    if(fundForm) aid = fundForm.code;
  }

  // 唯一ID，存在测更新body，不存在则新建数据。
  let id;

  if(docType === "thread") {
    id = `thread_${tid}`;
  } else if(docType === "post") {
    id = `post_${pid}`;
  } else if(docType === "user") {
    id = `user_${uid}`;
  } else if(docType === "column") {
    id = `column_${tid}`;
  } else if(docType === "columnPage") {
    id = `columnPage_${tid}`;
  } else if(docType === "resource") {
    id = `resource_${tid}`;
  }

  return await client.index({
    index: indexName,
    type: "documents",
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
      title: t,
      content: apiFunction.obtainPureText(c),
      abstractCN: abstractCn,
      abstractEN: abstractEn,
      keywordsCN: keyWordsCn,
      keywordsEN: keyWordsEn,
      authors: authorInfos.map(a => a.name),
      voteUp,
      voteDown
    }
  });
};

// 搜索
func.search = async (t, c, options) => {
  const SettingModel = require("../dataModels/SettingModel");
  const UserModel = require("../dataModels/UserModel");
  let {
    page=0, sortType,
    timeStart, timeEnd,
    fid, relation, sort,
    author, digest
  } = options;

  // 若只有一个关键词则默认or
  relation = (relation==="or" || c.split(" ").length < 2)?"or":"and";

  if(timeStart) {
    const {year, month, day} = timeStart;
    timeStart = new Date(`${year}-${month}-${day} 00:00:00`);
  }
  if(timeEnd) {
    const {year, month, day} = timeEnd;
    timeEnd = new Date(`${year}-${month}-${day} 23:59:59`);
  }

  page = Number(page);

  const {
    searchThreadList, searchPostList, searchAllList, searchUserList,
    searchColumnList, searchResourceList
  } = (await SettingModel.findById("page")).c;

  let size;
  if(t === "user") {
    size = searchUserList;
  } else if(t === "post") {
    size = searchPostList;
  } else if(t === "thread") {
    size = searchThreadList;
  } else if(t === "column") {
    size = searchColumnList;
  } else if(t === "resource") {
    size = searchResourceList;
  } else {
    size = searchAllList;
  }
  const body = {
    from: page*size,
    size,
    min_score: 1,
    sort: [],
    highlight: {
      pre_tags: ['<span style="color: #e85a71;">'],
      post_tags: ['</span>'],
      fields: {
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
      }
    }
  };
  body.query = {
    bool: {
      must: [ // 最后一个元素用于docType筛选
        {
          bool: {
            should: [ // 第1、2元素是关于文章回复的内容，后边会增加其他筛选条件
              {
                bool: {
                  must: [
                    {
                      match: {
                        docType: "thread"
                      }
                    },
                    {
                      bool: {
                        should: [
                          createMatch("title", c, 5, relation),
                          createMatch("content", c, 2, relation),
                          createMatch("pid", c, 100, relation),
                          createMatch("aid", c, 100, relation),
                          createMatch("authors", c, 80, relation),
                          createMatch("abstractEN", c, 50, relation),
                          createMatch("abstractCN", c, 50, relation),
                          createMatch("keywordsEN", c, 80, relation),
                          createMatch("keywordsCN", c, 80, relation),
                        ]
                      }
                    }
                  ]
                }
              },
              {
                bool: {
                  must: [
                    {
                      match: {
                        docType: "post"
                      }
                    },
                    {
                      bool: {
                        should: [
                          createMatch("title", c, 5, relation),
                          createMatch("content", c, 2, relation),
                          createMatch("pid", c, 100, relation),
                          createMatch("authors", c, 80, relation),
                          createMatch("abstractEN", c, 50, relation),
                          createMatch("abstractCN", c, 50, relation),
                          createMatch("keywordsEN", c, 80, relation),
                          createMatch("keywordsCN", c, 80, relation),
                        ]
                      }
                    }
                  ]
                }
              },
              {
                bool: {
                  must: [
                    {
                      match: {
                        docType: "user"
                      }
                    },
                    {
                      bool: {
                        should: [
                          createMatch("username", c, 6, relation),
                          createMatch("description", c, 3, relation),
                        ]
                      }
                    }
                  ]
                }
              },
              {
                bool: {
                  must: [
                    {
                      match: {
                        docType: "column"
                      }
                    },
                    {
                      bool: {
                        should: [
                          createMatch("username", c, 6, relation),
                          createMatch("description", c, 3, relation),
                        ]
                      }
                    }
                  ]
                }
              },
              {
                bool: {
                  must: [
                    {
                      match: {
                        docType: "columnPage"
                      }
                    },
                    {
                      bool: {
                        should: [
                          createMatch("title", c, 5, relation),
                          createMatch("content", c, 2, relation),
                        ]
                      }
                    }
                  ]
                }
              },
              {
                bool: {
                  must: [
                    {
                      match: {
                        docType: "resource"
                      }
                    },
                    {
                      bool: {
                        should: [
                          createMatch("title", c, 5, relation),
                          createMatch("content", c, 2, relation),
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  };
  if(t === "post") {
    body.query.bool.must.push({
      match: {
        docType: "post"
      }
    });
  } else if(t === "thread") {
    body.query.bool.must.push({
      match: {
        docType: "thread"
      }
    });
  } else if(t === "user") {
    body.query.bool.must.push({
      match: {
        docType: "user"
      }
    });
  } else if(t === "column") {
    body.query.bool.must.push({
      bool: {
        should: [
          {
            match: {
              docType: "column"
            }
          },
          {
            match: {
              docType: "columnPage"
            }
          }
        ]
      }
    });
  } else if(t === "resource") {
    body.query.bool.must.push({
      match: {
        docType: "resource"
      }
    });
  }

  if(!["user", "column"].includes(t)) {
    if(fid && fid.length > 0) {
      const fidMatch = {
        bool: {
          should: fid.map(id => {
            return {
              match: {
                mainForumsId: id
              }
            }
          })
        }
      };
      body.query.bool.must[0].bool.should[0].bool.must.push(fidMatch);
      body.query.bool.must[0].bool.should[1].bool.must.push(fidMatch);
    }

    if(author) {
      let uid = "";
      const user = await UserModel.findOne({usernameLowerCase: (author || "").toLowerCase()});
      if(user) uid = user.uid;
      const authorMatch = {
        match: {
          uid
        }
      };
      body.query.bool.must[0].bool.should[0].bool.must.push(authorMatch);
      body.query.bool.must[0].bool.should[1].bool.must.push(authorMatch);
      body.query.bool.must[0].bool.should[5].bool.must.push(authorMatch);
    }

    if(digest) {
      const digestMatch = {
        match: {
          digest: true
        }
      };
      body.query.bool.must[0].bool.should[0].bool.must.push(digestMatch);
      body.query.bool.must[0].bool.should[1].bool.must.push(digestMatch);
    }


    // 时间范围
    if(timeStart  || timeEnd) {
      const range = {
        toc: {}
      };
      if(timeEnd) {
        range.toc.lt = new Date(new Date(timeEnd).getTime() + 1000);
      }
      if(timeStart) {
        range.toc.gte = timeStart;
      }
      body.query.bool.filter = {range};
    }

    // 按时间排序 升序/降序
    if(sortType === "time") {
      const toc = {
        order: "desc"
      };
      if(sort === "asc") {
        toc.order = "asc";
      }
      body.sort.push({toc});
    } else {
      // 按匹配程度排序 升序/降序
      const _score = {
        order: "desc"
      };
      if(sort === "asc") {
        _score.order = "asc";
      }
      body.sort.push({_score});
    }
  }
  return await client.search({
    index: indexName,
    type: "documents",
    body
  });
};

func.delete = async (docType, id) => {
  id = docType + "_" + id;
  return await client.delete({
    index: indexName,
    type: "documents",
    id
  });
};


// 更新帖子的专业信息
func.updateThreadForums = async (thread) => {
  return await client.updateByQuery({
    index: indexName,
    type: "documents",
    body: {
      query: {
        bool: {
          // must = and
          must: [
            // 条件 tid = thread.tid
            {match: {tid: thread.tid}},
            {
              bool: {
                // should = or
                should: [
                  {match: {docType: "post"}},
                  {match: {docType: "thread"}}
                ]
              }
            }
          ]
        }
      },
      // 对匹配到的每一条数据执行此脚本
      script: {
        source: "ctx._source.mainForumsId = "+ JSON.stringify(thread.mainForumsId)
      }
    }
  });
}

module.exports = func;


function createMatch(property, query, boost, relation) {
  relation = relation==="or"?"should":"must";
  const obj = {
    bool: {}
  };
  let keywords = query.split(' ').filter(k => !!k);
  keywords = keywords.map(a => {
    const obj = {
      match_phrase: {}
    };
    obj.match_phrase[property] = a;
    return obj;
  });
  obj.bool[relation] = keywords;
  obj.bool.boost = boost;
  return obj
}

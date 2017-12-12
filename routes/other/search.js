const Router = require('koa-router');

const router = new Router();

router.get('/', async(ctx, next) => {
  ctx.template = 'interface_localSearch.pug';
  const {
    data,
    es,
    settings,
    query,
  } = ctx;
  const {q, type = 'content', page = 0} = query;
  const {perpage} = settings.paging;
  const {searchIndex} = settings.elastic;
  data.type = type;
  data.q = q;
  if(type === 'content') {
    data.result = await es.search({
      index: searchIndex,
      type: 'posts',
      body: {
        form: page * perpage,
        size: perpage,
        query: {
          function_score: {
            query: {
              dis_max: {
                p_breaker: 0.3,
                queries: [
                  simpleQuery('t', q, '50%', 3),
                  simpleQuery('c', q, '90%', 1),
                  simpleQuery('pid', q, '50%', 6)
                ]
              }
            },
            score_mode: 'sum',
            functions: [
              {field_value_factor: {
                field: 'count',
                factor: 0.03,
                modifier: 'none',
                missing: 0
              }},
              {field_value_factor: {
                field: 'creditvalue',
                factor: 0.002,
                modifier: 'none',
                missing: 0
              }}
            ],
            boost_mode: 'sum'
          }
        },
        highlight: {
          pre_tags:['<span style="background-color:red;">'],
          post_tags:['</span>'],
          fields:{
            t:{},
            c:{},
            username:{}
          }
        }
      }
    });
    console.log(data.result)
  }


});

function simpleQuery(field, query, minimum_should_match = '25%', boost = 1) {
  //generate queries with different term weight
  return {
    simple_query_string: {
      fields: [field],
      query,
      boost: boost || 1,
      default_operator: 'AND',
      minimum_should_match
    }
  }
}

module.exports = router;
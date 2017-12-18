const {indexPost, indexUser} = require('../../settings/elastic');

const {UserModel, PostModel} = require('../../dataModels');

const timeout = time => {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, time)
  })
};

const moveData = async (model, method) => {
  const length = await model.count({});
  console.log(`${length} datas in total`);
  const errors = [];
  let eLength = 0;
  let cursor = 0;
  const bulk = 100;
  let docs;
  const importing = async () => {
    console.log(`now importing ${cursor}~${cursor + bulk} datas`);
    docs = await model.find({}).skip(cursor).limit(bulk);
    await Promise.all(docs.map(async doc => {
      try {
        await method(doc)
      } catch(e) {
        errors.push(e)
      }
    }));
    console.log('done');
    cursor += bulk;
    if(errors.length > eLength) {
      console.log(`${errors.length - eLength} errors occured`);
      eLength = errors.length
    }
    if(cursor < length) {
      await timeout(100);
      await importing();
    }
  };
  await importing();
  for(e of errors) {
    console.log(e.stack)
  }
  console.log('all done');
  console.log(`${errors.length} occured`)
};


console.log('importing posts');
moveData(PostModel, indexPost)
  .then(() => {
    console.log('posts imported');
    console.log('importing users');
    return moveData(UserModel, indexUser)
  })
  .then(() => {
    console.log('users imported');
  })
  .catch(console.error.bind(console));
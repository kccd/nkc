const api = require('./nkcAPI');
const {columns, users} = require('./config');

describe(`测试专栏`, function() {
  for(const column of columns) {
    describe(`访问专栏「${column.displayName}-${column.columnId}」`, function() {
      for(const user of users) {
        it(`用户 「${user.username}-${user.uid}」`, function(done) {
          api(`/m/${column.columnId}`, 'GET', 'html', user.type)
            .expect(200, done)
        });
      }
    });
  }
});

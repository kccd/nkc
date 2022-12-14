const db = require("../dataModels");

(async function() {
  await db.UsersPersonalModel.updateMany(
    {},
    {
      $set: {
        numberOfVerifications: 0
      }
    }
  );
  process.exit(0);
})();

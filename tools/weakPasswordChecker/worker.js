const WeakPasswordResultModel = require("../../dataModels/WeakPasswordResultModel");

(async () => {
  await WeakPasswordResultModel.weakPasswordCheck();
  process.exit();
})();

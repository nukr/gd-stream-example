const { VariantRepository } = require("./postgres");
const { ElasticSearchRepository } = require("./es");
const { GoodDealRepository } = require("./gooddeal");

exports.VariantRepository = VariantRepository;
exports.ElasticSearchRepository = ElasticSearchRepository;
exports.GoodDealRepository = GoodDealRepository;

const { Transform } = require("stream");

function GoodDealRepository() {
  const options = {
    objectMode: true,
    transform(chunk, _encoding, callback) {
      const gdstocks = chunk.map(c => ({ ...c, gdstock: c.stock * 2 }));
      chunk.forEach(v => {
        this.products.add(v.product_id);
      });
      callback(null, gdstocks);
    },
    flush(callback) {
      console.log("fetchStock flush ...");
      callback();
    }
  };
  class FetchStock extends Transform {
    constructor(options) {
      super(options);
      this.products = new Set();
    }
  }
  return {
    fetchStock: new FetchStock(options)
  };
}

exports.GoodDealRepository = GoodDealRepository;

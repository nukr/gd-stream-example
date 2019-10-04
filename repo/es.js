const { Writable } = require("stream");

function ElasticSearchRepository(client) {
  const writeVariantStockToES = new Writable({
    objectMode: true,
    write(chunk, _encoding, callback) {
      const body = chunk.reduce((acc, c) => {
        acc.push({ index: { _index: "meepshop", _id: c.id } });
        acc.push(c);
        return acc;
      }, []);
      const bulkParams = {
        index: "meepshop",
        type: "variant",
        body
      };
      client.bulk(bulkParams).then(resp => {
        if (resp.errors) {
          return callback(errors);
        }
        callback();
      });
    }
  });
  return {
    writeVariantStockToES
  };
}

exports.ElasticSearchRepository = ElasticSearchRepository;

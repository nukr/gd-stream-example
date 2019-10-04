const { Pool } = require("pg");
const { Client } = require("@elastic/elasticsearch");
const {
  VariantRepository,
  GoodDealRepository,
  ElasticSearchRepository
} = require("./repo");

const pool = new Pool({
  connectionString: "postgres://postgres:postgres@localhost:5432/postgres"
});
const esclient = new Client({ node: "http://localhost:9200" });

const {
  getVariants,
  variantStockWriter,
  updateParentStocks
} = VariantRepository(pool);
const { fetchStock } = GoodDealRepository();
const { writeVariantStockToES } = ElasticSearchRepository(esclient);

main();

/**
 * main
 *
 * getVariants |> fetchGDStock
 *   |> writeToPostgres
 *   |> writeTOElasticSearch
 *
 * getVariants |> fetchGDStock.on('end', updateProductVariantInfo)
 */
function main() {
  pool.connect().then(pgClient => {
    const stream = getVariants(pgClient).pipe(fetchStock);
    stream.pipe(variantStockWriter);
    stream.pipe(writeVariantStockToES);
    stream.on(
      "end",
      onVariantWithGDStockProducerEnd(pgClient, updateParentStocks, stream)
    );
    // stream.on('error', handleError)
    // variantStockWriter.on('error', handleError)
    // writeVariantStockToES.on('error', handleError)
  });
}

function onVariantWithGDStockProducerEnd(client, updateParentStocks, stream) {
  return () => {
    updateParentStocks(Array.from(stream.products))
      .then(() => {
        return client.end();
      })
      .then(() => {
        console.log("client ended");
      });
  };
}

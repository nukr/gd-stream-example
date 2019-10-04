const { Readable, Writable } = require("stream");
const Cursor = require("pg-cursor");

function VariantRepository(pool) {
  function getVariants(client) {
    const cursor = client.query(
      new Cursor(`SELECT id, stock, product_id FROM variant`)
    );
    return new Readable({
      objectMode: true,
      read(size) {
        cursor.read(size, (err, rows) => {
          if (err) {
            this.emit("error", err);
          }
          if (rows.length === 0) {
            this.push(null);
            return;
          }
          this.push(rows);
        });
      },
      destroy(err, callback) {
        if (err) {
          console.error(err);
        }
        callback();
      }
    });
  }
  const variantStockWriter = new Writable({
    objectMode: true,
    write(chunk, _encoding, callback) {
      pool
        .query(updateVariantWithGDStockSQLStatement, [chunk])
        .then(() => {
          callback();
        })
        .catch(err => console.error(err));
    }
  });
  function updateParentStocks(parentIDs) {
    return pool.query(updateParentStocksSQLStatement, [parentIDs]);
  }
  return {
    getVariants,
    variantStockWriter,
    updateParentStocks
  };
}

const updateVariantWithGDStockSQLStatement = `
UPDATE variant as v
SET stock = new.gdstock
FROM (
  SELECT
    NULLIF(data->>'stock', '')::int as stock,
    NULLIF(data->>'gdstock', '')::int as gdstock,
    (data->>'id')::int as id
  FROM unnest($1::jsonb[]) as data) AS new
WHERE v.id = new.id
`;

const updateParentStocksSQLStatement = `
UPDATE product
SET stocks = new.stocks
FROM (
  SELECT SUM(stock) stocks, variant.product_id as id
  FROM variant, unnest($1::integer[]) as product_id
  WHERE variant.product_id = product_id.product_id
  GROUP BY variant.product_id
) as new
WHERE new.id = product.id
`;

exports.VariantRepository = VariantRepository;

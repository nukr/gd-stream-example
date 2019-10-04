#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE TABLE variant(id int, stock int, product_id int);

    WITH gen_ser AS (
      select generate_series(1, 10000) as num
    )
    INSERT INTO
      variant(id, stock, product_id)
      SELECT gen_ser.num, gen_ser.num, MOD(gen_ser.num, 1024) FROM gen_ser;

    CREATE TABLE product(id int, stocks int);

    INSERT INTO product(id, stocks) SELECT generate_series(0, 1023), 0;
EOSQL

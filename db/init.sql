CREATE TABLE products
(
    id   SERIAL,
    name TEXT NOT NULL,
    price  NUMERIC NOT NULL DEFAULT 0.00
);

insert into products (id, name, price)
values (1, 'marths_product', 999.99);

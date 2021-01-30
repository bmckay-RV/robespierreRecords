CREATE TABLE records_table (
    id serial primary key,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0.00,
    photo_link TEXT,
    listen_count numeric DEFAULT 0
);

INSERT INTO records_table (name, price, photo_link, listen_count)
VALUES ("name", "price", "photo_link", "listen_count");
CREATE TABLE records_table (
    id serial primary key,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0.00,
    photo TEXT,
    listen_count numeric DEFAULT 0
);
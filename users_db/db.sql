--CREATE TABLE users (
--  id INTEGER PRIMARY KEY AUTOINCREMENT,
--  username TEXT UNIQUE NOT NULL,
--  password TEXT NOT NULL
--);
--INSERT INTO users VALUES(1, 'dvildmonpsy', 'admin'); -->

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  image TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
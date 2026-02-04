const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("./database.db");

(async () => {
  const passwordPlain = "admin";
  const hash = await bcrypt.hash(passwordPlain, 10);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    ["dvildmonpsy", hash],
    function (err) {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Usuario creado con password hasheado");
      }
      db.close();
    },
  );
})();

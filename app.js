const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const db = new sqlite3.Database("./database.db");

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "super-secret-key",
    resave: false,
    saveUninitialized: false,
  }),
);
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Solo imágenes"));
    }
    cb(null, true);
  },
});

// ---------- ROUTE: LOGIN PAGE ----------
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// ---------- API: AUTH ----------
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Datos incompletos" });
  }
  console.log("req body :", req.body);
  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err) {
        console.log("user: ", user);
        console.log("user: ", err);
        return res.status(500).json({ error: "Error en la base de datos" });
      }

      if (!user) {
        console.log("user: ", user);
        console.log("user: ", err);
        return res.status(401).json({ error: "Usuario no encontrado" });
      }

      const valid = await bcrypt.compare(password, user.password);
      console.log("user - password: ", password);
      console.log("user - password - compare: ", user.password);
      console.log("user: ", user);
      if (!valid) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }

      // Sesión válida
      req.session.userId = user.id;
      req.session.username = user.username;
      console.log("success");
      res.json({ success: true, redirect: "/products/new" });

      //res.json({ success: true, message: "Autenticación correcta" });
    },
  );
});

// ---------- PROTECTED EXAMPLE ----------
app.get("/dashboard", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  res.send(`Bienvenido ${req.session.username}`);
});

// ---------- LOGOUT ----------
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

const requireAuth = require("./middlewares/auth");

app.get("/products/new", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "product_form.html"));
});

app.post("/api/products", requireAuth, upload.single("image"), (req, res) => {
  const { name, price, quantity } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !price || !quantity) {
    return res.status(400).send("Datos incompletos");
  }

  db.run(
    `INSERT INTO products (name, price, quantity, image, created_by)
       VALUES (?, ?, ?, ?, ?)`,
    [name, price, quantity, image, req.session.userId],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).send("Error al guardar");
      }
      res.redirect("/products/new");
    },
  );
});

// Server
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});

const express = require("express");
const path = require("path");
const cors = require("cors");
const routes = require("./routes/index");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// Middleware de navegación accesible
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.navigation = [
    { path: '/', label: 'Inicio' },
    { path: '/login', label: 'Login' },
    { path: '/registro', label: 'Registro' },
    { path: '/agendar', label: 'Agendar' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/citas', label: 'Citas' },
    { path: '/clientes', label: 'Clientes' }
  ];
  next();
});

app.use("/", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

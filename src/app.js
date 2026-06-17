require("dotenv").config({ quiet: true });

var path = require("path");
var express = require("express");
var session = require("express-session");
var connectMongo = require("connect-mongo");
var MongoStore = connectMongo.MongoStore || connectMongo.default || connectMongo;
var methodOverride = require("method-override");
var helmet = require("helmet");
var compression = require("compression");
var morgan = require("morgan");
var cookieParser = require("cookie-parser");

var authMiddleware = require("./middleware/auth");
var indexRoutes = require("./routes/indexRoutes");
var authRoutes = require("./routes/authRoutes");
var catwayRoutes = require("./routes/catwayRoutes");
var reservationRoutes = require("./routes/reservationRoutes");
var userRoutes = require("./routes/userRoutes");

var app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-a-remplacer",
    resave: false,
    saveUninitialized: false,
    store: process.env.MONGODB_URI
      ? MongoStore.create({
          mongoUrl: process.env.MONGODB_URI,
          collectionName: "sessions",
        })
      : undefined,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

app.use(authMiddleware.exposeUser);
app.use(authMiddleware.exposeFlash);
app.use(function (req, res, next) {
  res.locals.currentPath = req.path;
  res.locals.formatDate = function (date) {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeZone: "Europe/Paris",
    }).format(new Date(date));
  };
  res.locals.formatDateTimeInput = function (date) {
    var parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toISOString().slice(0, 16);
  };
  next();
});

app.use(indexRoutes);
app.use(authRoutes);
app.use(reservationRoutes);
app.use(catwayRoutes);
app.use(userRoutes);

app.use(function (req, res) {
  res.status(404).render("error", {
    title: "Page introuvable",
    message: "La page demandee n'existe pas.",
  });
});

app.use(function (error, req, res, next) {
  console.error(error);

  if (authMiddleware.wantsJson(req)) {
    return res.status(error.statusCode || 500).json({
      error: error.message || "Erreur serveur",
    });
  }

  return res.status(error.statusCode || 500).render("error", {
    title: "Erreur",
    message: error.message || "Erreur serveur",
  });
});

module.exports = app;

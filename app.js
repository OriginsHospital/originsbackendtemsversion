const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const createError = require("http-errors");
var session = require("express-session");
const { errorHandler } = require("./middlewares/errorHandlers");
const IndexRoute = require("./routes/index");
const RedisConnection = require("./connections/redis_connection");
const RedisStore = require("connect-redis").default;
const { v4: uuid4 } = require("uuid");
const cookieParser = require("cookie-parser");
const https = require("https");
const http = require("http");
const path = require("path");
const fs = require("fs");
const cron = require("node-cron");
const CronService = require("./services/cronService");
const morgan = require("morgan");

let redisStore = new RedisStore({
  client: RedisConnection._instance,
  prefix: "sess:"
});
class App {
  constructor() {
    this.app = express();
    this.httpServer = null;
    this.socketServer = null;
  }

  async startApp() {
    this.app.use(
      cors({
        origin: "http://localhost:3001",
        credentials: true
      })
    );
    this.app.use(cookieParser());

    morgan.token("req-body", req => {
      return JSON.stringify(req.body);
    });
    this.app.use(morgan(":method :url :status :response-time ms - :req-body"));

    this.app.use(bodyParser.json({ limit: "50mb" }));
    this.app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
    this.app.use(
      session({
        cookie: {
          httpOnly: true,
          maxAge: +process.env.IDLE_SESSION_TIMEOUT,
          secure: process.env.USE_HTTPS === "true",
          sameSite: process.env.USE_HTTPS === "true" ? "None" : "Lax"
        },
        resave: false,
        rolling: true,
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET_KEY,
        store: redisStore,
        name: process.env.SESSION_COOKIE_NAME,
        genid: function(req) {
          return `${uuid4()}${req.user}`;
        }
      })
    );

    // Set Cookies For testing
    this.app.get("/test", async (req, res, next) => {
      const hostHeader = req.headers["host"] || "Default Host";
      req.session.message = "Welcome To testing";
      // console.log(req.session);
      const forwardedFor = req.headers["x-forwarded-for"] || "::0";

      res.send({
        message: `Test Route Called From IP Address ${forwardedFor} and Host ${hostHeader}`
      });
    });

    // Check Cookies For testing
    this.app.get("/check-cookie", (req, res) => {
      const cookies = req.headers.cookie;
      if (cookies) {
        res.send(`Received Cookies: ${cookies}`);
      } else {
        res.send("No cookies received");
      }
    });

    await new IndexRoute(this.app).intializeRoutes();

    this.app.use(async (req, res, next) => {
      next(createError.NotFound("Page Not Found"));
    });

    this.app.use(errorHandler);
  }

  async listen() {
    const port = process.env.PORT || 3000;
    const useHttps = process.env.USE_HTTPS === "true";
    
    if (useHttps) {
      const sslServer = https.createServer(
        {
          key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
          cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem"))
        },
        this.app
      );
      this.httpServer = sslServer;
      sslServer.listen(port, err => {
        if (err) {
          throw new Error("Application Could not Start", err);
        }
        console.log(`Application Running on HTTPS Port ${port}`);
        
        // Initialize Socket.io server for Teams module
        try {
          const TeamsSocketServer = require("./socket/teamsSocketServer");
          this.socketServer = new TeamsSocketServer(this.httpServer);
          console.log("Teams Socket.io server initialized");
        } catch (socketError) {
          console.log("Socket.io not available:", socketError.message);
        }
      });
    } else {
      this.httpServer = http.createServer(this.app);
      this.httpServer.listen(port, err => {
        if (err) {
          throw new Error("Application Could not Start", err);
        }
        console.log(`Application Running on HTTP Port ${port}`);
        
        // Initialize Socket.io server for Teams module
        try {
          const TeamsSocketServer = require("./socket/teamsSocketServer");
          this.socketServer = new TeamsSocketServer(this.httpServer);
          console.log("Teams Socket.io server initialized");
        } catch (socketError) {
          console.log("Socket.io not available:", socketError.message);
        }
      });
    }
  }
  
  getHttpServer() {
    return this.httpServer;
  }
  
  getSocketServer() {
    return this.socketServer;
  }
}

module.exports = App;

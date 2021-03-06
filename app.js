// ===================================================================
/**
 * Module dependencies.
 */
const env = process.env.NODE_ENV || "local";
const express = require("express");
const path = require("path")
const compression = require("compression");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const swaggerJSDoc = require('swagger-jsdoc');

const app_config = require("./configurations/app_config");

// ===================================================================

const app = express();

/**
 * Connect to Database.
 */
mongoose
    .connect(
        app_config.database.connect_uri,
        { useNewUrlParser: true }
    )
    .then(() => {
        console.log("Database connection successful");
    })
    .catch(err => {
        console.error("Database connection error");
    });

/**
 * Swagger definition
 */
var swaggerDefinition = {
    info: {
        title: "Todo App server",
        version: "1.0.0",
        description: "Todo App Restful APIs"
    },
    host: "127.0.0.1:3001",
    basePath: "/"
};
var options = {
    swaggerDefinition,
    apis: ["./routes/*.js"]
};
var swaggerSpec = swaggerJSDoc(options);
app.use(express.static(path.join(__dirname, 'public')));
app.get("/swagger.json", function(request, response) {
    response.setHeader("Content-Type", "application/json");
    response.send(swaggerSpec);
});

/**
 * Parsers.
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * Compress responses that include a Cache-Control
 * header with the no-transform directive.
 */
app.use(compression());

/**
 * Cors.
 */
app.use(cors());

// ===================================================================

/**
 * Routes.
 */
app.use("/api/v1/", require("./routes/index"));

/**
 * 404 handler.
 */
app.get("*", function(req, res) {
    res.status(404).send({
        response: "Not Found",
        data: null,
        error: "Sorry, invalid request"
    });
});

/**
 * Dev error handler.
 */
if (env === "local") {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        return res.json({
            message: err.message,
            error: err
        });
    });
}

/**
 * Production error handler, no stacktraces leaked to user.
 */
if (env === "production") {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        return res.json({
            message: err.message,
            error: {}
        });
    });
}

// ===================================================================

/**
 * Listen on provided port, on all network interfaces.
 */
app.listen(app_config.server.port, function(err) {
    if (err) {
        console.log("Error starting server : ", err);
    } else {
        console.log("NODE_ENV : ", process.env.NODE_ENV);
        console.log("listening on port : ", app_config.server.port);
    }
});

module.exports = app;

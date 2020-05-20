/**
 * NAME: Qing Nie
 * DATE: Aug 21, 2019
 * SECTION/TA: AB/Tal
 *
 * This is app.js that serves the backend of the guitar e-commerce store and
 * connects with the "bf_guitars" database setup in setup.sql.
 * It takes 3 GET and 2 POST requests from the user. The 3 GET requests return
 * all product information based on category, single product info and all FAQs.
 * The 2 POST requests insert user's DIY order and feedbacks into the database
 * and return a success message to the user.
 */

"use strict";

const express = require("express");
const fs = require("fs");
const util = require("util");
const mysql = require("promise-mysql");
const multer = require("multer");

const readFile = util.promisify(fs.readFile);

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.use(multer().none());

/* the base of the API of all requests */
const API_BASE = "/guitar/";

/* error code for invalid params error */
const PARAMS_ERROR_CODE = 400;

/* error code for a server side error */
const SERVER_ERROR_CODE = 500;

/* error message for any server error */
const SERVER_ERROR = "Something went wrong on the server... please try again later.";

/* error message for an items not available error */
const ITEMS_NOT_AVAIL = "No items available.";

/* error message for a missing params error */
const MISSING_PARAM = "Missing one or more required parameters.";

/* error message for invalid parameters for guitar/product/:productid endpoint */
const INVALID_PARAM = "Invalid parameter, please provide a positive integer number.";

/* the success message for a successful feedback submission */
const FEEDBACK_MSG = "Thank you, we have received your feedback and will keep improving!";

/* the success message for a successful DIY request */
const DIY_MSG = "DIY request successful! We will make your DIY guitar soon!";

/**
 * Take a GET request on the endpoint "/guitar/product/:productid". Query the products
 * table and return the single product's info based on the product ID given. Send a 500
 * error if something goes wrong while connecting to the database. Send a 400 error if
 * no items are available with the given product ID or the given product ID is not a
 * positive integer.
 */
app.get(
  API_BASE + "product/:productid", prepareProductIDParams, getProductIDQuery,
  queryProducts, handleError, (req, res) => {
    res.type("json");
    res.send(res.locals.result);
  }
);

/**
 * Take a GET request on the endpoint "/guitar/faq". Read the info/faq.txt file and
 * return the parsed JSON format of all FAQs. Send a 500 error if something goes
 * wrong during file processing.
 */
app.get(API_BASE + "faq", getFAQ, handleError, (req, res) => {
  res.type("json");
  res.send(res.locals.faq);
});

/**
 * Take a GET request on the endpoint "/guitar/:category". Query the products table
 * in the database return all products' info based on the category given. Send a 400
 * error if no items of the given category are availale. Send a 500 error if something
 * goes wrong while connecting to the database.
 */
app.get(
  API_BASE + ":category", prepareCategoryParams, getCategoryQuery,
  queryProducts, handleError, (req, res) => {
    res.type("json");
    res.send(res.locals.result);
  }
);

/**
 * Take a POST request on the endpoint "/guitar/diy". Insert the user's specified
 * DIY request to the diy_orders table. Send a 500 error if something goes wrong
 * while connecting to the database. If successful, send a success message.
 */
app.post(
  API_BASE + "diy", prepareDIYParams, getDIYQuery, insert,
  handleError, (req, res) => {
    res.type("text");
    res.send(DIY_MSG);
  }
);

/**
 * Take a POST request on the endpoint "/guitar/diy". Insert the user's feedback
 * to the feedbacks table. Send a 500 error if something goes wrong
 * while connecting to the database. If successful, send a success message.
 */
app.post(
  API_BASE + "feedback", prepareFeedbackParams,
  getFeedbackQuery, insert, handleError, (req, res) => {
    res.type("text");
    res.send(FEEDBACK_MSG);
  }
);

/**
 * Prepare and validate the param obtained from the req object from the
 * /guitar/product/:productid endpoint and send the param to the next middleware function.
 * If missing the required parameter, throw a 400 error
 * @param {object} req - the request object when a user makes a request to
 *                       an API endpoint
 * @param {object} res - the response object controlling what to send back to the client side
 * @param {function} next - executes the next function in the chain of middleware functions
 */
function prepareProductIDParams(req, res, next) {
  let productID = req.params["productid"];
  if (Number.isInteger(productID) && productID > 0) {
    res.locals.errorCode = PARAMS_ERROR_CODE;
    next(new Error(INVALID_PARAM));
  } else {
    res.locals.params = [productID];
    next();
  }
}

/**
 * Prepare the params obtained from the req object from the
 * /guitar/:category endpoint and send the params to the next middleware function.
 * @param {object} req - the request object when a user makes a request to
 *                       an API endpoint
 * @param {object} res - the response object controlling what to send back to the client side
 * @param {function} next - executes the next function in the chain of middleware functions
 */
function prepareCategoryParams(req, res, next) {
  let category = req.params["category"];
  if (category === "all") {
    res.locals.params = [];
  } else {
    res.locals.params = [category];
  }
  next();
}

/**
 * Prepare and validate the params obtained from the req object from the
 * /guitar/diy endpoint and send the params to the next middleware function.
 * If missing one or more required parameters, throw a 400 error
 * @param {object} req - the request object when a user makes a request to
 *                       an API endpoint
 * @param {object} res - the response object controlling what to send back to the client side
 * @param {function} next - executes the next function in the chain of middleware functions
 */
function prepareDIYParams(req, res, next) {
  let type = req.body["type"];
  let neck = req.body["neck"];
  let body = req.body["body"];
  let color = req.body["color"];
  let engraving = parseInt(req.body["engrave"]);
  let engravingText;
  if (engraving === 1) {
    engravingText = req.body["engrave-text"];
  } else {
    engravingText = null;
  }
  if (type && neck && body && color && engraving >= 0) {
    res.locals.params = [type, neck, body, color, engraving, engravingText];
    next();
  } else {
    res.locals.errorCode = PARAMS_ERROR_CODE;
    next(new Error(MISSING_PARAM));
  }
}

/**
 * Prepare and validate the params obtained from the req object from the
 * /guitar/feedback endpoint and send the params to the next middleware function.
 * If missing one or more required parameters, throw a 400 error
 * @param {object} req - the request object when a user makes a request to
 *                       an API endpoint
 * @param {object} res - the response object controlling what to send back to the client side
 * @param {function} next - executes the next function in the chain of middleware functions
 */
function prepareFeedbackParams(req, res, next) {
  let name = req.body["name"];
  let feedback = req.body["feedback"];
  if (name && feedback) {
    res.locals.params = [name, feedback];
    next();
  } else {
    res.locals.errorCode = PARAMS_ERROR_CODE;
    next(new Error(MISSING_PARAM));
  }
}

/**
 * Insert new data into the database's diy_orders and feedbacks tables. If anything
 * goes wrong while connecting to the database, throw a 500 error.
 * @param {object} req - the request object when a user makes a request to
 *                       an API endpoint
 * @param {object} res - the response object controlling what to send back to the client side
 * @param {function} next - executes the next function in the chain of middleware functions
 */
async function insert(req, res, next) {
  let db;
  try {
    db = await getDB();
    await db.query(res.locals.qry, res.locals.params);
    db.end();
    next();
  } catch (err) {
    if (db) {
      db.end();
    }
    res.locals.errorCode = SERVER_ERROR_CODE;
    next(new Error(SERVER_ERROR));
  }
}

/**
 * Construct a SELECT query that selects the product information for the given
 * product and send the query to the next middleware function
 * @param {object} req - the request object when a user makes a request to
 *                       an API endpoint
 * @param {object} res - the response object controlling what to send back to the client side
 * @param {function} next - executes the next function in the chain of middleware functions
 */
function getProductIDQuery(req, res, next) {
  res.locals.qry = "SELECT * FROM products WHERE product_id=?";
  next();
}

/**
 * Construct a SELECT query that selects all products in a given category
 * and send the query to the next middleware function
 * @param {object} req - the request object when a user makes a request to
 *                       an API endpoint
 * @param {object} res - the response object controlling what to send back to the client side
 * @param {function} next - executes the next function in the chain of middleware functions
 */
function getCategoryQuery(req, res, next) {
  res.locals.qry = "SELECT * FROM products";
  if (res.locals.params.length > 0) {
    res.locals.qry += " WHERE category=?";
  }
  next();
}

/**
 * Construct a INSERT query that inserts a feedback to the feedbacks table
 * and send the query to the next middleware function
 * @param {object} req - the request object when a user makes a request to
 *                       an API endpoint
 * @param {object} res - the response object controlling what to send back to the client side
 * @param {function} next - executes the next function in the chain of middleware functions
 */
function getFeedbackQuery(req, res, next) {
  res.locals.qry = "INSERT INTO feedbacks(name, feedback) VALUES (?, ?)";
  next();
}

/**
 * Construct a INSERT query that inserts a DIY order to the diy_orders table
 * and send the query to the next middleware function
 * @param {object} req - the request object when a user makes a request to
 *                       an API endpoint
 * @param {object} res - the response object controlling what to send back to the client side
 * @param {function} next - executes the next function in the chain of middleware functions
 */
function getDIYQuery(req, res, next) {
  res.locals.qry = "INSERT INTO diy_orders(type, n_material, b_material, color, engraving, " +
                   "engraving_text) VALUES (?, ?, ?, ?, ?, ?)";
  next();
}

/**
 * Read the "info/faq.txt" file and obtain the FAQs in json format, and send the
 * json to the next middleware function. If something goes wrong during file processing,
 * throw a 500 error.
 * @param {object} req - the request object when a user makes a request to
 *                       an API endpoint
 * @param {object} res - the response object controlling what to send back to the client side
 * @param {function} next - executes the next function in the chain of middleware functions
 */
async function getFAQ(req, res, next) {
  try {
    let contents = await readFile("info/faq.txt", "utf-8");
    contents = contents.split("\n");
    let response = [];
    for (let i = 0; i < contents.length; i += 2) {
      let qna = {
        "q": contents[i],
        "a": contents[i + 1]
      };
      response.push(qna);
    }
    res.locals.faq = response;
    next();
  } catch (err) {
    res.locals.errorCode = SERVER_ERROR_CODE;
    next(new Error(SERVER_ERROR));
  }
}

/**
 * Query the database's products table to get product info based on the category,
 * and send the result to the next middleware function. If no items of the given
 * category are found, throw a 400 error. If something goes wrong while connecting
 * to the database, throw a 500 error.
 * @param {object} req - the request object when a user makes a request to
 *                       an API endpoint
 * @param {object} res - the response object controlling what to send back to the client side
 * @param {function} next - executes the next function in the chain of middleware functions
 */
async function queryProducts(req, res, next) {
  let db;
  try {
    db = await getDB();
    let qry = res.locals.qry;
    let placeholders = res.locals.params;
    let result;
    if (placeholders.length > 0) {
      result = await db.query(qry, placeholders);
    } else { // if the query does not consist of a placeholder
      result = await db.query(qry);
    }
    db.end();
    if (result.length === 0) {
      res.locals.errorCode = PARAMS_ERROR_CODE;
      next(new Error(ITEMS_NOT_AVAIL));
    } else {
      res.locals.result = result;
      next();
    }
  } catch (err) {
    if (db) {
      db.end();
    }
    res.locals.errorCode = SERVER_ERROR_CODE;
    next(new Error(SERVER_ERROR));
  }
}

/**
 * Construct and return a db object using the localhost and "bf_guitar" database
 * @return {object} db - the database object used to query the database
 */
async function getDB() {
  let db = await mysql.createConnection({
    host: "localhost",
    port: "8889",
    user: "root",
    password: "root",
    database: "bf_guitar"
  });
  return db;
}

/**
 * Middleware helper function that sends the error message as plain text to the user
 * @param {object} err - the error object thrown from the previous middleware function
 * @param {object} req - the request object when a user makes a request to
 *                       an API endpoint
 * @param {object} res - the response object controlling what to send back to the client side
 * @param {function} next - executes the next function in the chain of middleware functions
 */
function handleError(err, req, res, next) {
  res.type("text");
  let errorCode = res.locals.errorCode;
  res.status(errorCode).send(err.message);
}

const PORT = process.env.PORT || 8000;
app.listen(PORT);

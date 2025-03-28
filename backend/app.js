const express = require('express');
const path = require('path')
const mongoose = require('mongoose')
const postRouters = require("./router/posts")
const bodyParser = require('body-parser');

const { title } = require('process');

mongoose.connect("mongodb+srv://umuttozkardes:QQKN19ExH8tIXvvL@cluster0.1vwjv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("Connection is success")
  })
  .catch(() => {
    console.log("Connection is failed")
  })

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
});

app.use("/api/posts", postRouters)
app.use("/images", express.static(path.join("backend/images")));

module.exports = app;


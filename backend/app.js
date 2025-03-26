const express = require('express');

const mongoose = require('mongoose')
const postRouters = require("./router/posts")

const { title } = require('process');

mongoose.connect("mongodb+srv://umuttozkardes:QQKN19ExH8tIXvvL@cluster0.1vwjv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("Connection is success")
  })
  .catch(() => {
    console.log("Connection is failed")
  })

const app = express();

app.use("/api/posts",postRouters)

module.exports = app;


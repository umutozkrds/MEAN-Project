const express = require("express")
const bodyParser = require('body-parser');
const path = require('path')
const router = express.Router()
const bcrypt = require("bcrypt")

const User = require("../models/user");
const { error } = require("console");

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });

        user.save()
          .then(result => {
            res.status(201).json({
              message: "Created",
              result: result
            });
          })
          .catch(err => {
            res.status(500).json({
              error : err
            })
          })

      }
    );

});


module.exports = router;
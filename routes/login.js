const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { Users } = require("../models");
const crypto = require("crypto")

router.post("/", async (req, res) => {
  if (req.headers.authorization) {res.status(401).send({ errorMessage: "이미 로그인이 되어있습니다." });
    return;
    }
  const { nickname, password } = req.body;
  const user = await Users.findOne({where: {nickname}});
  const hashpass = crypto.pbkdf2Sync(password, user.salt, 50, 32, 'sha512').toString('base64')
  if (!user || hashpass !== user.password) {
    res.status(400).send({errorMessage: "닉네임 또는 패스워드가 틀렸습니다."});
    return;
    }
  res.send({token: jwt.sign({ userId: user.userId }, "seosoohyung-secret-key")});
});

module.exports = router;

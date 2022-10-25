const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Users } = require("../models");
const Joi = require('joi');
const crypto = require("crypto")

router.post("/", async (req, res) => {
  const schema = Joi.object({
    nickname: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    password: Joi.string().min(3).required(),
    confirm: Joi.ref('password')
  })
  let { nickname, password, confirm } = req.body;
  try{
    await schema.validateAsync(req.body)
  if (req.headers.authorization) {
    res.status(401).send({ errorMessage: "이미 로그인이 되어있습니다." });
    return;
  }  
  const existsUsers = await Users.findOne({where:{nickname}});
  if (existsUsers) {
    res.status(400).send({
    errorMessage: "중복된 닉네임입니다.",});
    return;
  }
} catch(e){
  return res.status(400).json({code:400, message: e.message})
}
  const salt = crypto.randomBytes(32).toString("base64");
  let hashpassword = crypto.pbkdf2Sync(password, salt, 50, 32, 'sha512').toString("base64")
  password = hashpassword
  const user = new Users({ nickname, password, salt });
  await user.save();
  res.status(201).send({});
});

module.exports = router;

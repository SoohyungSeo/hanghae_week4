const express = require("express")
const signup = require("./signup");
const login = require("./login");
const posts = require("./posts");
const comments = require("./comments");
const router = express.Router();


router.use("/posts", posts); //게시글
router.use("/comments", comments); //댓글
router.use("/signup", signup); //회원가입
router.use("/login", login);  //로그인

module.exports = router



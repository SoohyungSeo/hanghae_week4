const express = require("express"); //**
const router = express.Router();
const { Comments } = require("../models");
const middleware = require("../middlewares/auth-middleware");

router.post("/:postId", middleware, async (req, res) => {
  const { postId } = req.params;
  const userId = res.locals.user.userId;
  const nickname = res.locals.user.nickname;
  const { content } = req.body;
  if (content === "") {
    res.json({ message: "댓글 내용을 입력해주세요" });
  } else {
    const createcommt = await Comments.create({ nickname, userId, content, postId });
    res.json({ message: "댓글이 생성되었습니다." });
  }
});

router.get("/:postId", async (req, res) => {
  const { postId } = req.params;
  const commtList = await Comments.findAll({where:{postId},
  attributes: { exclude:['postId']}
  })
  res.json({ commtlist: commtList });
});

router.put("/:commentId", middleware, async (req, res) => {
  const { commentId } = req.params;
  const userId = res.locals.user.userId;
  const commtpass = await Comments.findOne({where:{commentId}});
  const { content } = req.body;
  if (userId===commtpass.userId){
    await Comments.update({content},{where:{commentId}});
    res.json({ "message": "댓글을 수정하였습니다" });
  } else {
    res.status(400).json({"message":"사용자가 아닙니다."})
  }
});

router.delete("/:commentId",middleware, async (req, res) => {
  const { commentId } = req.params;
  const userId = res.locals.user.userId;
  const commtpass = await Comments.findOne({where:{commentId}});
  if (commtpass){
    if (userId===commtpass.userId){
      await Comments.destroy({where:{commentId}});
      res.json({ "message": "댓글을 삭제하였습니다" });
    } else {
      res.status(400).json({"message":"사용자가 아닙니다."})
    }
  } else {
    res.status(401).json({"message":"삭제할 댓글이 없습니다"})
  }  
});

module.exports = router;

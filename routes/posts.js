const express = require("express"); 
const router = express.Router(); 
const middleware = require("../middlewares/auth-middleware");
const { Op } = require("sequelize");
const { Posts, sequelize } = require("../models");
const { Likes } = require("../models");

/**
 * @swagger
 *  /posts:
 *    post:
 *      tags:
 *      - post
 *      description: 게시판 작성
 *      produces:
 *      - application/json
 *      requestBody:
 *        - in: body
 *          title: category
 *          required: false
 *          schema:
 *            type: integer
 *            description: Created
 *      responses:
 *       200:
 *        description: 게시물 작성 성공
 */
router.post("/", middleware, async (req, res) =>{
    const { title, content } = req.body;
    const userId = res.locals.user.userId;
    const nickname = res.locals.user.nickname;
    const createdposts = await Posts.create({ nickname, userId, title, content, likes:0});      
    res.json({"message" : "게시글 작성에 성공하였습니다."})
});

router.get("/", async (req, res) =>{
    const borderList = await Posts.findAll({
    attributes:['postId','userId','nickname','title','createdAt','updatedAt','likes']
    });
    borderList.sort((a,b) => b.createdAt - a.createdAt)
    res.json({ borderlist : borderList })
});

router.get("/like", middleware, async(req,res)=>{
    const userId = res.locals.user.userId;
    const [results, metadata] = await sequelize.query(   
        "SELECT * FROM Posts JOIN Likes ON Likes.postId = Posts.postId" // Posts 라는 테이블을 Likes에 연결하겠다. Likes.postId와 Posts.postId 는 같게 해준것. orderby 정렬할때 쓰는거참고
    )
    const Likepost =[]
    results.map((like) => {like.userId === userId ? Likepost.push({
        postId: like.postId, 
        userId: like.userId,
        nickname: like.nickname,
        title: like.title,
        createdAt:like.createdAt,
        updatedAt: like.updatedAt,
        likes: like.likes
        })
        : false
    })
    let Likelist = Likepost.sort((a,b) => b.likes - a.likes)
    res.json({Likelist})         
})

router.get("/:postId", async (req,res)=>{  
    const {postId} = req.params;
    const objBorder = await Posts.findOne({where:{postId}})
    res.json({detail : objBorder});
});

router.put("/:postId", middleware,async (req,res) => {
    const {postId} = req.params; 
    const userId = res.locals.user.userId;
    const userpass = await Posts.findOne({where:{postId}});
    const {title, content} = req.body;
    if (userId === userpass.userId){
        await Posts.update({title, content},{where:{postId}});
        res.json({"message": "게시글을 수정하였습니다."})
    } else {
        res.json({"message":"게시글 작성자가 아닙니다."})
    }
});

router.delete("/:postId",middleware, async (req, res) => { 
    const {postId} = req.params; 
    const userId = res.locals.user.userId;
    const userpass = await Posts.findOne({where:{postId}});
    if (userId === userpass.userId){
        await Posts.destroy({where:{postId}}); 
        res.json({"message": "게시글을 삭제하였습니다."})
    } else {
        res.json({"message":"게시글 작성자가 아닙니다."})
    }
});


router.put("/:postId/like", middleware, async (req,res)=>{
    const {postId} = req.params; 
    const userId = res.locals.user.userId;
    let result = {};
    const likeuser = await Likes.findOne({where:{postId, userId}});
    if (likeuser){
    await Likes.destroy({where:{postId, userId}});
    await Posts.decrement({likes:1}, {where:{postId}});
    result = false; 
    }
    else{
    await Likes.create({postId, userId});
    await Posts.increment({likes:1},{where:{postId}});
    result = true;
    }
    res.json({result});
});

module.exports = router;


var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const Todo = require("../models/Todo");

const privateKey = process.env.JWT_PRIVATE_KEY;

// router.use(function (req, res, next) {
//   console.log(req.header("Authorization"));
//   if (req.header("Authorization")) {
//     try {
//       req.payload = jwt.verify(req.header("Authorization"), privateKey, {
//         algorithms: ["RS256"],
//       });
//     } catch (error) {
//       return res.status(401).json({ error: error.message });
//     }
//   } else {
//     return res.status(401).json({ error: "Unauthorized" });
//   }
//   next();
// });

router.get("/", async function (req, res, next) {
  const todos = await Todo.find().where("author").equals(req.payload.id).exec();
  return res.status(200).json({ todos: todos });
});

router.get("/:todoId", async function (req, res, next) {
  const todo = await Todo.findOne()
    .where("_id")
    .equals(req.params.todoId)
    .exec();
  return res.status(200).json(todo);
});

router.post("/", async function (req, res, next) {
  const todo = new Todo({
    title: req.body.title,
    description: req.body.description,
    author: req.payload.id,
    complete: req.body.complete,
    completedOn: req.body.completedOn
  });

  await todo
    .save()
    .then((savedTodo) => {
      return res.status(201).json({
        id: savedTodo._id,
        title: savedTodo.title,
        description: savedTodo.description,
        author: savedTodo.author,
        isComplete: savedTodo.isComplete,
        completedOn: savedTodo.completeOn
      });
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
});

router.delete('/:todoId', async function (req,res) {
  const { id } = req.params;
  
  await Todo.findOneAndDelete({
    _id: id, 
    $or: [{author: req.user._id}, {profile: req.user.username}]
    })
    .exec((err, todo) => {
      if(err)
        return res.status(500).json({code: 500, message: 'There was an error deleting the todo', error: err})
      res.status(200).json({code: 200, message: 'Todo deleted', deletedTodo: todo})
    });
})

router.patch('/:todoId', async (req, res) => {
  try {
    const update = await domainModel.updateOne(
      { _id: req.params.id },
      { $set: { complete: !complete } }
    );
    res.json(update);
  } catch (err) {
    res.json({ message: err });
  }
});


module.exports = router;

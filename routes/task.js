const express = require("express");
const Task = require("../models/task.js");
const mongoose = require("../dataBase/mongoose.js");
const router = new express.Router();
const auth = require("../middleware/auth.js");

router.post("/", auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      owner: req.user._id,
    });
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
  }
});

router.get("/", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    sort[parts[0] ] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    const tasks = await Task.find({ owner: req.user._id, ...sort, ...match })
      .limit(parseInt(req.query.limit))
      .skip(parseInt(req.query.skip))
    res.send(tasks);
  } catch (err) {
    res.status(500).send({
      error: err.message,
    });
    console.log(err);
  }
});

router.get("/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const taskId = await Task.findById({
      _id: _id,
      owner: req.user._id,
    });

    if (!taskId) {
      return res.status(404).send();
    }
    res.send(taskId);
  } catch (err) {
    res.status(500).send({
      error: err.message,
    });
  }
});

router.patch("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const alllowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    alllowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    res.status(404).send({
      error: "Invalid updates!",
    });
  }

  try {
    const task = await Task.findById({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    res.send(task);
  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findByIdAndDelete({
      _id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send({
        error: "Invalid Id",
      });
    }

    res.send(task);
  } catch (err) {
    res.status(500).send({
      error: err.message,
    });
  }
});

module.exports = router;

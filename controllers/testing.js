const router = require("express").Router();
const User = require("../models/user");
const Task = require("../models/task");
const Project = require("../models/project");

router.post("/reset", async (req, res) => {
  await User.deleteMany({});
  await Task.deleteMany({});
  await Project.deleteMany({});

  res.status(204).end();
});

module.exports = router;

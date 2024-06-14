const tasksRouter = require("express").Router();
const Task = require("../models/task");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const getTokenFrom = require("../utils/getTokenFrom");
const Project = require("../models/project");

tasksRouter.get("/", async (req, res) => {
  const tasks = await Task.find({});
  res.json(tasks);
});

tasksRouter.get("/user", async (req, res) => {
  const tasks = await Task.find({}).populate("user", {
    username: 1,
    projects: 1,
    tasks: 1,
  });

  res.json(tasks);
});

tasksRouter.get("/project", async (req, res) => {
  const tasks = await Task.find({}).populate("project", {
    title: 1,
    description: 1,
    tasks: 1,
  });

  res.json(tasks);
});

tasksRouter.post("/", async (req, res) => {
  const body = req.body;

  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET);
  if (!decodedToken.id) {
    return res.status(401).json({ error: "token invalid" });
  }

  const user = await User.findById(decodedToken.id);

  const task = new Task({
    title: body.title,
    status: body.status,
    importance: body.importance,
    due_date: body.due_date,
    description: body.description,
    user: user._id,
  });

  const result = await task.save();
  user.tasks = user.tasks.concat(result._id);
  user.save();
  res.status(201).json(result);
});

const updateValue = async (req, func) => {
  const body = await Task.findById(req.params.id);

  const task = [...body];
  func(req, task);

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, task, {
    new: true,
  });
  return updatedTask;
};

tasksRouter.patch("/user/:id/:userId", async (req, res) => {
  const updatedTask = updateValue(
    req,
    (req, task) => (task.user = req.params.userId)
  );

  res.json(updatedTask);
});

tasksRouter.patch("/project/:id/:projectId", async (req, res) => {
  const updatedTask = updateValue(
    req,
    (req, task) => (task.project = req.params.projectId)
  );

  res.json(updatedTask);
});

tasksRouter.patch("/status/:id/:status", async (req, res) => {
  const updatedTask = updateValue(
    req,
    (req, task) => (task.status = req.params.status)
  );

  res.json(updatedTask);
});

tasksRouter.put("/:id", async (req, res) => {
  const body = await Task.findById(req.params.id);

  const task = [...body];

  const updatedTask = Task.findByIdAndUpdate(req.params.id, task, {
    new: true,
  });

  res.json(updatedTask);
});

tasksRouter.delete("/:id", async (req, res) => {
  const task = await Task.findById(req.params.id);
  const user = await User.findById(task.user);
  let index = user.tasks.indexOf(req.params.id);

  if (index > -1) {
    user.tasks.splice(index, 1);
    user.save();
  }

  const project = await Project.findById(task.project);
  index = project.tasks.indexOf(req.params.id);

  if (index > -1) {
    project.tasks.splice(index, 1);
    project.save();
  }

  await Task.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

module.exports = tasksRouter;

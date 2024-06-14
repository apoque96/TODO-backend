const projectsRouter = require("express").Router();
const Project = require("../models/project");
const Task = require("../models/task");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const getTokenFrom = require("../utils/getTokenFrom");

projectsRouter.get("/", async (req, res) => {
  const projects = await Project.find({});
  res.json(projects);
});

projectsRouter.get("/users", async (req, res) => {
  const projects = await Project.find({}).populate("users", {
    username: 1,
    projects: 1,
    tasks: 1,
  });
  res.json(projects);
});

projectsRouter.get("/tasks", async (req, res) => {
  const projects = await Project.find({}).populate("tasks", {
    title: 1,
    status: 1,
    importance: 1,
    due_date: 1,
    description: 1,
    project: 1,
  });
  res.json(projects);
});

projectsRouter.post("/", async (req, res) => {
  const body = req.body;

  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }

  const user = await User.findById(decodedToken.id);

  const project = new Project({
    title: body.title,
    description: body.description,
    tasks: body.tasks || [],
    users: user._id,
  });

  const result = await project.save();
  user.projects = user.projects.concat(result._id);
  await user.save();

  res.status(201).json(result);
});

projectsRouter.patch("/user/:id/:userId", async (req, res) => {
  const project = await Project.findById(req.params.id);
  const user = await User.findById(req.params.userId);

  const userAlreadyInProject = project.users.includes(user.id);
  if (userAlreadyInProject) {
    res.status(401).end();
    return;
  }

  project.users = project.users.concat(req.params.userId);
  user.projects = user.projects.concat(req.params.id);

  await project.save();
  await user.save();

  res.json(project);
});

projectsRouter.patch("/task/:id/:taskId", async (req, res) => {
  const project = await Project.findById(req.params.id);
  const task = await Task.findById(req.params.taskId);

  const userIsInProject = project.users.includes(task.user);
  const taskAlreadyInProject = project.tasks.includes(task.id);
  if (!userIsInProject || taskAlreadyInProject) {
    res.status(401).end();
    return;
  }

  project.tasks = project.tasks.concat(req.params.taskId);
  task.project = req.params.id;

  await project.save();
  await task.save();

  res.json(project);
});

projectsRouter.delete("/:id", async (req, res) => {
  await Task.deleteMany({ project: req.params.id });
  await Project.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

projectsRouter.patch("/removeTasks/:id", async (req, res) => {
  const project = await Project.findById(req.params.id);
  const tasks = await Task.find({ project: req.params.id });

  project.tasks = [];
  await project.save();
  tasks.forEach((task) => {
    task.project = null;
    task.save();
  });

  res.status(204).end();
});

module.exports = projectsRouter;

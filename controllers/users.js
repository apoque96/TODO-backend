const bcrypt = require("bcryptjs");
const usersRouter = require("express").Router();
const User = require("../models/user");
const Task = require("../models/task");
const Project = require("../models/project");

usersRouter.get("/", async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

usersRouter.get("/tasks", async (req, res) => {
  const users = await User.find({}).populate({
    path: "tasks",
    populate: {
      path: "project",
    },
  });

  res.json(users);
});

usersRouter.get("/projects", async (req, res) => {
  const users = await User.find({}).populate("projects", {
    title: 1,
    description: 1,
    tasks: 1,
  });

  res.json(users);
});

usersRouter.post("/", async (req, res) => {
  const { username, password } = req.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    passwordHash,
  });

  const savedUser = await user.save();
  res.status(201).json(savedUser);
});

usersRouter.delete("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  const tasks = await Task.find({ user: user.id });

  tasks.forEach(async (task) => {
    task.user = null;
    await task.save();
  });

  const projects = user.projects;
  projects.forEach(async (projectId) => {
    const project = await Project.findById(projectId);
    const index = project.users.indexOf(req.params.id);

    if (index > -1) {
      project.users.splice(index, 1);
      if (project.users.length === 0 && project.tasks.length === 0) {
        await Project.findByIdAndDelete(project.id);
      } else {
        await project.save();
      }
    }
  });

  await User.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

module.exports = usersRouter;

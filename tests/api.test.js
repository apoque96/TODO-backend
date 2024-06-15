const { test, describe, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const assert = require("node:assert");
const app = require("../app");
const api = supertest(app);
const User = require("../models/user");
const Task = require("../models/task");
const Project = require("../models/project");

describe("Creates users, projects and tasks", async () => {
  const user = {
    username: "apoque96",
    password: "RandomPassword",
  };

  beforeEach(async () => {
    await api.post("/api/testing/reset");
    await api
      .post("/api/users")
      .send(user)
      .expect(201)
      .expect("Content-Type", /application\/json/);
  });

  test("Can create a user", async () => {
    const users = await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(users.body.length, 1);
  });

  test("Can't create a user with the same username", async () => {
    const anotherUser = {
      username: "apoque96",
      password: "Hello",
    };

    await api
      .post("/api/users")
      .send(anotherUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const users = await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(users.body.length, 1);
  });

  test("Can create task", async () => {
    const task = {
      title: "Learn MySql",
      status: "Pending",
      importance: "Medium",
      due_date: "2024-08-01",
      description: "Database",
    };

    const token = await api
      .post("/api/login")
      .send(user)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const tokenString = `Bearer ${token.body.token}`;
    await api
      .post("/api/tasks")
      .send(task)
      .set({ authorization: tokenString })
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const tasks = await api
      .get("/api/tasks")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(tasks.body.length, 1);
  });

  test("Task can only be created with valid token", async () => {
    const task = {
      title: "Learn MySql",
      status: "Pending",
      importance: "Medium",
      due_date: "2024-08-01",
      description: "Database",
    };

    await api
      .post("/api/tasks")
      .send(task)
      .set({ authorization: "I'm not a valid token" })
      .expect(400);
  });

  test("Can create projects", async () => {
    const project = {
      title: "Learning",
      description: "All tasks related to learning something",
    };

    const token = await api
      .post("/api/login")
      .send(user)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const tokenString = `Bearer ${token.body.token}`;
    await api
      .post("/api/projects")
      .send(project)
      .set({ authorization: tokenString })
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const projects = await api
      .get("/api/projects")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(projects.body.length, 1);
  });

  test("Project can only be created with valid token", async () => {
    const project = {
      title: "Learning",
      description: "All tasks related to learning something",
    };

    await api
      .post("/api/projects")
      .send(project)
      .set({ authorization: "I'm not a valid token" })
      .expect(400);
  });
});

describe("Functionality", async () => {
  beforeEach(async () => {
    await api.post("/api/testing/reset");

    const initialUsers = [
      {
        username: "apoque96",
        password: "RandomPassword",
      },
      {
        username: "Random user",
        password: "CamiloIsThaBest",
      },
      {
        username: "xXxgamerxXx",
        password: "BeMyWaifu",
      },
    ];

    const initialTasks = [
      {
        title: "Learn MySql",
        status: "Pending",
        importance: "Medium",
        due_date: "2024-08-01",
        description: "Database",
      },
      {
        title: "Learn Networking",
        status: "Pending",
        importance: "Low",
        due_date: "2024-12-31",
        description: "Networking",
      },
      {
        title: "Learn C#",
        status: "Cancelled",
      },
      {
        title: "Finish Paper Mario TTYD",
        description: "It's a great game",
      },
      {
        title: "Declare my love to Carla",
        status: "In Progress",
        importance: "High",
        description: "I love her",
      },
      {
        title: "Get ice cream",
        status: "Completed",
        due_date: "2024-03-01",
        description: "Yummy",
      },
      {
        title: "Play Fortnite",
        status: "Completed",
        importance: "High",
        description: "I like it",
      },
      {
        title: "Play COD",
        status: "Completed",
        importance: "High",
        description: "I like it",
      },
      {
        title: "Learn trick-shots",
        status: "In Progress",
        importance: "High",
        due_date: "2024-06-15",
        description: "impontant 4 my gamimg carrer",
      },
    ];

    const initialProjects = [
      {
        title: "Learning",
        description: "All tasks related to learning something",
      },
      {
        title: "Gaming",
        description: "We R Gaming",
      },
    ];

    for (let i = 0; i < initialUsers.length; i++) {
      await api
        .post("/api/users")
        .send(initialUsers[i])
        .expect(201)
        .expect("Content-Type", /application\/json/);
    }

    const tokens = [
      await api
        .post("/api/login")
        .send(initialUsers[0])
        .expect(200)
        .expect("Content-Type", /application\/json/),
      await api
        .post("/api/login")
        .send(initialUsers[1])
        .expect(200)
        .expect("Content-Type", /application\/json/),
      await api
        .post("/api/login")
        .send(initialUsers[2])
        .expect(200)
        .expect("Content-Type", /application\/json/),
    ];

    const tokensStrings = [
      `Bearer ${tokens[0].body.token}`,
      `Bearer ${tokens[1].body.token}`,
      `Bearer ${tokens[2].body.token}`,
    ];

    for (let i = 0; i < 4; i++) {
      await api
        .post("/api/tasks")
        .send(initialTasks[i])
        .set({ authorization: tokensStrings[0] })
        .expect(201)
        .expect("Content-Type", /application\/json/);
    }

    for (let i = 4; i < 6; i++) {
      await api
        .post("/api/tasks")
        .send(initialTasks[i])
        .set({ authorization: tokensStrings[1] })
        .expect(201)
        .expect("Content-Type", /application\/json/);
    }

    for (let i = 6; i < initialTasks.length; i++) {
      await api
        .post("/api/tasks")
        .send(initialTasks[i])
        .set({ authorization: tokensStrings[2] })
        .expect(201)
        .expect("Content-Type", /application\/json/);
    }

    await api
      .post("/api/projects")
      .send(initialProjects[0])
      .set({ authorization: tokensStrings[0] })
      .expect(201)
      .expect("Content-Type", /application\/json/);
    await api
      .post("/api/projects")
      .send(initialProjects[1])
      .set({ authorization: tokensStrings[2] })
      .expect(201)
      .expect("Content-Type", /application\/json/);
  });

  test("User, tasks and projects created", async () => {
    const users = await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(users.body.length, 3);

    const tasks = await api
      .get("/api/tasks")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(tasks.body.length, 9);

    const projects = await api
      .get("/api/projects")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(projects.body.length, 2);
  });

  test("A user can be added to a project", async () => {
    const user = await User.findOne({ username: "xXxgamerxXx" });
    const project = await Project.findOne({ title: "Learning" });

    const updatedProject = await api
      .patch(`/api/projects/user/${project.id}/${user.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const updatedUser = await User.findOne({ username: "apoque96" });
    assert.strictEqual(updatedProject.body.users.includes(user.id), true);
    assert.strictEqual(
      updatedUser.projects.includes(updatedProject.body.id),
      true
    );
  });

  test("A user can't be added if it's already in the project", async () => {
    const user = await User.findOne({ username: "apoque96" });
    const project = await Project.findOne({ title: "Learning" });

    await api.patch(`/api/projects/user/${project.id}/${user.id}`).expect(401);
  });

  test("A task can be added to project", async () => {
    let project = await Project.findOne({ title: "Learning" });
    let task = await Task.findOne({ title: "Learn MySql" });
    project = await api
      .patch(`/api/projects/task/${project.id}/${task.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    task = await Task.findOne({ title: "Learn MySql" });

    assert.strictEqual(project.body.tasks.includes(task.id), true);
    assert.strictEqual(task.project.toString(), project.body.id);
  });

  test("A task can't be added if it's already added", async () => {
    let project = await Project.findOne({ title: "Learning" });
    let task = await Task.findOne({ title: "Learn MySql" });
    project = await api
      .patch(`/api/projects/task/${project.id}/${task.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    await api
      .patch(`/api/projects/task/${project.body.id}/${task.id}`)
      .expect(401);
  });

  test("A task can be moved to another project", async () => {
    let previousProject = await Project.findOne({ title: "Learning" });
    let task = await Task.findOne({ title: "Learn MySql" });
    await api
      .patch(`/api/projects/task/${previousProject.id}/${task.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    let currentProject = await Project.findOne({ title: "Gaming" });
    const user = await User.findOne({ username: "apoque96" });
    currentProject = await api
      .patch(`/api/projects/user/${currentProject.id}/${user.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    currentProject = await api
      .patch(`/api/projects/task/${currentProject.body.id}/${task.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    previousProject = await Project.findOne({ title: "Learning" });
    task = await Task.findOne({ title: "Learn MySql" });

    assert.strictEqual(task.project.toString(), currentProject.body.id);
    assert.notStrictEqual(task.project.toString(), previousProject.id);
    assert.strictEqual(previousProject.tasks.includes(task.id), false);
  });
});

after(async () => {
  await mongoose.connection.close();
});

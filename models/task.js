const mongoose = require("mongoose");
const STATUS = require("../utils/status");
const IMPORTANCE = require("../utils/importance");

const taskSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 5,
  },
  status: {
    type: String,
    default: STATUS.PENDING,
  },
  importance: {
    type: String,
    default: IMPORTANCE.NONE,
  },
  due_date: {
    type: Date,
    default: Date.now(),
  },
  description: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
});

taskSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;

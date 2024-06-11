const mongoose = require("mongoose");

const projectSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 5,
  },

  description: String,
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
});

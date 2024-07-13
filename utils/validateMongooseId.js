const mongoose = require("mongoose");

const isValidId = ( id ) => {
    const isValidId = mongoose.Types.ObjectId.isValid(id);

if (!isValidId) {
    throw new Error("mongoose.invalid.id");
  }
}

module.exports = isValidId
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const petSchema = mongoose.Schema({
    name: String,
    age: Number,
    species: {
        breed: String,
    }
});

const Pet = mongoose.model('Pet', petSchema);

module.exports = {Pet};

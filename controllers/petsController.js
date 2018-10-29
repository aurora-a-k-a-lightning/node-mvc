const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const {Pet} = require('../models/pets');

// This is the index page.
// This can be used for CORS or same-origin via the `res.format()` function
function index(req, res) {
    Pet.find().then(function(pets) {
        res.format({
            text: function() {
                res.send(pets);
            },
            html: function() {
                res.render('pets/index', {pets: pets});
            },
            json: function() {
                res.json(pets);
            },
            default: function() {
                res.status(406).send('Not Acceptable');
            }
        });
    });
}

// This is the create page.
// This is only used for same-origin
function create(req, res) {
    res.render('pets/create');
}

// This is the add action.
// This can be used for CORS or same-origin via the `res.format()` function
function add(req, res) {
    Pet.create(req.body, function(err, pet) {
        res.format({
            text: function() {
                res.send(pet);
            },
            html: function() {
                res.redirect(`/pets/read/${pet._id}`);
            },
            json: function() {
                res.json(pet);
            },
            default: function() {
                res.status(406).send('Not Acceptable');
            }
        });
    });
}

// This is the read page.
// This can be used for CORS or same-origin via the `res.format()` function
function read(req, res) {
    Pet.findOne(req.params.id).then(function(pet) {
        res.format({
            text: function() {
                res.send(pet);
            },
            html: function() {
                res.render('pets/read', {pet: pet});
            },
            json: function() {
                res.json(pet);
            },
            default: function() {
                res.status(406).send('Not Acceptable');
            }
        });
    });
}

// This is the update page. 
// This is only used for same-origin
function update(req, res) {
    res.render('pets/update');
}

// This is the save action.
// This can be used for CORS or same-origin via the `res.format()` function
function save(req, res) {
    Pet.findOneAndUpdate(req.params.id, req.body, { new: true }).then(function(pet) {
        res.format({
            text: function() {
                res.send(pet);
            },
            html: function() {
                res.redirect(`/pets/read/${pet._id}`);
            },
            json: function() {
                res.json(pet);
            },
            default: function() {
                res.status(406).send('Not Acceptable');
            }
        });
    });
}

// This is the delete page. 
// This can be used for CORS or same-origin via the `res.format()` function
function destroy(req, res) {
    Pet.findOneAndRemove(req.params.id).then(function(pet) {
        res.format({
            text: function() {
                res.send('Pet destroyed.');
            },
            html: function() {
                res.redirect('/pets');
            },
            json: function() {
                res.json({message: 'Pet destroyed.'});
            },
            default: function() {
                res.status(406).send('Not Acceptable');
            }
        });
    })
}

const PetsController = {
    index: index, 
    create: create,
    read: read,
    update: update,
    destroy: destroy,
    save: save,
    add: add
};

module.exports = PetsController;
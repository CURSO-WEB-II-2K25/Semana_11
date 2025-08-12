const mongoose = require('mongoose');

const schCategories = new mongoose.Schema({
    CategoryID: {type: String,r},
    CategoryName: {type: String, required: true},
    Description: {type: String, required: true},
    Image: {type: Buffer, required: true},
    Mime: {type: String, required: true},
});

const Categories = mongoose.model("Categories", schCategories);

module.exports = Categories;
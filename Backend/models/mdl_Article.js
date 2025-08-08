const mongoose = require('mongoose');

const CategoriesSchema = new mongoose.Schema({
    CategoryID: String,
    CategoryName: String,
    Description: String,
    Image: Buffer,
    Mime: String
});

const Categories = mongoose.model('Categories', CategoriesSchema);

module.exports = Categories;
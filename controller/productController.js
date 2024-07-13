const Product = require("../model/productModel");
const asyncHandler = require("express-async-handler");
const isValidId = require("../utils/validateMongooseId")
const slugify = require("slugify");


const createProduct = asyncHandler( async (req, res) => {
    if (req.body.titile) {
        req.body.slug = slugify(req.body.titile);
    }
    const product = await Product.create(req.body);
    res.json(product);
});

const getProducts = asyncHandler(async (req, res) => {
    // filtering the result using query String
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach( (e) => delete queryObj[e]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(lt|gte|lte|gt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // sort the result

    if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        query = query.sort(sortBy);
    } else {
        query = query.sort('createdAt');
    }

    // limiting the fields
    if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        query = query.select(fields);
    } else {
        query = query.select('-__v');
    }

    // pagination

    const page = req.query.page
    const limit = req.query.limit
    const skip = (page - 1) * limit
    
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
        const productCount = await Product.countDocuments();
        if (skip > productCount) throw new Error("Page limit is exceeded");
    }

    const products = await query;
    if (products) {
        res.status(200);
        res.json(products);
    }
});

const getProduct = asyncHandler( async (req, res) => {
    
    isValidId(req.params.id);

    const user = await Product.findById(req.params.id);
    if (!user) {
        res.status(400)
        throw new Error("user.invalid.id");
    } else {
        res.status(200);
        res.json(user);
    }
});

const updateProduct = asyncHandler( async (req, res) => {

    isValidId(req.params.id);
    let product = await Product.findById(req.params.id)
    if (!product) {
        throw new Error("product.invalid.id");
    }

    if (req.body.titile) {
        req.body.slug = slugify(req.body.titile);
    }
    product = await Product.findOneAndUpdate({ _id: product.id}, req.body, { new: true });
    res.json(product);
});

const DeleteProduct = asyncHandler( async (req, res) => {

    isValidId(req.params.id);
    let product = await Product.findById(req.params.id)
    if (!product) {
        throw new Error("product.invalid.id");
    }

    product = await Product.findOneAndDelete({ _id: product.id});
    res.json(product);
});


module.exports = { createProduct, getProduct, getProducts, updateProduct, DeleteProduct }
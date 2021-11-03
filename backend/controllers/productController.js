const Product = require('../models/Product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');

//Create new Product => /api/v1/product/new

exports.newProduct = catchAsyncErrors(async(req, res, next) =>
{
    req.body.user = req.user.id;

    const product = await Product.create(req.body)
    res.status(201).json({
        success:true,
        product
    })
})

// Get all products => /api/vi/products?keyword=laptop
exports.getProducts = catchAsyncErrors(async (req, res, next) =>
{
    const resPerPage = 7;
    const productCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(), req.query)
                        .search()
                        .filter()
                        .pagination(resPerPage)

    const products = await apiFeatures.query;
    res.status(200).json({
        sucess:true,
        productCount,
        products
    })
})


//Get single prodict details => /api/v1/admin/product/:id
//Search single product => /api/v1/admin/product?keyword=laptop

exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => 
{
    const product = await Product.findById(req.params.id);


    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    res.status(200).json({
        success: true,
        product
    })

})


//Update product by id => /api/v1/admin/product/:id
exports.updateProduct = catchAsyncErrors(async(req, res, next) =>
{

    let product = await Product.findById(req.params.id);

    if(!product)
    {
        return next(new ErrorHandler('Product not found', 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body)

    res.status(200).json({
        success: true,
        product
    })
})

//Delete product by id => /api/v1/admin/product/:id
exports.deleteProduct = catchAsyncErrors(async(req, res, next) =>
{
    let product = await Product.findById(req.params.id);
    
    if(!product)
    {
        return next(new ErrorHandler('Product not found', 404));
    }

    await product.deleteOne();

    res.status(200).json({
        sucess:true,
        message: 'product has been deleted'
    })

})

//Create new review => /api/v1/review
exports.createProductReview = catchAsyncErrors(async(req,res,next) => {
    const {rating, comment, productId} = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comments: comment
    }

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    )

    if(isReviewed)
    {
        product.reviews.forEach(review => {
            if(review.user.toString() === req.user._id.toString())
            {
                review.comments = comment;
                review.rating = rating;
            }
        })
    }else
    {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }

    //calculating the average rating after review
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success: true
    })

})

//Get product reviews => /api/v1/reviews/:id
exports.getProductReviews = catchAsyncErrors(async(req,res,next) => {
    const product = await Product.findById(req.params.id);


    res.status(200).json({
        success:true,
        reviews: product.reviews
    })
})

//Delete product reviews => /api/v1/reviews/:id
exports.deleteProductReviews = catchAsyncErrors(async(req,res,next) => {
    const product = await Product.findById(req.query.productId);
    

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString())

    const numOfReviews = reviews.length

    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length


    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    },
    {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success:true
    })
}) 
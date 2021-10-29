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
    const resPerPage = 4;
    const productCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(), req.query)
                        .search()
                        .filter()
                        .pagination(resPerPage)

    const products = await apiFeatures.query;
    res.status(200).json({
        sucess:true,
        count: products.length,
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
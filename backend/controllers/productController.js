const Product = require('../models/Product');

//Create new Product => /api/v1/product/new

exports.newProduct = async(req, res, next) =>
{
    const product = await Product.create(req.body)
    res.status(201).json({
        success:true,
        product
    })
}

// Get all products => /api/vi/products
exports.getProducts = async (req, res, next) =>
{
    const products = await Product.find();
    res.status(200).json({
        sucess:true,
        count: products.length,
        products
    })
}


//Get single prodict details => /api/v1/admin/product/:id

exports.getSingleProduct = async (req, res, next) =>
{
    const product = await Product.findById(req.params.id);

    if(!product)
    {
        return res.status(404).json({
            sucess: false,
            message: 'product not found'
        })
    }

    res.status(200).json({
        success:true,
        product
    })
}


//Update product by id => /api/v1/admin/product/:id
exports.updateProduct = async(req, res, next) =>
{

    let product = await Product.findById(req.params.id);

    if(!product)
    {
        return res.status(404).json({
            sucess: false,
            message: 'product not found'
        })
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body)

    res.status(200).json({
        success: true,
        product
    })
}

//Delete product by id => /api/v1/admin/product/:id
exports.deleteProduct = async(req, res, next) =>
{
    let product = await Product.findById(req.params.id);
    
    if(!product)
    {
        return res.status(404).json({
            sucess: false,
            message: 'product not found'
        })
    }

    await product.deleteOne();

    res.status(200).json({
        sucess:true,
        message: 'product has been deleted'
    })

}
const Order = require('../models/Order')
const Product = require('../models/Product')

const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')

// Create a new order => /api/v1/order/new
exports.newOrder = catchAsyncErrors(async(req,res,next) => {
    const { 
        orderItems,
        shippingInfo,
        itemsPrice,
        taxAmount,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxAmount,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(200).json({
        success:true,
        order
    })
})

//Get single order => /api/v1/order/:id
exports.getSingleOrder = catchAsyncErrors(async(req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if(!order)
    {
        return next(new ErrorHandler('No order found with this ID', 404))
    }

    res.status(200).json({
        success: true,
        order
    })
})

//Get logged in user orders => /api/v1/orders/me
exports.myOrders = catchAsyncErrors(async(req, res, next) => {
    const order = await Order.find({user: req.user.id})

    if(!order)
    {
        return next(new ErrorHandler('No orders found for you', 404))
    }

    res.status(200).json({
        success: true,
        totalOrders: order.length,
        order
    })
})

//Get all orders => /api/v1/admin/orders
exports.allOrders = catchAsyncErrors(async(req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    if(!orders)
    {
        return next(new ErrorHandler('No orders found for you', 404))
    }

    res.status(200).json({
        success: true,
        totalAmount: totalAmount,
        orders
    })
})


//Update/Process orders => /api/v1/admin/orders/:id
exports.updateOrder = catchAsyncErrors(async(req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(order.orderStatus === 'Delivered')   
    {
        return next(new ErrorHandler('Your order has already been delivered',400))
    }

    if(!order)
    {
        return next(new ErrorHandler('No orders found for you', 404))
    }

    order.orderItems.forEach(async item => {
        await updateStock(item.product, item.quantity)
    })

    order.orderStatus = req.body.status,
    order.deliveredAt = Date.now();

    await order.save();

    res.status(200).json({
        success: true
    })
})

//Delete order => /api/v1/order/:id
exports.deleteOrder = catchAsyncErrors(async(req, res, next) => {
    const order = await Order.findById(req.params.id)

    if(!order)
    {
        return next(new ErrorHandler('No order found with this ID', 404))
    }

    await order.remove()

    res.status(200).json({
        success: true
    })
})

async function updateStock(id, quantity)
{
    const product = await Product.findById(id);

    product.stock = product.stock - quantity;

    await product.save({ validateBeforeSave: false});
}
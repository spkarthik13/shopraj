const User = require('../models/User')

const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middlewares/catchAsyncErrors')
const sendToken = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')

// Register a user => /api/v1/register
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const {name, email, password} = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: 'test_public.id',
            url: 'test@url.com'
        }
    })

    // const token = user.getJwtToken();

    // res.status(201).json({
    //     success:true,
    //     token

        sendToken(user, 200, res)
    })

// Login User => /api/v1/login
exports.loginUser = catchAsyncError(async(req, res, next) => {
    const {email, password} = req.body;

    //Checks if email and password is entered by user
    if(!email || !password) {
        return next(new ErrorHandler('Please enter email & password', 400))
    }

    //Finding user in Database
    const user = await User.findOne({ email }).select('+password')

    if(!user)
    {
        return next(new ErrorHandler('Invalid Email or password', 401));
    }

    //Checks if password is correct
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched)
    {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    sendToken(user, 200, res)
})

//Logout user => /api/v1/logout 
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly:true
    })
    
    res.status(200).json({
        success:true,
        message: 'Logged Out'
    })
})

//Forgot Password => /api/v1/password/forgot

exports.forgotPassword = catchAsyncError(async(req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if(!user)
    {
        return next(new ErrorHandler('User not found with this email', 404));
    }

    //Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave : false })

    //Create reset password URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset link is as follows: \n\n${resetUrl}\n\nIf you have not requested this email, then please ignore it.`

    try {
        await sendEmail({
            email: user.email,
            subject: 'ShopRaj Password Recovery',
            message
        })

        res.status(200).json({
            success:true,
            message: `Email sent to ${user.email}`
        })

    } catch(error)
    {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave : false });
        return next(new ErrorHandler(error.message, 500))
    }

})
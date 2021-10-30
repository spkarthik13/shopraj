const User = require('../models/User')

const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middlewares/catchAsyncErrors')
const sendToken = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const crypto = require('crypto');

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

exports.forgotPassword = catchAsyncErrors(async(req, res, next) => {
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

//Reset password => /api/v1/password/reset/:token

exports.resetPassword = catchAsyncErrors(async(req, res, next) => {
    //Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        resetPasswordToken, resetPasswordExpire: {
            $gt: Date.now()
        }
    })

    if(!user)
    {
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
    }

    if(req.body.password !== req.body.confirmpassword) {
        return next(new ErrorHandler('Password does not match', 400))
    }

    //Setup new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);

})

// Get currently logged in user details  => /api/v1/me
exports.getUserProfile = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
})

//Update / change password => /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    //Check previous user password
    const isMatched = await user.comparePassword(req.body.oldpassword)

    if(!isMatched)
    {
        return next(new ErrorHandler('The old password entered is incorrect', 400));
    }

    user.password = req.body.password;
    await user.save();

    sendToken(user, 200, res);
})

//Update user profile => /api/v1/me/update
exports.updateProfile = catchAsyncErrors(async(req,res,next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    //Update avatar : TODO

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})

// Admin Routes

//Get all users => /api/v1/admin/users
exports.allUsers = catchAsyncErrors(async(req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success:true,
        size: users.length,
        users
    })

})


//Get User details => /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findById(req.params.id);

    if(!user)
    {
        return next(new ErrorHandler(`user is not found with id: ${req.params.id}`))
    }

    res.status(200).json({
        success:true,
        user
    })
})

//Update user profile => /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async(req,res,next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    //Update avatar : TODO

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        user
    })
})


//Delete user => /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findById(req.params.id);

    if(!user)
    {
        return next(new ErrorHandler(`user is not found with id: ${req.params.id}`))
    }

    //Remove avatar from cloudinary - TODO

    await user.remove();

    res.status(200).json({
        success:true
    })
})
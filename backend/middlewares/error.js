const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV === 'DEVELOPMENT') 
    {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        })
    }

    if(process.env.NODE_ENV === 'PRODUCTION')
    {
        let error = {...err}

        error.message = err.message;

        //Wrong mongoose object id error
        if(err.name === 'CastError') 
        {
            const message = `Resource not found. Invalid: ${err.path}`
            error = new ErrorHandler(message, 400);
        }

        //Handling mongoose validation error
        if(err.name === 'ValidationError')
        {
            const message = Object.values(err.errors).map(value => value.message);
            error = new ErrorHandler(message, 400);
        }

        
        //Handling mongoose duplicate key errors
        if(err.code === 11000)
        {
            console.log(err);
            error = new ErrorHandler(err, 400);
        }

        //Handling wrong JWT error
        if(err.name === 'JsonWebTokenError')
        {
            const message = 'JSON Web Token is invalid, please try again'
            error = new ErrorHandler(message, 400);
        }

        //Handling expired JWT error
        if(err.name === 'JsonWebTokenError')
        {
            const message = 'JSON Web Token is expired, please try again'
            error = new ErrorHandler(message, 400);
        }

        res.status(err.statusCode).json({
            success:false,
            error: error.message
        })

    }


}
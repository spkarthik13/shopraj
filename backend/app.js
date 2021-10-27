const express = require('express');
const app = express();

const errorMiddleware = require('./middlewares/error')

app.use(express.json());

//Import all routes
const products = require('./routes/productRoutes')

app.use('/api/v1', products)

//Middleware to handle errors
app.use(errorMiddleware);

module.exports = app;

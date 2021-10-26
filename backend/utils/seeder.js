const Product = require('../models/Product');
const dotenv = require('dotenv');
const connectDatabase = require('../config/database');

const products = require('../data/product.json');

//Setting dotenv file
dotenv.config({path: 'backend/config/config.env'})

connectDatabase();

const seedProducts = async () =>
{
    try{
        await Product.deleteMany();
        console.log('Products are deleted');

        await Product.insertMany(products);
        console.log('All dummy products added');

        process.exit();

    }catch(error)
    {
        console.log(error.message);
        process.exit();
    }
}

seedProducts();
const express = require('express')
const router = express.Router();


const {getProducts, newProduct, getSingleProduct, updateProduct, deleteProduct, createProductReview, getProductReviews, deleteProductReviews} = require('../controllers/productController')

const { isAuthenticatedUser, authorizeRoles} = require('../middlewares/authUser')

router.route('/products').get(getProducts);

router.route('/products/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);

router.route('/product/:id').get(getSingleProduct);

router.route('/admin/product/:id')
.put(isAuthenticatedUser,authorizeRoles('admin'), updateProduct)
.delete(isAuthenticatedUser,authorizeRoles('admin'), deleteProduct);

router.route('/review').put(isAuthenticatedUser, createProductReview)
router.route('/reviews/:id').get(isAuthenticatedUser, getProductReviews)
router.route('/reviews').delete(isAuthenticatedUser, deleteProductReviews)



module.exports = router;
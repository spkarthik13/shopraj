import React, { Fragment, useState, useEffect } from 'react'
import MetaData from './layouts/MetaData'
import Pagination  from 'react-js-pagination'

import { useDispatch, useSelector } from 'react-redux'
import { getProducts  } from '../actions/productActions'

import Product from './products/Product';
import Loader from './layouts/Loader';
import { useAlert } from 'react-alert';

const Home = () => {

    const [currentPage, setCurrentPage] = useState(1)
    const alert = useAlert();
    const dispatch = useDispatch();

    const { loading, products, error, productsCount, resPerPage } = useSelector(state => state.products)

    useEffect(() => {

        if (error) {
            return alert.error(error)
        }

        dispatch(getProducts(currentPage));

    }, [dispatch, alert, error, currentPage])

    function setCurrentPageNo(pageNumber)
    {
        setCurrentPage(pageNumber)
    }
    
    return (
        <Fragment>
            {loading ? <Loader /> : (
                <Fragment>
                    <MetaData title={'shopRaj'}/>
                    <h1 id="products_heading">Latest Products</h1>

                    <section id="products" className="container mt-5">
                        <div className="row">
                            {products && products.map(product => (
                                <Product key={product._id} product = {product}/>
                            ))}
                            
                        </div>
                    </section>

                    {resPerPage <= productsCount && (
                     <div className="d-flex justify-content-center mt-5">
                         <Pagination
                             activePage={currentPage}
                             itemsCountPerPage={resPerPage}
                             totalItemsCount={productsCount}
                             onChange={setCurrentPageNo}
                             nextPageText={'Next'}
                             prevPageText={'Prev'}
                             firstPageText={'First'}
                             lastPageText={'Last'}
                             itemClass="page-item"
                             linkClass="page-link"
                          />
                     </div>

                    )}

                </Fragment>
            )}
            
        </Fragment>
    )
}

export default Home

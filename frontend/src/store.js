import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import { productReducer, productDetailsReducer } from './reducers/productReducers';

const reducer = combineReducers({
    products: productReducer,
    productDetails: productDetailsReducer
})

//All the data we will put into state when we start the app. Cart information will be loaded here.
let initialState = {  }

const middleware = [thunk];
const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)));

export default store;
import { Header } from "./components/layouts/Header";
import Footer from "./components/layouts/Footer";
import Home from "./components/Home";
import {BrowserRouter as Router, Route} from 'react-router-dom'
import ProductDetails from "./components/products/ProductDetails";

function App() {
  return (
    <Router>
      <div className="App">
        <Header/>
        <div className="container container-fluid">
          <Route path= "/" component={Home} exact />
          <Route path= "/product/:id" component={ProductDetails} exact />
        </div>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;

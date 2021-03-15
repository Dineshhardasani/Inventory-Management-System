import logo from './logo.svg';
import './App.css';
import React, { Component } from 'react'
import { Navbar, NavbarBrand } from 'reactstrap';
import { Route,Switch } from 'react-router-dom';
import Home from './components/HomeComponent';
import AddProduct from './components/AddProductComponent';
import Order from './components/OrderComponent';
import CancelOrder from './components/CancelOrderComponent';
import UpdateStock from './components/UpdateStockComponent';
import AddCustomer from './components/AddCustomerComponent';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  render() {
    return (
      <Switch>
        <Route exact path='/' component={Home}/>
        <Route exact path='/Add-product' component={AddProduct}/>
        <Route exact path='/Update-stock' component={UpdateStock} />
        <Route exact path='/Add-customer' component={AddCustomer} />
        <Route exact path='/Add-order' component={Order} />
        <Route exact path='/Cancel-order' component={CancelOrder} />
       

      </Switch>
    );
  }
}

export default App;
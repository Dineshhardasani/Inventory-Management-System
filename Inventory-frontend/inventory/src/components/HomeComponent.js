import { Nav, Navbar, NavbarBrand, NavbarToggler, Collapse, NavItem, Jumbotron } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';
import Header from './HeaderComponent';
import {GetData} from './Services/GetData';
import {PostData} from './Services/PostData';
import { array } from 'prop-types';

class Home extends Component {
    constructor(props) {
        super(props);
        this.toggleNav = this.toggleNav.bind(this);
        this.state = {
          isNavOpen: false,
          redirect: false,
          products:null,
          orders:null
        };
    }
    async componentDidMount(){
        console.log("started");
        await GetData("view/product")
                        .then(result=>{
                            this.setState({ products: result});
                        })
                        .catch(err=>{
                            console.log(err);
                        });
        await GetData("view/orders")
                        .then(result=>{
                            console.log(result);
                            this.setState({ orders: result})
                        })
                        .catch(err=>{
                            console.log(err);
                        });
    }
    toggleNav() {
      this.setState({
        isNavOpen: !this.state.isNavOpen
      });
    }
    render() {
        var productsArr =[];
        var OrdersArr =[];
        if(this.state.products){
            console.log(this.state.products);
            var obj=JSON.parse(JSON.stringify(this.state.products));
            for(var i in obj)
                productsArr.push(obj[i]);
        }
        if(this.state.orders){
            console.log(this.state.orders);
            var obj=JSON.parse(JSON.stringify(this.state.orders));
            for(var i in obj)
                OrdersArr.push(obj[i]);
        }
        return(
            <div>
                <Header />
                <Jumbotron>
                    <div className="container">
                        <div className="row row-header">
                            <div className="col-12 col-sm-6">
                                <h1>Inventory Management</h1>
                                <p>Please Manage your inventory here!</p>
                            </div>
                        </div>
                    </div>
                </Jumbotron>
                <center>
                <h>Products</h>
                <table align="center" border="1">
                    <tr>
                        <th><h>Product Name</h></th>
                        <th><h>Stock</h></th>
                        <th><h>warehouse</h></th>
                    </tr>
                    {productsArr.map(product=>
                    
                        <tr>
                            <td><h>{product.name}</h></td>
                            <td><h>{product.stock}</h></td>
                            <td><h>{product.warehouse}</h></td>
                        </tr>
                    
                    )}
                </table>
                <br/>
                <h>Orders</h>
                <table align="center" border="1">
                     <tr>
                         <th><h>Order Id</h></th>
                        <th><h>Customer Name</h></th>
                        <th><h>Product Name</h></th>
                        <th><h>quantity</h></th>
                        <th><h>status</h></th>
                    </tr>
                    {OrdersArr.map(order=>

                        <tr>
                            <td><h>{order.id}</h></td>
                            <td><h>{order.name}</h></td>
                            <td><h>{order.product_name}</h></td>
                            <td><h>{order.quantity}</h></td>
                            <td><h>{order.status}</h></td>
                        </tr>
                
                    )}
                </table>
                </center>
            </div>

        );
    }
}
export default Home;
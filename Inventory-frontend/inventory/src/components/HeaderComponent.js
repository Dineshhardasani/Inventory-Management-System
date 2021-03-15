import { Nav, Navbar, NavbarBrand, NavbarToggler, Collapse, NavItem, Jumbotron } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
          isNavOpen: false,
          isLogged:true
        };
        this.toggleNav = this.toggleNav.bind(this);
    }
    componentWillMount(){
      if(sessionStorage.getItem("userData")){
        this.setState({
          isLogged:true
        })
      }
      else{
        this.setState({
          isLogged:false
        })
      }
    }
    toggleNav() {
      this.setState({
        isNavOpen: !this.state.isNavOpen
      });
    }
    render() {
        let isLogged=0;
        if(this.state.isLogged==true)
           isLogged=1;
        return(
            <div>
                <Navbar dark color="primary" expand="md">
                    <div className="container">
                        <NavbarToggler onClick={this.toggleNav} />
                        <NavbarBrand className="mr-auto"  href="/"><img src='assets/images/logo.png' height="30" width="41" alt='Inventory Management' /></NavbarBrand>
                        <Collapse isOpen={this.state.isNavOpen} navbar>
                            <Nav navbar dark className="ml-auto">
                            <NavItem>
                                <NavLink className="nav-link"  to='/'>Home</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to='/Add-product'>Add Product</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to='/Update-stock'>Update Stock</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to='/Add-customer'>Add Customer</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to='/Add-order'>Add Order</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to='/Cancel-order'>Cancel Order</NavLink>
                            </NavItem>
                            </Nav>
                        </Collapse>
                    </div>
                </Navbar>
            </div>
        );
    }
}
export default Header;
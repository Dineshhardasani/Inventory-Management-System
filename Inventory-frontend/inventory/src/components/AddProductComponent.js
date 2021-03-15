import { Nav, Navbar, NavbarBrand, NavbarToggler, Collapse, NavItem, Jumbotron } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import React, { Component } from 'react';
import {PostData} from './Services/PostData';
import {Redirect} from 'react-router-dom';
import Header from './HeaderComponent';

class AddProduct extends Component {
    constructor(props) {
        super(props);
        this.state = {
          name:'',
          stock:'',
          warehouse:'',
          redirect:false,
          error:'',
          status:''
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
          [name]: value
        });
    }
    async handleSubmit(event) {
        this.setState({
          error:"",
          status:"Please Wait....."
        })
        if(!this.state.name && !this.state.stock && !this.state.warehouse){
          this.setState({
            error:"Please Enter Valid Data",
            status:""
          })
        }
        else{
          PostData('add/product',this.state).then((result)=>{
            let responseJson=result;
            if(responseJson.error){
              this.setState({
                error:responseJson.error,
                status:""
              })
            }
            else{
               responseJson=JSON.stringify(responseJson);
               responseJson=JSON.parse(responseJson);
              this.setState({
                error:'',
                status:responseJson['message']
              });
            }
          })
          .catch(err=>{
            console.log(err);
          });
        }
    }
    render() {
        return(
          <div>
            <Header />
            <br/>
            <br/>
            <br/>
            <br/>
            <div className="container">
              <div className="auth-wrapper">
                <div className="auth-inner">
                  <center>
                     <div style={{width:"40%"}}>
                       <h3>Add Product</h3>
                       <div className="form-group">
                           <input type="text" onChange={this.handleInputChange} name="name" className="form-control" placeholder="Enter Product Name" />
                       </div>
                       <div className="form-group">
                           <input type="number" onChange={this.handleInputChange} name="stock" className="form-control" placeholder="Enter stock" />
                       </div>
                       <div className="form-group">
                           <input type="text" onChange={this.handleInputChange} name="warehouse" className="form-control" placeholder="Enter warehouse" />
                       </div>
                       <button onClick={this.handleSubmit} type="submit" className="btn btn-primary btn-block">Submit</button>
                       <h>{this.state.error}</h>
                       <h>{this.state.status}</h>
                     </div>
                  </center>
                </div>
              </div>
           </div>
          </div>
        );
    }
}
export default AddProduct;

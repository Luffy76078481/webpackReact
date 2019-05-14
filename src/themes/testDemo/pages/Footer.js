import React, { Component } from 'react'
import { Switch, Route, Link } from "react-router-dom";

class Header extends Component{
    constructor(){
        super();
    }

    render(){
        return(
            <div>
                <p>底部</p>
                <Link to="/">主页</Link>
                <Link to="/hello1">哈喽</Link>
            </div>
        )
    }

}
export default Header;

import React, { Component } from 'react'
import { Switch, Route, Link } from "react-router-dom";


class Hello1 extends Component{
    constructor(){
        super();
   

    }
    render(){
        return(
            <div>
               asldkjasdklj
               <Link to="/hello1/hello">哈喽</Link>
               {/* <Route path={`/hello1/hello`} component={window.r.get("Hello")} /> */}
               <Route path={`/hello1/hello`} component={window.r.get("Hello")} />
            </div>
        )
    }

}

export default Hello1;

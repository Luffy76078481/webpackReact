import React, {Component} from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from "react-redux";

class BaseRouter extends Component{
    render(){
        const r = window.r;
        const FreamRouter = r.get('FreamRouter');
        return (
            <Provider store={this.props.store}>
                <Router>
                    <FreamRouter/>
                </Router>
            </Provider>
        )
    }
}


export default BaseRouter;
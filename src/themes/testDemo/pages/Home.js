import React, { Component } from 'react'

import './styles/home.scss'
class Home extends Component{
    constructor(){
        super();
    }

    render(){
        return(
            <div>
                <p className="asd">Home</p>
                <img src={require('./images/index_05.png')}/>
                <button>啊是打算打算大神</button>
                <img src={require('./images/index_06.png')}/>
            </div>
        )
    }

}
export default Home;

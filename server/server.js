const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const path = require('path');
app.use(cookieParser());
app.use(bodyParser.json());
 

import React from 'react';
import ReactDOM from 'react-dom';






app.use('/', express.static('dist'))

 




app.listen("9000", function () {
    console.log("open Browser http://localhost:9000");
});
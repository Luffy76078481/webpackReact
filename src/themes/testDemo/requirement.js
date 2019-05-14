

import BaseRequirement  from "../../common/BaseRequirement";
//公共路由
import BaseRouter from "../../router/BaseRouter";
import FreamRouter from "../../router/FreamRouter";
import Header from "../../themes/testDemo/pages/Header";
import Footer from "../../themes/testDemo/pages/Footer";

import Home from "../../themes/testDemo/pages/Home";
import Hello from "../../themes/testDemo/pages/Hello";
import Hello1 from "../../themes/testDemo/pages/Hello1";
// import "./style/skin.scss"
export default class Requirement extends BaseRequirement {
    constructor() {
        super();
        this.r("BaseRouter", BaseRouter);
        this.r("FreamRouter",FreamRouter);
        this.r("Header",Header);
        this.r("Footer",Footer);
        this.r("Home", Home);
        this.r("Hello", Hello);
        this.r("Hello1", Hello1);
    }
}
import React from "react";
import { Route } from "react-router-dom";

const FreamRouter = () => {
    const Header = window.r.get("Header");
    const Footer = window.r.get("Footer");
    return (
    <div>
      <Header/>
      <Route exact path="/" component={r.get("Home")} />
      <Route  path="/hello1" component={r.get("Hello1")} />
      <Route path={`/hello2`} component={window.r.get("Hello")} />
      <Footer/>
    </div>
  );
};

export default FreamRouter;

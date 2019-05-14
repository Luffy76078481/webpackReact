/**
 * 配合requirement使用
 */
import React from 'react';

export default class BaseRequirement {
    constructor() {
        this.rs = {}
        this.roptions = {}
    }

    get(name) {
        var v = this.rs[name];
        if (!v) {
            // console.error("missing: " + name);
            // v = React.createClass({
            //     render: function() {
            //         const n = name;
            //         return (
            //             <div>
            //                 missing: {n}
            //             </div>
            //         );
            //     }
            // });;
            return null;
        }
        return v;
    }
    r(name, c, options) {
        this.rs[name] = c;
        this.roptions[name] = options || {};
        return this;
    }
    props(name) {
        return this.roptions[name] || {};
    }
}
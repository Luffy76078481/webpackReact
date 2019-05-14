import React from 'react';
import ReactDOM from 'react-dom';
import configureStore from './common/configureStore.prod';
import { requirement } from "../config/requirement"

const store = configureStore();
const BaseRouter =  requirement.get("BaseRouter");
init();

function init() {
    $actions.setStorage(store.dispatch, store.getState);

    store.subscribe(() => {
        var getState = store.getState;
        var dispatch = store.dispatch;
        actions.setStorage(dispatch, getState);
    });
    ReactDOM.render(<BaseRouter store={store}/>, document.getElementById('root'))

};

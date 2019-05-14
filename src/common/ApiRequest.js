/**
 * 
 */
import 'isomorphic-fetch';

const apiLink = (method) => {
    return config.apiPath + method;
}
const apiRequest = (action, callback) => {
    action.params = action.params || {};
    let user = cache.get("user") || {};
    let authorization="";
    let method  = action.method.toLocaleUpperCase();
    let url = action.url;
    if (user && user.token) {
        authorization = user.username+' '+user.token;
    }
    let obj = {
        method:method,
        headers :{
            "Authorization":authorization,
            "Content-Type":"application/json"
        },
    };
    if(method == "GET"){
        url = url+'?'+$.param(action.params);
    }else if(method=="POST"){
        if(url === "common/uploadafile"){//目前只有上传二维码需要这种mime类型
            obj.headers = {
                "Authorization":authorization,
                // "Content-Type":"multipart/form-data"   ///百度了一下fetch不设置类型才能上传。。。
            }
            obj.body = action.params;
        }else{
            obj.body = JSON.stringify(action.params);
        }
    }
    Promise.race([
    fetch(apiLink(url), obj),new Promise(function(resolve,reject){
        setTimeout(()=> reject(new Error('request timeout')),120000)
    })])
        .then(res => {
            return res.json();
        })
        .then(resJson => {
            if (resJson.StatusCode === 0) {
                if (resJson.token) {
                    user.token = resJson.token;
                    cache.set("user", user);
                }
            }
            callback(resJson);
        })
        .catch(err=>{
            callback({StatusCode:-1, message:"网络异常,请稍候再试!"});
        })
}
export default store => next => action => {
    var state = store.getState();
    if (action.type === "@@router/LOCATION_CHANGE") {
        if (state.user && state.user.token) {
            new ApiPlayerInfoAction().fly();
        }
    }
    if (action.type !== "api_start") {
        return next(action);
    }
    next(action);
    if (action.loadMsg) {
        next(action.loadMsg);
    }
    apiRequest(action, (resp)=>{
        if (resp.StatusCode === 0 && action.successMsg) {
            action.successMsg.message = resp.Message;
            next(action.successMsg);
        } else if (resp.StatusCode !== 0 && action.errorMsg) {
            action.errorMsg.message = resp.Message;
            next(action.errorMsg);
        }

        else if(resp.StatusCode === -1 && resp.Message =="未登录" && cache.get("user")){
            cache.remove("user");

            window.swal({
                title: "无权限访问",
                text: "未登录或登录超时，请重新登录。",
                confirmButtonColor: "#c5841f",
                confirmButtonText: "确定"
            },
            function (isConfirm) {
                window.location.pathname="/"
            });
        }
        action.response = resp;
        action.type = "api_finish";
        next(action);
    })
}
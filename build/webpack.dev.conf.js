const merge = require('webpack-merge');
const path = require('path');
const baseConfig = require('./webpack.base.conf');
const webpack = require('webpack');
module.exports = merge(baseConfig, {
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        host: '192.168.41.14', //主机名  默认 localhost
        port: "8082", //端口号。默认 8080
        contentBase: path.resolve(__dirname, '../dist'), //本地服务器所加载的页面所在的目录
        historyApiFallback: true, //如果为 true ，页面出错不会弹出 404 页面。
        // inline: true, //实时刷新
        // compress:true,//如果为 true ，开启虚拟服务器时，为你的代码进行压缩。加快开发流程和优化的作用。
        // // 单目录   你要提供哪里的内容给虚拟服务器用。这里最好填 绝对路径。
        // contentBase: path.join(__dirname, "public"),
        // // 多目录   默认情况下，它将使用您当前的工作目录来提供内容。
        // contentBase: [path.join(__dirname, "public"), path.join(__dirname, "assets")],
        // quiet:true,//true，则终端输出的只有初始启动信息。 webpack 的警告和错误是不输出到终端的。
        // devServer.publicPath
        // publicPath: "/assets/",
        // 原本路径 --> 变换后的路径
        // http: //localhost:8080/app.js --> http://localhost:8080/assets/app.js
        open: false, //自动打开浏览器
        hot: true, //热更新
        proxy: { //重定向
            '/api/v0/Pay/**': {
                target: 'http://cbd.wap.cgtest06.com/',
                secure: false, //若地址为https，需要设置为false
                changeOrigin: true ,//是否跨域 http：//your_api_server.com//api/v0/Pay/
                // pathRewrite: {//重写路径。匹配 /proxy ，然后变为'' ，那么 url 最终为 
                //     '^/proxy': ''
                // }
             
            },
            '/api/**': {
                target: 'http://cbd.wap.cgtest06.com/',
                secure: false, //若地址为https，需要设置为false
                changeOrigin: true //是否跨域
            },
        }
    },
});
const path = require('path');
/*
 定义模板文件html,最终js和CSS都会挂载在这个模板文件上
*/
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
/*
每次打包，这个插件都会检查注册在 entry 中的第三方库是否发生了变化，
如果没有变化，插件就会使用缓存中的打包文件，减少了打包的时间，这时 Hash 也不会变化。
*/
const AutoDllPlugin = require('autodll-webpack-plugin');
/*
抽取 CSS 到单文件
*/
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
module.exports = {
    entry: { //入口文件，可以多个入口，参数为数组
        bundle: path.resolve(__dirname, '../src/index.js'),
        test: path.resolve(__dirname, '../src/test.js'),
    },
    output: { //输出文件  publicPath定义所有资源路径的起始位置在哪儿
        path: path.resolve(__dirname, '../dist'),
        filename: 'js/[name].[hash].js',
        publicPath: "/",
    },
    resolve: {
        extensions: ['*', '.js', '.json', 'jsx'], //方便引入依赖或者文件的时候可以省略后缀
        alias: { //配置引入模块的别名   方便引入不用写那么长
            '@': path.resolve(__dirname, '../src'),
        }
    },
    module: {
        rules: [{ //各种加载编译loader
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },

            // {
            //     test: /\.(js|jsx)$/,
            //     use: [{
            //         loader: "babel-loader",
            //         options: {
            //             "presets": ["es2015", "react", "stage-1"],
            //             plugins: [
            //                 "transform-runtime",
            //                 ['import', {
            //                     libraryName: 'antd-mobile',
            //                     libraryDirectory: "es",
            //                     "style": "css"
            //                 }]
            //             ],
            //             cacheDirectory: true,
            //         },
            //     }],
            //     exclude: /node_modules/,
            // },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        limit: 1,
                        name: "images/[path][name].[ext]?v=[hash:12]"
                    }
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.(css|scss)$/,
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader",
                    options: {
                        sourceMap: true
                    }
                }, {
                    loader: "sass-loader",
                    options: {
                        sourceMap: true
                    }
                }]
            }

            // {  //
            //     test: /\.(gif|jpg|png)\??.*$/,
            //     use:[
            //         {
            //             loader:'url-loader',
            //             options: {
            //                 limit:8000,  //小于8KB的做base64转换
            //                 name:"images/[path][name].[ext]?v=[hash:12]"   //输出文件位置和名称
            //             }
            //         }
            //     ],
            //     exclude: path.resolve(__dirname, 'node_module');   //不包含这个文件
            // },
            // {
            //     test: /\.(woff|svg|eot|ttf)\??.*$/,
            //     use:[
            //         {
            //             loader:'url-loader',
            //             options: {
            //                 limit:1,
            //                 name:"font/[path][name].[ext]?v=[hash:12]"
            //             }
            //         }
            //     ],
            //     exclude: path.resolve(__dirname, 'node_module');
            // },
            // {
            //     test: /\.(js|jsx)$/,
            //     use: [
            //         {
            //             loader:"babel-loader",
            //             options: {
            //                 "presets": ["es2015", "react", "stage-1"],
            //                 plugins:[
            //                     "transform-runtime",
            //                     ['import',{libraryName:'antd-mobile', libraryDirectory: "es", "style": "css"}]
            //                 ],
            //                 cacheDirectory: true,
            //             },
            //         }
            //     ],
            //     exclude:path.resolve(__dirname, 'node_module');,
            // },
            // {
            //     test: /\.(css|scss|less)$/,
            //     use: [
            //         {
            //             loader: "style-loader"
            //         }, {
            //             loader: "css-loader",
            //             options: {
            //                 sourceMap: true
            //             }
            //         },
            //         {
            //             loader:'less-loader' // 引入less-loader
            //         },
            //         {
            //             loader: "sass-loader",
            //             options: {
            //                 sourceMap: true
            //             }
            //         },
            //     ]
            // }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/index.html'),
            filename: 'index.html',
            chunks: ['bundle']
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/test.html'),
            filename: 'test.html',
            chunks: ['test']
        }),
        // new HtmlWebpackPlugin({//如果需要多个入口文件的配置
        //     template: 'public/index_wap.html', // 模版文件
        //     filename:"index.html", //输出文件的文件名称
        //     chunksSortMode: function (chunk1, chunk2) {
        //         var order =  ["manifest","commons",'plugin','bundle'];
        //         var order1 = order.indexOf(chunk1.names[0]);
        //         var order2 = order.indexOf(chunk2.names[0]);
        //         return order1 - order2;
        //     },
        //     chunks: ["manifest","commons","bundle", "plugin"] //允许插入到模板中的一些chunk，不配置此项默认会将entry中所有的thunk注入到模板中。在配置多个页面时，每个页面注入的thunk应该是不相同的，需要通过该配置为不同页面注入不同的thunk；
        // }),
        new AutoDllPlugin({
            inject: true, // 插件会自动把打包出来的第三方库文件插入到 HTML
            debug: true,
            filename: '[name]_[hash].js', //打包后文件的名称
            path: './dll', //是打包后的路径
            entry: { //入口
                //vendor 指定的名称，数组内容就是要打包的第三方库的名称，不要写全路径，Webpack 会自动去 node_modules 中找到的。
                vendor: ['react', 'react-dom', 'react-loadable', 'react-redux', 'react-router-dom', 'react-router-redux', 'redux', 'redux-thunk']
            }
        }),
        new webpack.optimize.SplitChunksPlugin(), //提取共同代码：
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
        //提供全局的变量，在模块中使用无需用require引入
        new webpack.ProvidePlugin({
            $config: [path.resolve(__dirname, '../src/data/config.js'), 'default'],
            $actions: [path.resolve(__dirname, '../src/common/actions.js')],
        }),

        // new webpack.DefinePlugin({   //提供全局变量，可直接用BASENAME访问，一般用于生产和打包或者APP、PC的分开判断
        //     BASENAME: JSON.stringify('/')
        // })


    ]
};
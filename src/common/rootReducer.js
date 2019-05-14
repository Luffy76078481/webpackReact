import merge from 'lodash/merge'
import {routerReducer as routing} from 'react-router-redux'
import {combineReducers, createStore} from 'redux';
// import {_dispatch, _getState, onApiResultCallback} from "globalAction";

const apiResult = (state = null, action) => {
    if (action.type === "api_finish") {
        setTimeout(() => {
            onApiResultCallback(action)
        }, 100);
        // if (action.response.StatusCode == 1021) {
        //     if(!config.isApp){
        //        //非法访问 跳转noService页面
        //        sessionStorage.setItem("serIP",action.response.Message)
        //        location.href = "/NoServicePage.html";
        //     }else{
        //
        //     }
        // }
        return action;
    }
    return state;
}
// 页码，总页数，数量，开始，结束，总数
function initPage(pageSize = 10) {
    return {pageNo: 1, totalPage: 1, pageSize: 10, startRowIndex: 0, endRowIndex: 0, total: 0, rows: []};
}

function computePage(action, page) {
    let state = {};

    function mathTotalPage(total, size) {
        if (Number.isInteger(total / size) && (total / size > 0)) {//如果是正整数
            return total / size;
        } else {
            return parseInt(total / size) + 1;
        }
    }

    state.rows = page.List;
    state.total = page.Count;
    state.totalPage = mathTotalPage(state.total, action.params.PageSize);
    state.pageNo = action.params.PageIndex;
    state.pageSize = action.params.PageSize;
    state.startRowIndex = state.pageNo * state.pageSize + 1;
    state.endRowIndex = state.startRowIndex + state.rows.length - 1;
    if (state.total <= 0) {
        state.startRowIndex = 0;
    }
    return state;
}

function computeGamesPage(action, page) {
    let state = {};
    state.rows = page.Page;
    state.total = page.TotalRecord;
    state.totalPage = page.TotalPages;
    state.pageNo = action.params.PageNo;
    state.pageSize = action.params.PageSize;
    state.startRowIndex = (state.pageNo - 1) * state.pageSize + 1;
    state.endRowIndex = state.startRowIndex + state.rows.length - 1;
    if (state.total <= 0) {
        state.startRowIndex = 0;
    }
    return state;
}

//系统配置项
const backConfigs = (state = {}, action) => {
    if (action.type === "api_finish" && action.response.StatusCode === 0) {
        if (action.url === "Config/GetItems") {
            state = action.response;
        }
    }
    return state;
}

//获取资讯配置，通过分类获取
const notices = (state = [], action) => {
    if (action.type === "api_finish" && action.response.StatusCode === 0 && action.url === "News/GetList" && action.params.CategoryCode == "notice") {
        state = action.response.NewsInfo;
    }
    return state;
};
//获取首页是否需要弹出框
const homePromotion = (state = [], action) => {
    if (action.type === "api_finish" && action.response.StatusCode === 0 && action.url === "News/GetList" && action.params.CategoryCode=="home-promotion") {
        state = action.response.NewsInfo;
    }
    return state;
}
const noticesUnRead = (state = 0, action) => {
    if (action.type === "changeReadNewsNum" && action.tabsType == 1) {
        if (state) {
            state--;
        }
        return state;
    }
    if (action.type === "api_finish" && action.response.StatusCode === 0 && action.url === "News/GetList") {
        let isReadNews = cache.get('isReadNews') ? cache.get('isReadNews') : ""
        state = 0;
        action.response.NewsInfo.forEach((item, index) => {
            if (isReadNews.indexOf(item.Id + ',') < 0) {
                state++;
            }
        })
    }
    return state;
}
//优惠
let promotionsIndex = -1;//优惠列表初始化查询的页数
const promotions = (state = {
    promotions: initPage(),
    promoTypes: [],
    promoUnRead: 0,
}, action) => {
    if (action.type === "changeReadNewsNum" && action.tabsType == 0) {
        if (state.promoUnRead) {
            state.promoUnRead--;
        }
        return state;
    }
    if (action.type !== "api_finish" || action.response.StatusCode !== 0) {
        return state;
    }
    if (action.url === "Promo/GetList") {
        let isReadNews = cache.get('isReadNews') ? cache.get('isReadNews') : ""
        let PageIndex = action.params.PageIndex;
        let ps = computePage(action, action.response);
        if (PageIndex > promotionsIndex) {
            ps.rows.forEach((item, index) => {
                if (isReadNews.indexOf(item.Id + ',') < 0) {
                    state.promoUnRead++;
                }
            })
        }
        promotionsIndex = PageIndex;
        state = merge({}, state);
        state.promotions = ps;
    } else if (action.url === "Promo/GetTypes") {
        state = merge({}, state);
        state.promoTypes = action.response.List;
    }

    return state;
};

//真人视讯视图数据
const views = (state = {casinos: []}, action) => {
    if (action.type !== "api_finish" || action.response.StatusCode !== 0) {
        return state;
    }
    if (action.url === "client/casino_views") {
        state = merge({}, state, {casinos: action.response.Data});
    }
    return state;
}

//全局人數統計（因为都是假数据建议业务代码中自己造吧）
const global = (state = {onlineUserCount: 0, betCount: 0, cashCount: 0, cashSpeed: 0, bonusAmount: 0}, action) => {
    if (action.type === "api_finish" && action.response.StatusCode === 0) {
        if (action.method === "realtime_stat") {
            state.onlineUserCount = 1795362 + parseInt(Math.random() * 300)
            state.betCount = 1795362 + parseInt(Math.random() * 300);
            state.cashCount = 55391 + parseInt(Math.random() * 300);
            state.cashSpeed = 190 + parseInt(Math.random() * 300);
            state.bonusAmount = 23712 + parseInt(Math.random() * 300);
        }
    }
    return state;
}

//游戏数据
const game = (state = {
    platforms: [], 
    slot_platforms: [],
    gameCategories: [], 
    casinos:[],
    bestGames: [],
    StreetGames:initPage(), 
    games: initPage(), 
    sportGames: [],
    gameCounter: {},
    bingoGames:[],
    tabGames:[],
    agByGames:[],
    tmGames:[],
    ESGame:[]
}, action) => {
    if (action.type !== "api_finish" || action.response.StatusCode !== 0){
        return state;
    }
    let ret = merge({}, state);
    if (action.url == "client/game_platforms") {//获取游戏平台
        let resp = action.response;
        ret.platforms = resp.Data;
        let sps = [];
        for (var i = 0; i < ret.platforms.length; i++) {
            let p = ret.platforms[i];
            if (p.ShowSlot) {
                sps.push(p);
            }
            if (p.MarkInfos) {
                let mms = p.MarkInfos.split("##");
                sps.push({
                    id: mms[0].trim(),
                    markId: mms[0].trim(),
                    name2: mms[1].trim(),
                    order: parseInt(mms[2] || 0),
                    showSlot: 1
                });
            }
        }
        sps.sort((a1, a2) => {
            return a2.order - a1.order;
        })
        ret.slot_platforms = sps;
        return ret;
    }
    if (action.url == "Game/GetBalance") {//获取平台的余额
        let resp = action.response;
        for (var i = 0; i < ret.platforms.length; i++) {
            let platform = ret.platforms[i];
            if (platform.ID == action.params.GamePlatform) {
                platform.Balance = resp.Balance;
            }
        }
        return ret;
    }
    if (action.url == "Game/GetAllBalance") {//获取平台的余额
        let resp = action.response.Data;
        for (var i = 0; i < ret.platforms.length; i++) {
            let platform = ret.platforms[i];
            platform.Balance = resp[platform.ID] ? resp[platform.ID] : 0;
        }
        return ret;
    }
    if (action.url == "client/pc_game_categories") {//获取游戏分类
        state = merge({}, state);
        state.gameCategories = action.response.Data;
    }
    if(action.url == "client/games"){
        state = merge({}, state);
        if(action.params.GameType === 4 || action.params.GameType === 5) {//电子投注
            if(action.params.PageSize == 666){
                state.tabGames = action.response.Page
            }else if (action.params.PageSize == 888){
                state.agByGames = action.response.Page
            }else{
                if(action.params.GamePlatform === "KY" || action.params.YoPlay === 1 || action.params.GamePlatform === "TM"){
                    state.StreetGames = computeGamesPage(action, action.response);//街机游戏
                }
                state.games = computeGamesPage(action, action.response);
            }
        }else if (action.params.GameType === 3) {//体育投注

            state.sportGames = action.response.Page;
        }else if (action.params.GameType === 2) {//彩票投注
            state.bingoGames = action.response.Page
        }else if(action.params.GamePlatform === "TM"){//天美棋牌获取创建加入房间
            state.tmGames = action.response.Page.slice(0,2)
        }else if(action.params.GameType === 6){     
            state.ESGame = action.response.Page
        }

    }
    //获取游戏数量
    // if (action.url == "client/game_count") {
    //     if(action.params.YoPlay){
    //         state.gameCounter[action.params.GameMarks+'_YOPLAY'] = action.response.Count;
    //     }else{
    //         state.gameCounter[action.params.GameMarks+'_'+action.params.GamePlatform] = action.response.Count;
    //     }
    //     state = merge({}, state, { gameCounter: state.gameCounter });
    // }
    if (action.url == "client/game_allcount") {
        if (action.params.YoPlay) {
            state.gameCounter['YOPLAY'] = action.response.Data;
        } else {
            state.gameCounter[action.params.GamePlatform] = action.response.Data;
        }
        state = merge({}, state, {gameCounter: state.gameCounter});
    }
    if (action.method === "best_games") {////没有找到哪个业务代码中使用过该API
        state = merge({}, state);
        state.bestGames = action.response.gameList;
    }
//   if(action.url === "client/game_count"){
//     state.gameCounter[action.params.key] = action.response.Count;
//     state = merge({}, state, { gameCounter: state.gameCounter });      
//   }
    return state;
}
//跳转到指定的游戏tab
const linkToGames = (state = {linkToGames: ''}, action) => {
    if (action.type === "ChangeLinkID") {
        state.linkToGames = action.data
    }
    return state;
}

//銀行配置信息
const bankInfos = (state = [], action) => {
    if (action.type === "api_finish" && action.url === "Config/GetBanks" && action.response.StatusCode === 0) {
        state = action.response.List;
    }
    return state;
}
//获取收款银行列表
const offlineAccount = (state = {offlineAccounts: [], transferTypes: [], offlineWeixinAliAccounts: []}, action) => {

    if (action.type !== "api_finish" || action.response.StatusCode !== 0) {
        return state;
    }
    if (action.url === "Deposit/GetAdminBanks") {
        if (action.params.type == 0 || action.params.type == 2) {
            let list = state.offlineWeixinAliAccounts.concat(action.response.List);
            state = merge({}, state, {offlineWeixinAliAccounts: list});
        } else {
            state = merge({}, state, {offlineAccounts: action.response.List});
        }
    }
    // else if (action.url === "offline_transfer_types") {//数据在config/offlineTransferJson内
    //     state = merge({}, state, { transferTypes: action.response.transferTypes });
    // }
    return state;
}

//新增获取所有收款银行列表
const allOfflineAccount = (state = {allOfflineBanks: []}, action) => {
    if (action.type !== "api_finish" || action.response.StatusCode !== 0) {
        return state;
    }
    if (action.url === "Deposit/GetAdminAllBanks") {
        state = merge({}, {allOfflineBanks: action.response.List});
    }

    return state;
}

//客服信息
const remoteSysConfs = (state = {}, action) => {
    if (action.type === "api_finish" && action.url === "client/all_sys_cfg" && action.response.StatusCode === 0) {
        state = action.response.Config;
    }
    return state;
}

//注冊相關配置
const registerSetting = (state = {}, action) => {
    if (action.type === "api_finish" && action.response.StatusCode === 0) {
        if (action.url === "Account/GetRegistSetting") {
            state = action.response;
        }
    }
    return state;
}

// WAP端代理注册 配置项获取
const AgentRegisterSetting = (
    state = {
        Birthday: {IsVisible: false},
        Email: {IsVisible: false},
        Phone: {IsVisible: false},
        QQ: {IsVisible: false},
        TrueName: {IsVisible: false},
    }, action) => {
    if (action.type === "api_finish" && action.response.StatusCode === 0) {
        if (action.url === "Agent/GetRegistSetting") {
            state = action.response.Setting;
        }
    }
    return state;
}

//用户信息
const user = (state = {bankAccounts: [], favoritesIds: "",ImagePath:"A"}, action) => {
    let resp = action.response;
    let changed = false;
    if (action.type === "Account_Logout") {
        state = {};
        cache.remove("user");
        return state;
    }
    if (action.type !== "api_finish" || action.response.StatusCode !== 0) {
        return state;
    }
    if (action.url == "Account/Logout") {
        state = {};
        cache.remove("user");
        return state;
    }
    if (resp.Token) {
        state = merge(state, {token: resp.Token});
        changed = true;
    }
    if (action.url === "Account/Login" || action.url === "Account/Regist") {
        state = merge(state, {
            username: resp.UserName,
            realName: resp.TrueName
        });
        changed = true;
    } else if (action.url === "Account/GetLoginUser") {
        state = merge(state, {
            qq: resp.UserInfo.QQ,
            username: resp.UserInfo.UserName,
            recommendCode: resp.UserInfo.RecommendCode,
            userLevel: resp.UserInfo.UserLevel,
            realName: resp.UserInfo.TrueName,
            email: resp.UserInfo.Email,
            phone: resp.UserInfo.Phone,
            amount: resp.UserInfo.Cash,
            userLevelName: resp.UserInfo.UserLevelName,
            LastLoginTime: resp.UserInfo.LastLoginTime,
            verfyPhone: resp.UserInfo.PhoneValidateStatus,
            birthday: resp.UserInfo.Birthday,
            SingleMinWithdraw: resp.UserInfo.SingleMinWithdraw,
            webChat: resp.UserInfo.Wechat,
            province: resp.UserInfo.Province,
            city: resp.UserInfo.City,
            integral: resp.UserInfo.Integral,
            address: resp.UserInfo.Address,
            AutoTransfer: resp.UserInfo.AutoTransfer,
            SourceWithdrawalPassword: resp.UserInfo.SourceWithdrawalPassword,
            IsSourceUser: resp.UserInfo.IsSourceUser,
            ImagePath:resp.UserInfo.ImagePath,
            SceneImage:resp.UserInfo.SceneImage,
        });
        changed = true;
    } else if (action.url === "Game/GetAllBalance") {
        let obj = resp.Data;
        let amount = _getState().user.amount || 0;
        for (var i in obj) {
            amount += obj[i]
        }
        state = merge(state, {userBalance: amount.toFixed(2)});
        changed = true;

    } else if (action.url === 'User/GetBankCards') {
        state = Object.assign(state, {bankAccounts: resp.List});
        changed = true;
    } else if (action.url === "Game/GetFavorites") {//获取被收藏id
        let Ids = "";
        resp.List.forEach((item) => {
            Ids += item.Id + ","
        })
        state = merge(state, {favoritesIds: Ids});
        changed = true;
    } else if (action.url === "Game/DeleteFavorite") {//在被收藏id中删除一个
        let gstate = _getState();
        state = merge(state, {favoritesIds: gstate.user.favoritesIds.replace(action.params.GameId + ',', '')});
        changed = true;
    } else if (action.url === "Game/AddFavorite") {//在被收藏id中添加一个
        let gstate = _getState();
        gstate.user.favoritesIds += action.params.GameId + ','
        changed = true;
    }
    if (changed) {
        state = merge({}, state);
        cache.set("user", state);
    }

    return state;
}

//流水王活动数据
const activity = (state=[],action) => {
    if (action.type === "api_finish" && action.url === "Leaderboard/dataview" && action.response.StatusCode === 0) {
        state = action.response.Data;
    }
    return state;
}

//获取用户可用支付银行列表
const payThirdInfos = (state = [], action) => {
    if (action.type === "api_finish" && action.url === "Deposit/GetPayBanks" && action.response.StatusCode === 0) {
        let Banks = action.response.Banks.filter((item)=>{
            if(item.BankNo =="ALIPAY_WAP" || item.BankNo =="WECHAT_WAP" || item.BankNo =="QQPAY_WAP" || item.BankNo =="JDPAY_WAP" || item.BankNo =="WECHAT" || item.BankNo =="ALIPAY" ||  item.BankNo =="QQPAY" ||  item.BankNo =="JDPAY" || item.BankNo =="YLPAY" || item.BankNo =="BAIDUPAY"){
                return item
            }
        });
        state = Banks;
    }
    return state;
}
//获取用户可用支付银行列表
const payBankInfos = (state = [], action) => {
    if (action.type === "api_finish" && action.url === "Deposit/GetPayBanks" && action.response.StatusCode === 0) {
        let Banks = action.response.Banks.filter((item) => {
            if (item.BankNo != "WECHAT" &&
                item.BankNo != "ALIPAY" &&
                item.BankNo != "QQPAY" &&
                item.BankNo != "JDPAY" &&
                item.BankNo != "YLPAY" &&
                item.BankNo != "BAIDUPAY") {
                return item
            }
        });
        state = Banks;
    }
    return state;
}

//获取用户在线支付银行列表
const payOnline = (state = [], action) => {
    if (action.type === "api_finish" && action.url === "Deposit/GetOnlinePay" && action.response.StatusCode === 0) {
        state = action.response.Banks;
    }
    return state;
}

//投注/充值/提款/转账/优惠 记录
const records = (state = { betRecords: initPage(), transferRecords: initPage(), depositRecords: initPage(), withdrawRecords: initPage() ,myMsgsRecords: initPage(),myPromoRecords:initPage() }, action) => {
    if (action.type !== "api_finish" || action.response.StatusCode !== 0) {
        return state;
    }
    if (action.url === "Bet/GetBetList") {
        state = merge({}, state);
        state.betRecords = computePage(action, action.response);
    } else if (action.url === "Transfer/GetList") {
        state.transferRecords = computePage(action, action.response);
    } else if (action.url === "Deposit/GetList") {
        state.depositRecords = computePage(action, action.response);
    } else if (action.url === "Withdrawal/GetList") {
        state.withdrawRecords = computePage(action, action.response);
    } else if (action.url === "User/GetSiteMsgs") {
        state.myMsgsRecords = computePage(action, action.response);
    }else if (action.url === "User/GetUserBonusRecord"){
        state.myPromoRecords = computePage(action, action.response);
    }
    return state;
}

//查询站内信
/*
* 因为wap端站内信是下拉无限加的
* 在读取站内信信息时就需要通过ID获取对应的站内信信息
* 所以需要保存所有的站内信到allSitemsgs
* 所以添加一个变量sitemsgIndex 通过该参数的变化向allSitemsgs中插入数据
* */
let sitemsgIndex = 0;
const sitemsg = (state = {unread: 0, sitemsgs: initPage(), allSitemsgs: []}, action) => {
    if (action.type !== "api_finish" || action.response.StatusCode !== 0) {
        return state;
    }

    if (action.url === "User/GetUnreadSiteMsgs") {
        state = merge({}, state, {unread: action.response.Count});
    } else if (action.url === "User/GetSiteMsgs") {
        let params = action.params;
        if (params.PageIndex > sitemsgIndex) {
            let old = state.allSitemsgs;
            let newArr = old.concat(action.response.List);
            state.allSitemsgs = newArr
        } else if (params.PageIndex == sitemsgIndex) {
            state.allSitemsgs = action.response.List;
        } else {
            state.allSitemsgs = action.response.List;
        }
        state.sitemsgs = computePage(action, action.response);
        sitemsgIndex = params.PageIndex;
        state = merge({}, state, {sitemsgs: state.sitemsgs, allSitemsgs: state.allSitemsgs});
    }
    return state;
};

//登陸日志
const login = (state = {logs: [], loginCount: 0}, action) => {
    if (action.type !== "api_finish" || action.response.StatusCode !== 0) {
        return state;
    }
    if (action.url == "User/LogLogins") {
        state = merge({}, state);
        state.logs = action.response.Data;
        state.loginCount = action.response.RemainCount;
    }
    return state
}

/*===========================未修改的redux=================================*/
//好像是[hg]皮肤专用的stroe
const Appdow = (state = {//APP下载页面
    Appdow: initPage()
}, action) => {
    if (action.type !== "api_finish" || action.response.StatusCode !== 0) {
        return state;
    }
    if (action.method === "Appdow") {
        let ps = computePage(action, action.response.page);
        state = merge({}, state);
        state.Appdow = ps;
    }
    return state;
};

const message = (state = {show: false, messages: [], popup: null}, action) => {
    if (action.type !== "message" && action.type !== "check_message") {
        state.popup = null;
        return state;
    }
    let n = new Date().getTime();
    state = merge({}, state);
    if (action.type === "message") {
        let gstate = _getState();
        if (gstate.systemConfig.voice) {
            if (action.msgType === "success") {
                let audio = new Audio('sound/success.mp3');
                audio.play();
            } else if (action.msgType === "error") {
                let audio = new Audio('sound/error.mp3');
                audio.play();
            }
        }
        state.show = true;
        action.showTime = new Date().getTime();
        action.message = action.message || action.title;
        let nmsgs = [];
        if (action.msgType !== "unloading") {
            nmsgs.push(action);
        }
        for (let i = 0; i < state.messages.length && i < 8; i++) {
            let msg = state.messages[i];
            if (msg.id === action.id || n - msg.startTime > 300000)
                continue
            nmsgs.push(msg);
        }
        state.messages = nmsgs;
    }
    state.popup = null;
    // for (let i = 0; i < state.messages.length; i++) {
    //     let msg = state.messages[i];
    //     if (msg.msgType === "loading") {
    //         state.popup = msg;
    //         break;
    //     } else if (n - msg.showTime < 3000) {
    //         state.popup = msg;
    //         break;
    //     }
    // }

    // 旧版登录弹窗
    for (var i = 0; i < state.messages.length; i++) {
        var msg = state.messages[i];
        if (msg.msgType === "loading") {
            state.popup = msg;
            break;
        } else if (n - msg.showTime < 3000) {
            state.popup = msg;
            setTimeout(() => {
                _dispatch({type: "check_message"})
            }, 3000);
            break;
        } else if (n - msg.showTime < 60000) {
            setTimeout(() => {
                _dispatch({type: "check_message"})
            }, 60000);
            break;
        }
    }
    return state;
}


const systemConfig = (state = {autoTransfer: false, voice: false}, action) => {
    if (action.type === "load_system_config") {
        let sc = cache.get("system_config");
        if (sc) {
            return merge({}, state, sc);
        }
    } else if (action.type === "save_system_config") {
        cache.set("system_config", action.config);
        return merge({}, state, action.config);
    }
    return state;
};

/*===========================wap端的redux=================================*/
//是否显示Login弹出层
const showLoginModal = (state = false, action) => {
    if (action.type === "showLoginModal") {
        state = action.data.flag;
    }
    return state;
}

//是否显示Chess棋牌弹窗
const showChessModal = (state = {flag:false,popType:"my",tabType:"grxx",popWith:"10rem",popHeight:"6.5rem"}, action) => {
    if (action.type === "showChessModal") {
        state = merge({}, state, action.data);
    }
    return state;
}


//是否显示头部APP下载
const isShowDownApp = (state = true, action) => {
    if (action.type === "isShowDownApp") {
        state = action.data.flag;
    }
    return state;
}
//跳转到首页指定的分类tab
const wapCategory = (state = {id: '', index: 0}, action) => {
    if (action.type === "wapCategory") {
        state.id = action.id;
        if (action.index) {//bet365的皮tab
            state.index = action.index;
        }
    }
    return state;
}
const wapPage = (state = {id: ''}, action) => {
    if (action.type === "wapPage") {
        state.id = action.id
    }
    return state;
}


const wapAdsList = (state = [], action) => {
    if (action.type !== "api_finish" || action.response.StatusCode !== 0) {
        return state;
    }
    if (action.url === "News/GetAds" && action.params.Type.indexOf("mobile_home_images") > -1) {
        state = action.response.List;
    }
    return state;
}

//wap游戏分类
const wapCategores = (state = {"mobileHomeCategories": [], "mobileHomeMore": [], "slot_category": []}, action) => {
    if (action.type !== "api_finish" || action.response.StatusCode !== 0) {
        return state;
    }
    if (action.url === "client/wap_game_categories") {
        state = merge({}, state);
        if (action.params.CategoryIds == "mobile_home") {//首頁游戲分類項
            state.mobileHomeCategories = action.response.Data;
        } else if (action.params.CategoryIds == "mobile_home_more") {//點擊更多  獲取游戲分類項
            state.mobileHomeMore = action.response.Data;
        } else if (action.params.CategoryIds == "slot_category") {//老虎机的分类
            state.slot_category = action.response.Data;
        }
    }
    return state;
}

const rootReducer = combineReducers({
    user,
    login,
    bankInfos,
    notices,
    payBankInfos,
    payThirdInfos,
    payOnline,
    game,
    message,
    apiResult,
    records,
    promotions,
    sitemsg,
    views,
    offlineAccount,
    systemConfig,
    routing,
    global,
    backConfigs,
    linkToGames,
    registerSetting,
    remoteSysConfs,
    //wap端
    isShowDownApp,
    showLoginModal,
    showChessModal,
    wapAdsList,
    wapCategores,
    noticesUnRead,
    wapCategory,
    wapPage,
    homePromotion,
    allOfflineAccount,
    AgentRegisterSetting,
    activity
});
let store = createStore(rootReducer);

export default rootReducer

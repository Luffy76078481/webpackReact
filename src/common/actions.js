import {browserHistory} from 'react-router';

export var _dispatch;
export var _getState;

const WebSiteOperate = $config.isWap ? (config.isApp ? "(APP)" : "(WAP)") : "(WEB)";//是哪个类型的站点登陆的

export function setStorage(dispatch, getState) {
    _dispatch = dispatch;
    _getState = getState;
}

const actionResultHandlerMap = {};


function registerResultHandler(key, handler) {
    actionResultHandlerMap[key] = handler;
}

export function onApiResultCallback(action) {
    let act = actionResultHandlerMap[action.callbackKey || action.url];
    if (act) {
        let handler = act.callback;
        delete (actionResultHandlerMap[action.url]);
        if (handler) {
            handler(action.response);
        }
    }
}

class BaseAction {
    constructor(type) {
        this.obj = {type: type};
        this.fly.bind(this);
    }

    fly() {
        _dispatch(this.obj);
    }

    setMsgs(loadMsg, successMsg, errorMsg, id = null) {
        // if(config.promotionTag != '') return;
        var n = id || new Date().getTime();
        if (loadMsg) {
            loadMsg.obj.id = n;
            this.obj.loadMsg = loadMsg.obj;
        }
        if (successMsg) {
            successMsg.obj.id = n;
            this.obj.successMsg = successMsg.obj;
        }
        if (errorMsg) {
            errorMsg.obj.id = n;
            this.obj.errorMsg = errorMsg.obj;
        }
    }
}

class ApiAction extends BaseAction {
    constructor(url, params = {}, method = 'post') {
        super("api_start");
        this.obj.url = url;
        this.obj.params = params;
        this.obj.method = method;
    }

    fly(callback = null, key = "") {
        super.fly();
        if (callback) {
            this.callback = callback;
            if (key) {
                this.obj.callbackKey = key;
            } else {
                key = this.obj.url;
            }
            registerResultHandler(key, this);
        }
        return this;
    }
}

export class MsgAction extends BaseAction {
    constructor(msgType, title, message) {
        super("message");
        this.obj.msgType = msgType;
        this.obj.title = title;
        this.obj.message = message;
        var d = new Date();
        this.obj.created = d.format("yyyy/MM/dd hh:mm:ss");
        this.obj.startTime = d.getTime();
    }
}

export class ErrorMsgAction extends MsgAction {
    constructor(title, message = null) {
        super("error", title, message);
    }
}

export class SuccessMsgAction extends MsgAction {
    constructor(title, message = null, id = 0) {
        super("success", title, message);
        this.obj.id = id;
    }
}

export class WarningMsgAction extends MsgAction {
    constructor(title, message = null, id = 0) {
        super("warning", title, message);
        this.obj.id = id;
    }
}

export class LoadingMsgAction extends MsgAction {
    constructor(title, message = null, id = 0) {
        super("loading", title, message);
        this.obj.id = id;
    }
}

export class UnLoadingMsgAction extends MsgAction {
    constructor(id) {
        super("unloading");
        this.obj.id = id;
    }

}

//获取系统配置项
export class LoadBackConfigsAction extends ApiAction {
    constructor() {
        super("Config/GetItems", {}, "get");
    }
}

//获取资讯配置，通过分类获取
export class ApiNoticeAction extends ApiAction {
    constructor(type = "notice") {
        let params = {
            CategoryCode: type,
            PageSize: 10,
            PageIndex: 0,
            SortName: "Sort",
            SortOrder: "DESC"
        }
        super("News/GetList", params, "get");
    }
}

//檢查IP地址
export class ApiCheckIpAction extends ApiAction {
    constructor() {
        super("client/check_ip", {Tag: config.webSiteTag}, "get");
    }
}

//提交回访号码
export class ApiAddPhoneCallAction extends ApiAction {
    constructor(phone) {
        super("client/AddPhoneCall", {phone}, "get");
    }
}

//获取优惠类型
export class ApiQueryPromotionTypesAction extends ApiAction {
    constructor() {
        super("Promo/GetTypes", {Tag: config.webSiteTag}, "get");
    }
}

//获取优惠列表
export class ApiQueryPromotionsAction extends ApiAction {
    constructor(PageIndex = 1, PageSize = 20, TypeId = null, showLoading = true) {
        super("Promo/GetList", {
            PageIndex: PageIndex - 1,
            PageSize,
            TypeId,
            SortName: "Sort",
            SortOrder: "ASC",
            Tag: config.webSiteTag
        }, 'get');
        if (showLoading) {
            this.setMsgs(new LoadingMsgAction("优惠活动获取中", ""),
                new SuccessMsgAction("优惠活动获取成功"),
                new ErrorMsgAction("优惠活动获取失败"));
        }
    }
}

//申请优惠
export class ApiPromoApplyAction extends ApiAction {
    constructor(Key, ByRule) {
        super("Promo/Apply", {Key, ByRule}, "post");
    }
}


//游戏平台
export class ApiGamePlatformsAction extends ApiAction {
    constructor() {
        super("client/game_platforms", {}, "get");
    }
}

export class ApiGamePlatformsBalanceAction {
    constructor() {
    }

    fly(platformsId) {
        if (platformsId) {
            if ($.isArray(platformsId)) {
                for (var i = 0; i < platformsId.length; i++) {
                    if (!platformsId[i]) continue;
                    new ApiGamePlatformBalanceAction(platformsId[i]).fly();
                }
            } else {
                new ApiGamePlatformBalanceAction(platformsId).fly();
            }
        }
    }
}

//獲取所有游戲平臺的余额
export class ApiGamePlatformAllBalanceAction extends ApiAction {
    constructor() {
        super("Game/GetAllBalance", {}, 'get');
    }
}

//获取指定游戏平台余额
export class ApiGamePlatformBalanceAction extends ApiAction {
    constructor(platformId) {
        super("Game/GetBalance", {GamePlatform: platformId}, 'get');
    }
}

//获取银行配置信息
export class ApiBanksAction extends ApiAction {
    constructor() {
        super("Config/GetBanks", {}, "get");
    }
}

// 修改（反写）大转盘剩余奖项
export class ApiQueryLuckyChangeCounts extends ApiAction {
    constructor(val) {
        super("Config/UpdateLuckyDataConfing", val, "post")
    }
}

// 查询大转盘剩余奖项
export class ApiGetQueryLuckyCounts extends ApiAction {
    constructor() {
        super("Config/GetLuckyDataConfing", {}, "get")
    }
}

// 大转盘获奖名单
export class ApiQueryLuckyWinnerAction extends ApiAction {
    constructor(username = "", pageNo = 1, pageSize = 15) {
        //uzi xhtd vv8特殊一点,要两个活动.
        let LuckyNo;
        if (config.gameTag == "uzi" || config.gameTag == "xhtd" || config.gameTag == "vv8" || config.gameTag == "cbd") {
            LuckyNo = "LuckyDice"
        } else {
            LuckyNo = "LuckyMoney"
        }
        super("Lucky/GetWinners", {username, pageNo, pageSize, LuckyNo}, "get");
    }
}

//大转盘抽奖检查
export class ApiQueryLuckyCountAction extends ApiAction {
    constructor(username = "") {
        //uzi xhtd vv8特殊一点,要两个活动.
        let LuckyNo;
        if (config.gameTag == "uzi" || config.gameTag == "xhtd" || config.gameTag == "vv8" || config.gameTag == "cbd") {
            LuckyNo = "LuckyDice"
        } else {
            LuckyNo = "LuckyMoney"
        }
        super("Lucky/GetCount", {LuckyNo, username}, "get");
    }
}

//开始抽奖
export class ApiQueryLuckyDrawAction extends ApiAction {
    constructor(username = "") {
        //uzi xhtd vv8特殊一点,要两个活动.
        let LuckyNo;
        if (config.gameTag == "uzi" || config.gameTag == "xhtd" || config.gameTag == "vv8" || config.gameTag == "cbd") {
            LuckyNo = "LuckyDice"
        } else {
            LuckyNo = "LuckyMoney"
        }
        super("Lucky/Draw", {LuckyNo, username});
    }
}

//全局弹窗
export class GlobePopBox {
    constructor(message = "") {
        $("#globe-message").html(message);
        $("#globe-show").show();
    }
}

//客服信息相關
export class ApiAllSysConfigAction extends ApiAction {
    constructor() {
        super("client/all_sys_cfg", {Tag: config.webSiteTag}, "get");
    }
}

//注冊相關配置
export class ApiRegisterSettingAction extends ApiAction {
    constructor() {
        super("Account/GetRegistSetting", {}, "get");
    }
}

//WAP端代理注册 配置项获取
export class ApiAgentGetRegistSetting extends ApiAction {
    constructor() {
        super("Agent/GetRegistSetting", {}, "get");
    }
}

//注冊
export class ApiRegisterAction extends ApiAction {

    constructor(params) {
        let filter = {//后台要接收的参数
            UserName: "",
            TrueName: "",
            Password: "",
            Email: "",
            Phone: "",
            QQ: "",
            Birthday: "",
            Wechat: "",
            Referer: "",
            WithdrawalPassword: "",//可以不传
            // ExtendCode:"",
            ExtendCode: sessionStorage.getItem("channel") || cache.getCookie("channel"),
            Tag: config.webSiteTag,//可以不传
            RegWebSite: window.Util.getHost(WebSiteOperate)//可以不传
        };
        params = merge(filter, params);
        if (!params.WithdrawalPassword) {
            params.WithdrawalPassword = params.Password;
        }
        super("Account/Regist", params);
        // this.setMsgs(new LoadingMsgAction("注册中", ""),
        //     new SuccessMsgAction("注册成功"),
        //     new ErrorMsgAction("注册失败"));
    }
}

//修改用户信息（首次绑定提款信息真实姓名）
export class ApiUpdateInfoAction extends ApiAction {
    constructor(TrueName) {
        var user = _getState().user;
        super("User/UpdateInfo", {
            TrueName, Phone: user.phone, Email: user.email, Birthday: user.birthday
            , QQ: user.qq, WebChat: user.webChat, Province: user.province, City: user.city, Address: user.address
        })
        // this.setMsgs(new LoadingMsgAction("注册中", ""),
        //     new SuccessMsgAction("注册成功"),
        //     new ErrorMsgAction("注册失败"));
    }
}

//检查用户用
export class ApiCheckUserNameAction extends ApiAction {
    constructor(UserName) {
        super("Account/CheckUserName", {UserName}, "GET");

    }
}

//登录
export class ApiLoginAction extends ApiAction {
    constructor(UserName, Password, OperateWebSite = WebSiteOperate) {
        super("Account/Login", {UserName, Password, LoginWebSite: window.Util.getHost(OperateWebSite)});
        if (!config.webSiteTag) {
            this.setMsgs(new LoadingMsgAction("登录中", ""),
                new SuccessMsgAction("登录成功"),
                new ErrorMsgAction("登录失败"));
        }
    }
}

//登出
export class LogoutAction extends ApiAction {
    constructor() {
        let username = _getState().user.username;
        super("Account/Logout", {username}, "get");
    }
}

//登录密码修改
export class ApiChangePwdAction extends ApiAction {
    constructor(OldPwd, NewPwd) {
        super("User/UpdatePwd", {OldPwd, NewPwd});
        this.setMsgs(new LoadingMsgAction("登录密码修改中", ""),
            new SuccessMsgAction("登录密码修改成功"),
            new ErrorMsgAction("登录密码修改失败"));
    }
}

//支付密码修改
export class ApiChangePayPwdAction extends ApiAction {
    constructor(OldPwd, NewPwd) {
        super("User/UpdateWithdrawalPwd", {OldPwd, NewPwd});
        this.setMsgs(new LoadingMsgAction("支付密码修改中", ""),
            new SuccessMsgAction("支付密码修改成功"),
            new ErrorMsgAction("支付密码修改失败"));
    }
}

//获取会员信息
export class ApiPlayerInfoAction extends ApiAction {
    constructor() {
        super("Account/GetLoginUser", {}, "get");
    }
}


export class ApiFeedBackAction extends ApiAction {
    constructor(Content) {
        super("User/AddMessage", {Content, Title: "玩家反馈"}, "post");
    }

}

//会员绑定银行卡
export class ApiBindCardAction extends ApiAction {
    constructor(params) {
        let filter = {//后台要接收的参数
            BankId: "",
            Province: "",
            City: "",
            BranchName: "",
            AccountNo: "",
            AccountName: ""
        };
        params = merge(filter, params);
        super("Withdrawal/AddBankCard", params);
        this.setMsgs(new LoadingMsgAction("银行卡绑定中", ""),
            new SuccessMsgAction("银行卡绑定成功"),
            new ErrorMsgAction("银行卡绑定失败"));
    }
}

//获取会员绑定的银行卡
export class ApiBankAccountsAction extends ApiAction {
    constructor() {
        super("User/GetBankCards", {}, "get");
    }
}

//获取收款银行列表
export class ApiOfflineAccountsAction extends ApiAction {
    constructor(type = 1) {//(0：微信账号，1：银行卡号，2：支付宝账号，3：二维码（支付宝或微信）)
        super("Deposit/GetAdminBanks", {type: type}, 'get');
    }
}

//新增获取所有收款银行列表
export class ApiGetAdminAllBanksAction extends ApiAction {
    constructor() {
        super("Deposit/GetAdminAllBanks", {}, 'get');
    }
}

//获取用户可用支付银行列表
export class ApiPayBanksAction extends ApiAction {
    constructor(mobile = false) {
        super("Deposit/GetPayBanks", {mobile}, 'get');
    }
}

//获取在线支付银行列表
export class ApiOnlinePayAction extends ApiAction {
    constructor(mobile = false) {
        super("Deposit/GetOnlinePay", {mobile}, 'get');
    }
}

//提交在线支付
export class ApiSubmitOnlinePayAction extends ApiAction {
    constructor(body, OperateWebSite = WebSiteOperate) {
        let params = merge({OperateWebSite: window.Util.getHost(OperateWebSite)}, body);
        super("Pay/SubmitOnlinePay", params);
    }
}

//上传二维码到服务器获取服务器图片路径
export class ApiUploadafileAction extends ApiAction {
    constructor(formData) {
        super("common/uploadafile", formData);
    }
}

//绑定支付宝或者微信
export class ApiAddBankCardExtAction extends ApiAction {
    constructor(params) {
        let filter = {//后台要接收的参数
            CodeType: "",
            CodePath: "",
            AccountName: "",
            AccountNo: ""
        };
        params = merge(filter, params);
        super("Withdrawal/AddBankCardExt", params);
        this.setMsgs(new LoadingMsgAction("支付宝、微信绑定中", ""),
            new SuccessMsgAction("支付宝、微信绑定成功"),
            new ErrorMsgAction("支付宝、微信绑定失败"));
    }
}

//第三方支付提交 PayType=（2-微信支付,3-支付宝支付,4-QQ钱包,5-京东钱包,6-百度钱包,7-银联）
export class ApiThirdDepositAction extends ApiAction {
    constructor(Amount, PayType, OperateWebSite = WebSiteOperate) {
        if (PayType == "WECHAT") {
            PayType = 2
        } else if (PayType == "ALIPAY" || PayType == "ALIPAY_WAP") {
            PayType = 3
        } else if (PayType == "QQPAY" || PayType == "QQPAY_WAP") {
            PayType = 4
        } else if (PayType == "JDPAY" || PayType == "JDPAY_WAP") {
            PayType = 5
        } else if (PayType == "BAIDUPAY" || PayType == "BAIDUPAY_WAP") {
            PayType = 6
        } else if (PayType == "YLPAY" || PayType == "YLPAY_WAP") {
            PayType = 7
        }
        // ReturnType 期望返回的类型（0：Online，1：QRCode，2：QRLink）
        super("Pay/Submit2", {
            Amount,
            PayType,
            ReturnType: 1,
            Tag: config.webSiteTag,
            OperateWebSite: window.Util.getHost(OperateWebSite)
        });
        // this.setMsgs(new LoadingMsgAction("第三方支付二维码获取中", ""),
        //     new SuccessMsgAction("第三方支付二维码获取成功"),
        //     new ErrorMsgAction("第三方支付二维码获取失败"));
    }
}

//【在线网银】支付提交 PayType=1-在线网银支付,
export class ApiDepositAction extends ApiAction {
    constructor(Amount, BankNo, OperateWebSite = WebSiteOperate) {
        //ReturnType 期望返回的类型（0：Online，1：QRCode，2：QRLink）
        super("Pay/Submit2", {
            Amount,
            PayType: 1,
            BankNo,
            ReturnType: 2,
            Tag: config.webSiteTag,
            OperateWebSite: window.Util.getHost(OperateWebSite)
        });
        this.setMsgs(new LoadingMsgAction("银联支付链接获取中", ""),
            new SuccessMsgAction("银联支付链接获取成功"),
            new ErrorMsgAction("银联支付链接获取失败"));
    }
}

//【银行转账】
export class ApiOfflineDepositAction extends ApiAction {
    constructor(params) {
        let filter = {//后台要接收的参数
            BankId: "",
            TransType: "",
            Amount: "",
            Province: "",
            City: "",
            Address: "",
            AccountName: "",
            DepositType: 0,
            Tag: config.webSiteTag,//可以不传
            OperateWebSite: window.Util.getHost(WebSiteOperate)//可以不传
        };
        params = merge(filter, params);
        super("Deposit/Add", params);
        // this.setMsgs(new LoadingMsgAction("线下支付申请中", ""),
        //     new SuccessMsgAction("线下支付申请成功"),
        //     new ErrorMsgAction("线下支付申请失败"));
    }
}

//用户提款
export class ApiWithdrawAction extends ApiAction {
    constructor(params) {
        let filter = {//后台要接收的参数
            BankAccountId: "",
            Amount: "",
            WithdrawalPwd: "",
            CodeType: "",
            UserAuditConfirm: true,
            Tag: config.webSiteTag,//可以不传
            OperateWebSite: window.Util.getHost(WebSiteOperate)//可以不传
        };
        params = merge(filter, params);
        super("Withdrawal/Apply", params);
        let err = params.UserAuditConfirm ? new ErrorMsgAction("取款申请失败", "") : new ErrorMsgAction("申请确认", "");
        this.setMsgs(new LoadingMsgAction("取款申请中", ""),
            new SuccessMsgAction("取款申请成功", ""),
            err, "Withdrawal/Apply");
    }
}

//查询订单结果
export class ApiQueryOrderAction extends ApiAction {
    constructor(OrderNo) {
        super("Pay/QueryOrder", {OrderNo});
    }
}

//转账到中心钱包或游戏平台
export class ApiTransferAction extends ApiAction {
    constructor(GamePlatform, type, Amount, IsDemo = false, OperateWebSite = WebSiteOperate) {
        let title = GamePlatform + (type == "in" ? "转入" : "转出");
        Amount = Number(Amount);
        if (type == "in") {
            super("Transfer/ToGame", {
                GamePlatform,
                Amount,
                IsDemo,
                OperateWebSite: window.Util.getHost(OperateWebSite),
                Tag: config.webSiteTag
            });
        } else {
            super("Transfer/FromGame", {
                GamePlatform,
                Amount,
                IsDemo,
                OperateWebSite: window.Util.getHost(OperateWebSite),
                Tag: config.webSiteTag
            });
        }
        this.setMsgs(new LoadingMsgAction(title + "中", ""),
            new SuccessMsgAction(title + "成功"),
            new ErrorMsgAction(title + "失败")
        );
    }
}

//投注记录
export class ApiQueryBetRecordsAction extends ApiAction {
    constructor(FromDateTime, ToDateTime, GamePlatform, PageIndex = 0, PageSize = 10, SortName = "UpdateTime", SortOrder = "DESC") {

        let pramas = {PageIndex: PageIndex, PageSize, SortName, SortOrder, GamePlatform, FromDateTime, ToDateTime}
        if (!FromDateTime) {
            pramas.FromDateTime = window.Util.getNowDate(-7)
        }
        if (!ToDateTime) {
            pramas.ToDateTime = window.Util.getNowDate()
        }
        super("Bet/GetBetList", pramas, "get");
        // this.setMsgs(new LoadingMsgAction("投注记录获取中", ""),
        //     new SuccessMsgAction("投注记录获取成功"),
        //     new ErrorMsgAction("投注记录获取失败"));
    }
}

//转帐记录
export class ApiQueryTransferRecordsAction extends ApiAction {
    constructor(FromDateTime, ToDateTime, GamePlatform, PageIndex = 0, PageSize = 10, SortName = "Id", SortOrder = "DESC") {
        let params = {PageIndex: PageIndex, PageSize, SortName, SortOrder, GamePlatform, FromDateTime, ToDateTime}
        if (!FromDateTime) {
            params.FromDateTime = window.Util.getNowDate(-7)
        }
        if (!ToDateTime) {
            params.ToDateTime = window.Util.getNowDate()
        }
        super("Transfer/GetList", params, "get");
        // this.setMsgs(new LoadingMsgAction("转帐记录获取中", ""),
        //     new SuccessMsgAction("转帐记录获取成功"),
        //     new ErrorMsgAction("转帐记录获取失败"));
    }
}

//存款记录
export class ApiQueryDepositRecordsAction extends ApiAction {
    constructor(FromDateTime, ToDateTime, PageIndex = 0, PageSize = 10, SortName = "Id", SortOrder = "DESC") {
        let params = {PageIndex: PageIndex, PageSize, SortName, SortOrder, FromDateTime, ToDateTime};
        if (!FromDateTime) {
            params.FromDateTime = window.Util.getNowDate(-7)
        }
        if (!ToDateTime) {
            params.ToDateTime = window.Util.getNowDate()
        }
        super("Deposit/GetList", params, "get");
        // this.setMsgs(new LoadingMsgAction("存款记录获取中", ""),
        //     new SuccessMsgAction("存款记录获取成功"),
        //     new ErrorMsgAction("存款记录获取失败"));
    }
}

//取款记录
export class ApiQueryWithdrawRecordsAction extends ApiAction {
    constructor(FromDateTime, ToDateTime, PageIndex = 0, PageSize = 10, SortName = "Id", SortOrder = "DESC") {
        let params = {PageIndex: PageIndex, PageSize, SortName, SortOrder, FromDateTime, ToDateTime}
        if (!FromDateTime) {
            params.FromDateTime = window.Util.getNowDate(-7)
        }
        if (!ToDateTime) {
            params.ToDateTime = window.Util.getNowDate()
        }
        super("Withdrawal/GetList", params, "get");
        // this.setMsgs(new LoadingMsgAction("取款记录获取中", ""),
        //     new SuccessMsgAction("取款记录获取成功"),
        //     new ErrorMsgAction("取款记录获取失败"));
    }
}

// 优惠记录
export class ApiPromotionRecordsAction extends ApiAction {
    constructor(data) {
        //var userName = _getState().user.username;
        if (!data.startDate) {
            data.startDate = window.Util.getNowDate(-7)
        }
        if (!data.EndDate) {
            data.EndDate = window.Util.getNowDate()
        }
        data = merge({}, {PageSize: 15}, data)
        super("User/GetUserBonusRecord", data, "get");
    }
}

///User/GetUserBonusRecord
//获取短信验证码
export class ApiSendMobileVCodeAction extends ApiAction {
    constructor() {
        super("User/SendMobileVCode");
    }
}

//提交手机验证码
export class ApiValidatePhoneAction extends ApiAction {
    constructor(Phone, PhoneVCode) {
        super("User/ValidatePhone", {Phone, PhoneVCode});
    }
}

//获取广告图片
export class ApiImageAction extends ApiAction {
    constructor(Type = "pc_home_images") {
        if (config.webSiteTag && config.webSiteTag != "dafa") {
            Type = Type + '_' + config.webSiteTag
        }
        super("News/GetAds", {PageIndex: 0, PageSize: 10, Type: Type, SortName: "Sort", SortOrder: "ASC"}, 'get');
    }
}

//获取未读站内信數量
export class ApiSitemsgUnreadCountAction extends ApiAction {
    constructor() {
        super("User/GetUnreadSiteMsgs", {}, "get");
    }
}

//查询站内信
export class ApiQuerySitemsgsAction extends ApiAction {
    constructor(FromDateTime, ToDateTime, PageIndex = 0, PageSize = 10) {
        super("User/GetSiteMsgs", {FromDateTime, ToDateTime, PageIndex: PageIndex, PageSize}, 'get');
        // this.setMsgs(new LoadingMsgAction("站内消息获取中",""),
        //    new SuccessMsgAction("站内消息获取成功"),
        //    new ErrorMsgAction("站内消息获取失败"));
    }
}

//读取站内信
export class ApiReadSiteMsgAction extends ApiAction {
    constructor(Ids) {
        super("User/ReadSiteMsgs", {Ids}, 'post');
    }
}

//获取PC游戏分类
export class ApiPcGameCategoriesAction extends ApiAction {
    constructor() {
        super("client/pc_game_categories", {Tag: config.gameTag}, "get");

    }
}

//获取真人视讯视图数据
export class ApiLoadCasinoViewsAction extends ApiAction {
    constructor() {
        super("client/casino_views", {Tag: config.gameTag}, "get");
    }
}

//游戏相关
export class ApiQueryGamesAction extends ApiAction {
    constructor(filter, PageNo = 1, PageSize = 18) {
        let params = merge({
            PageNo,
            PageSize,
            TerminalType: "PC",
            GameMarks: "",
            GamePlatform: "",
            YoPlay: "",
            Tag: config.gameTag
        }, filter);
        super("client/games", params, 'get');
        //this.setMsgs(new LoadingMsgAction("游戏加载中", ""),
        //    new SuccessMsgAction("游戏加载成功"),
        //    new ErrorMsgAction("游戏加载失败"));
    }
}

//头部TAB游戏相关
export class ApiQueryTabGamesAction extends ApiAction {
    constructor(filter, PageNo = 1, PageSize = 666) {
        let params = merge({
            GameType: 4,
            PageNo,
            PageSize,
            TerminalType: "PC",
            GameMarks: "",
            GamePlatform: "",
            YoPlay: 0,
            Tag: config.gameTag,
            GameID: "708E596C1C3B4021A63208F1D0246DD3,8B6CFC00A0934ADE8A90FEC7ABEE6F8A,b6237828b0254b928a5ad490fa06ff5f,a509088a404d443e9f2b22c99f3b8113"
        }, filter);
        super("client/games", params, 'get');
    }
}

//AG捕鱼游戏相关
export class ApiQueryAgGamesAction extends ApiAction {
    constructor(filter, PageNo = 1, PageSize = 888) {
        let params = merge({
            GameType: 4,
            PageNo,
            PageSize,
            TerminalType: "PC",
            GameMarks: "",
            GamePlatform: "",
            YoPlay: 0,
            Tag: config.gameTag,
            GameID: "AC656FE07A6E414FBA69A1F5DAA05ED4,D649B66F3C164832AF7C63A94D0D6027"
        }, filter);
        super("client/games", params, 'get');
    }
}

//获取游戏登录地址
export class ApiGetLoginUrl extends ApiAction {
    constructor(filter = {}, OperateWebSite = WebSiteOperate, TransferFlag = false) {//传入的OperateWebSite是错误的，所以直接用全局的WebSiteOperate
        let params = merge({
            Tag: config.gameTag,
            OperateWebSite: window.Util.getHost(WebSiteOperate),
            TransferFlag
        }, filter);
        super("Game/GetLoginUrl", params, 'get');

        //this.setMsgs(new LoadingMsgAction("游戏链接获取中", ""),null,
        //    new ErrorMsgAction("游戏链接获取失败"))
    }
}


//PC自动转账操作前
export function beforeGetLogin(callback) {
    let callbackVar = {success: true, TransferFlag: false};
    let amount = parseInt(_getState().user.amount); //用户余额
    let autoTransfer = _getState().user.AutoTransfer; //自动转账开关状态

    if (config.spec !== "vns-cbd" && config.spec !== "bet365-BEE" && config.spec !== "newbet365-BBT") { //暂时只加3个站,所以判断一下
        callback(callbackVar);
        return;
    }else{
        if (autoTransfer) { //拦截所有获取游戏地址的接口,并开启自动转账. 默认开启
            callbackVar.TransferFlag = true;
            if (amount >= 1) { //余额>=1,自动转账并进入游戏
                callback(callbackVar);
                return;
            } else { //余额不足,则弹框提示是否充值/直接进入游戏
                Swal.fire({
                        title: "余额不足，前往充值?",
                        type: "warning",
                        showCloseButton: true,
                        showCancelButton: true,
                        showConfirmButton: true,
                        confirmButtonColor: "#c5841f",
                        cancelButtonColor: "#c5841f",
                        confirmButtonText: "前往充值",
                        cancelButtonText: "直接进入",
                    }).then((isConfirm) => {
                        try {
                            //判断 是否 点击的 确定按钮
                            if (isConfirm.value) {
                                browserHistory.push("/deposit");
                                callbackVar.success = false;
                                callback(callbackVar);
                            }
                            else {
                                if(isConfirm.dismiss === 'overlay' || isConfirm.dismiss === 'close' || isConfirm.dismiss === 'esc'){
                                    Swal.close();
                                }else {
                                    callback(callbackVar);
                                }
                            }
                        } catch (e) {
                            alert(e);
                        }
                    });;
            }
        } else { //关闭自动转账,进入游戏前判断余额
            if (amount >= 1) { //有余额则这里弹框提示: 自动转入/直接进入
                Swal.fire({
                        title: "平台余额不足，自动转入?",
                        type: "warning",
                        showCloseButton: true,
                        showCancelButton: true,
                        showConfirmButton: true,
                        confirmButtonColor: "#c5841f",
                        cancelButtonColor: "#c5841f",
                        confirmButtonText: "自动转入",
                        cancelButtonText: "直接进入",
                    }).then((isConfirm) => {
                        try {
                            //判断是否点击的是确定按钮
                            if (isConfirm.value) {
                                browserHistory.push("/deposit");
                                callbackVar.success = false;
                                callback(callbackVar);
                            }
                            else {
                                if(isConfirm.dismiss === 'overlay' || isConfirm.dismiss === 'close' || isConfirm.dismiss === 'esc'){
                                    Swal.close();
                                }else {
                                    callback(callbackVar);
                                }
                            }
                        } catch (e) {
                            alert(e);
                        }
                    });;;
            } else { //余额不足,这里提示充值/直接进入
                Swal.fire({
                        title: "余额不足，前往充值?",
                        type: "warning",
                        showCancelButton: true,
                        showCloseButton: true,
                        showConfirmButton: true,
                        confirmButtonColor: "#c5841f",
                        cancelButtonColor: "#c5841f",
                        confirmButtonText: "前往充值",
                        cancelButtonText: "直接进入",
                        // closeOnConfirm: true,
                        // closeOnCancel: true,
                    },
                ).then((isConfirm) => {
                    try { //判断 是否 点击的 确定按钮
                        if (isConfirm.value) {
                            browserHistory.push("/deposit");
                            callbackVar.success = false;
                            callback(callbackVar);
                        }
                        else {
                            if(isConfirm.dismiss === 'overlay' || isConfirm.dismiss === 'close' || isConfirm.dismiss === 'esc'){
                                Swal.close();
                            }else {
                                callback(callbackVar);
                            }
                        }
                    } catch (e) {
                        alert(e);
                    }
                });
            }
        }
    }
}


//劫持页过来的账号填写来源网站以及来源网站取款密码
export class ApiChangeSourceWithdrawalPasswordAction extends ApiAction {
    constructor(Source, Password) {
        super("User/ChangeSourceWithdrawalPassword", {Source, Password}, 'post');
        //this.setMsgs(new LoadingMsgAction("游戏链接获取中", ""),null,
        //    new ErrorMsgAction("游戏链接获取失败"))
    }
}

//获取游戏的分类数量
export class ApiQueryGameCountAction extends ApiAction {
    constructor(GamePlatform, GameMarks, YoPlay, GameType = "4", TerminalType = "PC") {
        super("client/game_count", {
            GamePlatform,
            GameMarks,
            GameType,
            YoPlay,
            TerminalType,
            Tag: config.gameTag
        }, 'get');
    }
}

//获取游戏的所有分类数量
export class ApiQueryGameAllCountAction extends ApiAction {
    constructor(GamePlatform, YoPlay, GameType = "4", TerminalType = "PC") {
        super("client/game_allcount", {GamePlatform, GameType, YoPlay, TerminalType, Tag: config.gameTag}, 'get');
    }
}

//获取电竞游戏
export class ApiQueryESportGamesAction extends ApiAction {
    constructor() {
        super("client/games", {
            GameType: 6,
            PageNo: 1,
            PageSize: 10,
            TerminalType: "PC",
            YoPlay: 0,
            Tag: config.gameTag
        }, 'get');
    }
}
//获取体育游戏
export class ApiQuerySportGamesAction extends ApiAction {
    constructor() {
        super("client/games", {
            GameType: 3,
            PageNo: 1,
            PageSize: 10,
            TerminalType: "PC",
            YoPlay: 0,
            Tag: config.gameTag
        }, 'get');
    }
}

//获取彩票游戏
export class ApiQueryBingoGamesAction extends ApiAction {
    constructor() {
        super("client/games", {
            GameType: 2,
            PageNo: 1,
            PageSize: 10,
            TerminalType: "PC",
            YoPlay: 0,
            Tag: config.gameTag
        }, 'get');
    }
}

//获取流水王数据
export class ApiQueryLeaderboardDataAction extends ApiAction {
    constructor(id, asd) {
        super("Leaderboard/dataview", {id, asd}, 'get');
    }
}

export class ApiQueryLeaderboardDefineAction extends ApiAction {
    constructor(asd) {
        super("Leaderboard/define", {asd}, 'get');
    }
}

// =================公共接口==================
//自动转账开关
export class ApiUpdateTransferSettingAction extends ApiAction {
    constructor(open, voice = 0) {//0关,1开
        super("User/UpdateTransferSetting", {AutoTransfer: open, EnableVoice: voice}, 'post');
        this.setMsgs(new LoadingMsgAction("自动转账切换中", ""),
            new SuccessMsgAction("自动转账切换成功"),
            new ErrorMsgAction("自动转账切换失败"));
    }
}

//签到接口
export class ApiSignInAction extends ApiAction {
    constructor() {
        super("User/Sign", {Tag: config.gameTag, OperateWebSite: window.Util.getHost(WebSiteOperate)}, 'get');
    }
}

//获取签到天数
export class ApiSignContinueDaysAction extends ApiAction {
    constructor() {
        super("User/SignContinueDays", {
            Tag: config.gameTag,
            OperateWebSite: window.Util.getHost(WebSiteOperate)
        }, 'get');

    }
}

//获取【积分商品分类】
export class ApiMerchandiseCategoryAction extends ApiAction {
    constructor() {
        super("Integral/GetMerchandiseCategory", {
            Tag: config.gameTag,
            OperateWebSite: window.Util.getHost(WebSiteOperate)
        }, 'get');
    }
}

//获取【积分商品信息列表】
export class ApiMerchandiseListAction extends ApiAction {
    constructor(params) {
        let filter = {//后台要接收的参数
            Id: "",
            Title: "",
            CategoryId: "",
            Type: "",
            PageIndex: 0,
            PageSize: 20,
            Tag: config.gameTag,
            OperateWebSite: window.Util.getHost(WebSiteOperate)
        };
        params = merge(filter, params);
        super("Integral/GetMerchandiseList", params, 'get');
    }
}

//【积分商品兑换】
export class ApiConsumeIntegralAction extends ApiAction {
    constructor(params) {
        let filter = {//后台要接收的参数
            MerchandiseId: "",
            MerchandiseCount: "",
            OperateWebSite: window.Util.getHost(WebSiteOperate)
        };
        params = merge(filter, params);
        super("User/ConsumeIntegral", params, 'post');
    }
}

/*===========================WAP端的API=================================*/

//登录后 初始化调用的接口
export class LoginAfterInit {
    constructor() {
        new ApiQueryPromotionsAction().fly();
        new ApiSitemsgUnreadCountAction().fly();
        new ApiGetFavoritesAction().fly();
        new ApiGamePlatformAllBalanceAction().fly();
        new ApiGetAdminAllBanksAction().fly();
        new ApiBankAccountsAction().fly();
        new ApiPayBanksAction(true).fly();
        new ApiOnlinePayAction(true).fly();
        new ApiPlayerInfoAction().fly();
    }
}

//获取wap游戏分类
export class ApiWapGameCategoriesAction extends ApiAction {
    constructor(CategoryIds = "mobile_home") {
        super("client/wap_game_categories", {CategoryIds, Tag: config.gameTag}, "get");
        this.setMsgs(new LoadingMsgAction("", ""),
            new SuccessMsgAction(""),
            new ErrorMsgAction(""));
    }
}

//添加游戏到收藏夹
export class ApiAddFavoriteAction extends ApiAction {
    constructor(GameId) {
        super("Game/AddFavorite", {GameId, Tag: config.gameTag}, "post");
    }
}

//删除游戏收藏
export class ApiDeleteFavoriteAction extends ApiAction {
    constructor(GameId) {
        super("Game/DeleteFavorite", {GameId, Tag: config.gameTag}, "post");
    }
}

//获取游戏收藏
export class ApiGetFavoritesAction extends ApiAction {
    constructor(PageIndex = 0, PageSize = 20) {
        super("Game/GetFavorites", {PageSize, PageIndex, Tag: config.gameTag}, "get");
    }
}

//登陸日志
export class ApiLoginLogsAction extends ApiAction {
    constructor() {
        super("User/LogLogins", {PageIndex: 1, PageSize: 10}, 'get');
    }
}

/*===========================未修改的action=================================*/

//没有找到哪个业务代码中使用过该API
export class ApiBestGameRespAction extends ApiAction {
    constructor() {
        super("best_games");
    }
}

//没有找到哪个业务代码中使用过该API
export class ApiPromoApply extends ApiAction {
    constructor(key) {
        super("promo_apply", {key: key});
    }
}

//在业务代码PreferencesPage.js中使用 读取【偏好设置】
export class LoadSystemConfigAction extends ApiAction {
    constructor() {
        super("load_system_config");
    }
}

//在业务代码PreferencesPage.js中使用 保存【偏好设置】
export class SaveSystemConfigAction extends ApiAction {
    constructor(autoTransfer = true, voice = true) {
        super("save_system_config");
        this.obj.config = {autoTransfer, voice};
    }
}

// 保存【头像,背景图】
export class SaveUpdateSceneimageAction extends ApiAction {
    constructor(ImagePath = "", SceneImage = "") {
        super("User/UpdateSceneimage", {ImagePath, SceneImage}, 'post');
    }
}

export class ApiForgetPwd1Action extends ApiAction {
    // EMAIL|PHONE
    constructor(username, method) {
        var state = _getState();
        super("forget_pwd1", {username, method, encryptCode: state.verifycode.encryptCode});
        this.setMsgs(new LoadingMsgAction("重设密码验证码申请中", ""),
            new SuccessMsgAction("重设密码验证码申请成功"),
            new ErrorMsgAction("重设密码验证码申请取失败"));
    }
}

export class ApiForgetPwd2Action extends ApiAction {
    constructor(username, method, checkCode, password) {
        super("forget_pwd2", {username, method, checkCode, password});
        this.setMsgs(new LoadingMsgAction("重设密码中", ""),
            new SuccessMsgAction("重设密码成功"),
            new ErrorMsgAction("重设密码失败"));
    }
}

//修改用户信息（棋牌）
export class ApiUpdateUserInfoAction extends ApiAction {
    constructor(UserInfo) {
        var user = _getState().user;
        super("User/UpdateInfo", {
            TrueName: user.realName, Phone: UserInfo.phone, Email: UserInfo.email, Birthday: UserInfo.birthday
            , QQ: user.qq, WebChat: UserInfo.webChat, Province: user.province, City: user.city, Address: user.address
        })
    }
}

export function authToLink(link) {
    var state = _getState();
    if (!state.user || !state.user.token) {
        window.$("#reserveDialog_login").modal("show");
        return false;
    }
    window.open(link, "_blank");
    return true;
}

export function auth() {
    var state = _getState();
    if (!state.user || !state.user.token) {
        window.$("#reserveDialog_login").modal("show");
        return false;
    }
    return true;
}

export function IntoRoom() {
    var state = _getState();
    if (!state.user || !state.user.token) {
        window.$("#reserveDialog_login").modal("show");
        return false;
    } else if (state.user || state.user.token) {
        window.$("#IntoRoom").modal("show");
        return true;
    }
    return true;
}

export function wapAuth(isGoto) {//判断是否跳转Login【页面】
    let state = _getState();
    if (!state.user || !state.user.token) {
        if (isGoto) {
            window.wapHistoryType.push('/login')
        }
        return false;
    }
    return true;
}

export function isShowDownApp(flag = true) {
    let data = {flag};
    _dispatch({type: "isShowDownApp", data});
}

export function wapLogin(flag = false) {//判断是否弹出Login【弹出层】
    let state = _getState();
    let data = {};
    data.flag = flag;
    if (!flag) _dispatch({type: "showLoginModal", data});
    if (!state.user || !state.user.token) {
        _dispatch({type: "showLoginModal", data});
        return false;
    }
    return true;
}

export function showChessModal(flag = false, popType = "my", tabType = "grxx", popWith = "10rem", popHeight = "6.5rem") {//控制Chess棋牌弹窗显示
    // let state = _getState();
    if (!wapAuth(true)) return false;
    let data = {
        flag,
        popType,
        tabType,
        popWith,
        popHeight,
    };
    _dispatch({type: "showChessModal", data});
    return true;
}

export function ChangeLinkID(data) {
    let obj = {type: "ChangeLinkID", data};
    _dispatch(obj);
}

//代理注册提款银行的列表
export class ApiagentBanks extends ApiAction {
    constructor() {
        super("Agent/Portal_Bank", {}, "get")
    }
}

//代理注册提交
export class ApiAgentRegisterAction extends ApiAction {
    constructor(params) {
        let filter = {//后台要接收的参数
            UserName: "",
            TrueName: "",
            Password: "",
            Email: "",
            Phone: "",
            QQ: "",
            Birthday: "",
            Wechat: "",
            Referer: "",
            WithdrawalPassword: "",//可以不传
        };
        params = merge(filter, params);
        super("Agent/Apply", params);
    }
}


/*
    【移除的接口】
    和接口ApiImageAction重复了
    export class ApiHomeImageAction extends ApiAction {
        constructor() {
            super("News/GetAds", {PageIndex:1, PageSize:10, Type:"pc_home_images",SortName:"Sort",SortOrder:"DESC"},'get');
        }
    }

    （因为都是假数据建议业务代码中自己造吧）
    export class ApiRealtimeStatAction extends ApiAction {
        constructor() {
            super("realtime_stat");
        }
    }

    数据在config/offlineTransferJson内
    export class ApiOfflineTransferTypesAction extends ApiAction {
        constructor() {
            super("offline_transfer_types");
        }
    }
    验证码已用前台组件实现global/Components/VerifyCode
    export class ApiVerifyCodeAction extends ApiAction {
        constructor() {
            super("verifycode");
        }
    }
    已经在ApiPayBanksAction接口里面实现，对应的stroe【payThirdInfos】
    export class ApiPayThirdAction extends ApiAction {
        constructor() {
            super("pay_third");
        }
    }

    agent页面的API  感觉可以请求ApiAllSysConfigAction
    export class ApiSysConfAction extends ApiAction {
        constructor(key) {
            super("sys_conf", {key});
        }
    }
*/
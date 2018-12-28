// ipfs-http-client
// https://github.com/chyingp/nodejs-learning-guide
// https://blog.csdn.net/zhujun_xiaoxin/article/details/79090976
// NodeJS下载文件实例 -- https://www.cnblogs.com/lishuyi/p/5213505.html
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");   // 文件上传
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");    // session保持
const deploy = require("./deploy.js");

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
Date.prototype.myformat = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

deploy.getDeployedContract(function (contractInstance) {
    // songtags
    let songtags = ["未知", "经典", "民谣", "情歌", "纯音乐",
        "伤感", "英语", "欧美", "日文", "中文",
        "古典", "青春", "热血", "悲伤", "欢快",];

    var port = process.env.port || 3000;
    var app = express();
    app.set("views", "../views");
    app.set("view engine", "pug");
    app.listen(port);
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    //设置cookie，session
    app.use(cookieParser('secret'));
    (function () {
        var arr = [];
        for (var i = 0; i < 10000; i++)
            arr.push('keys_' + Math.random());
        app.use(cookieSession({
            name: 'music_session',
            keys: arr,
            maxAge: 20 * 60 * 1000 // 20分钟
        }))
    })();
    app.use("/client", express.static("../../client"));
    app.use("/music", express.static("../upload"));
    // const upload = multer({ dest: "../upload" });    // 文件名是一串编码；可以把文件存在硬盘的任意地方(设置绝对路径)
    var storage = multer.diskStorage({
        destination: function (req, file, cb) { cb(null, "../upload"); },
        filename: function (req, file, cb) {
            // console.log(file.fieldname); // songfile
            // console.log(file.filename);  // undefined
            // console.log(file.originalname);  // test.txt
            // cb(null, Date.now() + " " + file.originalname);
            cb(null, (new Date()).myformat("yyyy-MM-dd hh-mm-ss") + "  " + file.originalname);
        }
    });
    var upload = multer({ storage: storage });
    app.use(upload.single("songfile"));
    // app.use(upload.any());   // ???
    // app.use(upload.array("file", 10));   // 可以接受音乐文件数组，最多10个，但需要req.files

    function checkAddress(using_address) {
        if (isNaN(using_address)) {
            console.log(using_address + "无效1！");
            return false;
        }
        var flag = true;
        var accounts = deploy.web3.eth.accounts;
        for (var index in accounts)
            if (accounts[index] == using_address) {
                flag = false;
                break;
            }
        if (flag) {
            console.log(using_address + "无效2！");
            return false;
        }
        return true;
    }

    app.use(function (req, res, next) {
        console.log(req.session);
        if (!req.session["user_address"] && req.url != "/login") res.redirect("/login");
        else next();
    });

    app.get("/login", (req, res) => {
        console.log("get /login");
        res.render("index", { title: "Music", login: true });
    });

    app.post("/login", (req, res) => {
        console.log("post /login");
        let { username, registeraddress, userdesc, loginaddress } = req.body;
        let isRegister = typeof loginaddress == "undefined";
        let using_address = isRegister ? registeraddress : loginaddress;
        // 验证地址
        if (!checkAddress(using_address)) res.status(500).send({ code: 500, data: [], msg: 'invalid address!' });
        // 登陆
        if (!isRegister) {
            if (contractInstance.users(loginaddress)[0] == '0x0000000000000000000000000000000000000000') {
                console.log(loginaddress + "还没有注册！");
                res.status(400).send({ code: 400, data: [], msg: 'not yet registered!' });
            } else {
                console.log(loginaddress + "成功登陆了！");
                req.session["user_address"] = loginaddress;
                res.status(200).send({ code: 200, data: [], msg: 'login successful!' });
            }
            return;
        }
        // 注册
        if (contractInstance.users(registeraddress)[0] == '0x0000000000000000000000000000000000000000') {
            contractInstance.createUser(username, userdesc, [], [], {
                from: registeraddress,
                value: 0,
                gas: 200000
            });
            console.log(registeraddress + "成功注册了！");
            req.session["user_address"] = registeraddress;
            res.status(200).send({ code: 200, data: [], msg: 'register successful!' });
        } else {
            console.log(registeraddress + "已经注册了！");
            res.status(400).send({ code: 400, data: [], msg: 'already registered!' });
        }
    });

    app.get("/main", (req, res) => {
        // 获取自己拥有的音乐(包括购买与)
        if (req.query["musiclist"]) {
            console.log("get /main musiclist");
            let musiclist = [];
            let musicListNum = parseInt(req.query["musiclist"]);
            let nowNum = 0;
            let userAddress = req.session["user_address"];
            let user = contractInstance.users(userAddress);
            let releaseMusics = contractInstance.getReleaseMusics({ from: userAddress });
            let purchaseMusics = contractInstance.getPurchaseMusics({ from: userAddress });
            for (let i in releaseMusics) {
                if (nowNum >= musicListNum) {
                    let music = contractInstance.musics(releaseMusics[i].toNumber());
                    musiclist.push({ singer: user[3], name: music[2], genre: music[4], musicid: music[1].toNumber() + "" });
                }
                ++nowNum;
            }
            for (let i in purchaseMusics) {
                if (nowNum >= musicListNum) {
                    let music = contractInstance.musics(purchaseMusics[i].toNumber());
                    let singer = contractInstance.users(music[0]);
                    musiclist.push({ singer: singer[3], name: music[2], genre: music[4], musicid: music[1].toNumber() + "" });
                }
                ++nowNum;
            }
            res.status(200).json(musiclist);
        }
        // 获得所有音乐
        else if (req.query["musicalbums"]) {
            console.log("get /main musicalbums");
            let musicAlbumNum = parseInt(req.query["musicalbums"]) * 6;
            let musicalbums = [];
            let singerNum = contractInstance.getSingerNums().toNumber();
            for (let i = musicAlbumNum; i < musicAlbumNum + 6 && i < singerNum; ++i) {
                let musicalbum = {};
                let address = contractInstance.singer_addresses(i);
                if (address == req.session["user_address"]) continue;
                musicalbum["singer"] = contractInstance.users(address)[3];
                musicalbum["address"] = address;
                musicalbum["songs"] = [];
                let releaseMusics = contractInstance.getReleaseMusics({ from: address });
                for (let j in releaseMusics) {
                    if (j >= 3) break;
                    let music = contractInstance.musics(releaseMusics[j].toNumber());
                    musicalbum["songs"].push({ title: music[2], genre: music[4], musicid: music[1].toNumber() + "" });
                }
                musicalbums.push(musicalbum);
            }
            res.status(200).json(musicalbums);
        }
        // 获得某个歌手的音乐
        else if (req.query["singeraddress"]) {
            let singeraddress = req.query["singeraddress"];
            // 验证地址
            if (!checkAddress(singeraddress)) res.status(500).send({ code: 500, data: [], msg: 'invalid address!' });
            // 获得该歌手所有歌曲
            let singer = contractInstance.users(singeraddress);
            let musicalbum = {singer: singer[3], songs: []};
            let releaseMusics = contractInstance.getReleaseMusics({ from: singeraddress });
            for (let j in releaseMusics) {
                let music = contractInstance.musics(releaseMusics[j].toNumber());
                musicalbum["songs"].push({
                    title: music[2],
                    genre: music[4],
                    desc: music[3],
                    musicid: music[1].toNumber() + "",
                    price: music[5].toNumber() + ""
                });
            }
            res.status(200).json(musicalbum);
        }
        // 进入主页面
        else {
            console.log("get /main");
            let user = contractInstance.users(req.session["user_address"]);
            let name = user[3].length ? user[3] : "无名氏";
            let desc = user[4].length ? user[4] : "这个人很懒，什么都没留下";
            let totalAlbums = contractInstance.getSingerNums().toNumber();
            if (contractInstance.getReleaseMusicsNum({ from: req.session["user_address"] }).toNumber())
                --totalAlbums;
            if (desc.length > 200) desc = desc.substr(0, 197) + "...";
            // res.render("index", { title: "Music", main: true, musicalbums: musicalbums, songtags: songtags, musiclist: musiclist });
            res.render("index", {
                title: "Music",
                main: true,
                songtags: songtags,
                totalAlbums: totalAlbums,
                user: { name: name, desc: desc, deposit: user[1].toNumber() + "", address: user[0] }
            });
        }
    });

    app.post("/main", (req, res) => {
        console.log("post /main");
        console.log(req.body);
        if (req.body["changeUser"] && req.body["changeUser"] == "true") {
            let { username, userdesc, userdeposit } = req.body;
            contractInstance.changeUserInfo(username, userdesc, { from: req.session["user_address"], gas: 100000 });
            if (userdeposit.length)
                contractInstance.addDeposit({ from: req.session["user_address"], value: parseInt(userdeposit), gas: 100000 });
        } else if (req.body["searchMusic"] && req.body["searchMusic"] == "true") {
            let { searchtext, selecttag } = req.body;
            // 搜索音乐，暴力搜索？？？
        }
        res.status(200).send({ code: 200, data: [], msg: "???" });
    });

    app.get("/upload", (req, res) => {
        console.log("get /upload");
        res.render("index", { title: "Music", upload: true, songtags: songtags });
    });

    app.post("/upload", (req, res) => {
        console.log("post /upload");
        console.log(req.file);
        console.log(req.body);
        let { songname, songdesc, songtag1, songtag2, songprice } = req.body;
        let songtag = "";
        if (typeof songtag1 == "string" && songtag1.length)
            songtag = songtag1;
        else if (songtag1 instanceof Array && songtag1.length)
            songtag = songtag1.join(" ");
        if (songtag2.length) {
            if (songtag.length) songtag += " ";
            songtag += songtag2;
            songtags.concat(songtag2.split(" "));
        }
        songprice = songprice.length ? parseInt(songprice) : 0;
        console.log("开始创建音乐");
        contractInstance.createMusic(songname, songdesc, songtag, songprice, "", req.file.filename, {
            from: req.session["user_address"],
            value: 0,
            gas: 5000000
        });
        res.status(200).send({ code: 200, data: [], msg: "add music successful!" });
    });

    app.get("/download/:id", (req, res) => {
        let songName = contractInstance.musics(req.params.id)[7];
        let songPath = "../upload/" + songName;
        console.log("get download " + songPath);
        res.download(songPath);
        // let s = fs.createReadStream(songPath);
        // res.writeHead(200, {
        //     "Content-Type": "application/force-download",
        //     "Content-Disposition": "attachment; filename=" + songName.split("  ")[1],
        // });
        // s.pipe(res);
    });

    app.post("/purchase", (req, res) => {
        console.log("post purchase");
        let musicid = parseInt(req.body.musicid);
        let address = req.session["user_address"];
        if (!checkAddress(address)) res.status(400).send({ code: 400, msg: '服务器内部错误--无效地址!' });
        // let flag = 0;
        // let watcher = contractInstance.purchaseResult(function (error, data) {
        //     if (flag > 0) return;
        //     else ++flag;
        //     watcher.stopWatching();
        //     let temp = data.args.result.toNumber();
        //     if (temp == 1)
        //         res.status(401).send({ code: 401, msg: '你的余额不足，请及时充值' });
        //     else if (temp == 2)
        //         res.status(402).send({ code: 402, msg: '你已购买此歌' });
        //     else if (temp == 3)
        //         res.status(403).send({ code: 403, msg: "不能购买自己发布的歌" });
        //     else if (temp == 0)
        //         res.status(200).send({ code: 200, msg: "成功购买此歌" });
        //     res.status(500).send({code: 500, msg: '服务器内部发生未知错误'});
        // });
        // contractInstance.purchaseMusic(musicid, {from: address});
        let temp = contractInstance.canPurchase(musicid, { from: address }).toNumber();
        if (temp == 1)
            res.status(401).send({ code: 401, msg: '你的余额不足，请及时充值' });
        else if (temp == 2)
            res.status(402).send({ code: 402, msg: '你已购买此歌' });
        else if (temp == 3)
            res.status(403).send({ code: 403, msg: "不能购买自己发布的歌" });
        else if (temp == 0) {
            contractInstance.purchaseMusic(musicid, { from: address });
            res.status(200).send({ code: 200, msg: "成功购买此歌" });
        }
        else
            res.status(500).send({code: 500, msg: '服务器内部发生未知错误'});
    });
});
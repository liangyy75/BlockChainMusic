let fs = require("fs");
let solc = require("solc");
let Web3 = require("web3");
let web3;

// 部署合约
module.exports.getDeployedContract = callback => {
    if (typeof web3 !== "undefined") {
        web3 = new Web3(web3.currentProvider);
    } else {
        web3 = new Web3(
            new Web3.providers.HttpProvider("http://localhost:8545")
        );
    }
    module.exports.web3 = web3;
    // 编译合约
    let source = fs.readFileSync("../constracts/MusicContract.sol", "utf-8");
    let compiledConstract = solc.compile(source);
    // console.log(compiledConstract)
    let abi = JSON.parse(compiledConstract.contracts[":MusicContract"].interface);
    let bytecode = compiledConstract.contracts[":MusicContract"].bytecode;
    let MyContract = web3.eth.contract(abi);

    console.log("开始部署合约");
    let deployedContract = MyContract.new(
        {
            data: bytecode,
            from: web3.eth.accounts[0],
            gas: 4700000
        },
        (err, contractInstance) => {
            if (!err) {
                if (!contractInstance.address) {
                    console.log(
                        "第一次调用：contract deploy transaction hash: " +
                            contractInstance.transactionHash
                    ); //部署合约的交易哈希值
                } else {
                    console.log(
                        "第二次调用：contract deployed address: " +
                            contractInstance.address
                    );
                    //测试合约调用
                    console.log(module.exports.web3.eth.accounts);
                    console.log("部署合约成功");
                    // console.log("开始添加音乐tag");
                    // let songtags = ["未知", "经典", "民谣", "情歌", "纯音乐",
                    //     "伤感", "英语", "欧美", "日文", "中文",
                    //     /*"古典", "青春", "热血", "悲伤", "欢快",*/];
                    // songtags.forEach((value) => { contractInstance.addSongTag(value, {from: web3.eth.accounts[0]}); });
                    // console.log("现有标签数：" + contractInstance.getTagNums().toNumber());
                    callback(contractInstance);
                }
            } else {
                console.log("部署合约出错");
                console.log(err);
            }
        }
    );
};

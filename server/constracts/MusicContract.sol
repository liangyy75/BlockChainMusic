pragma solidity ^0.4.23;

contract Ownable {
	address private owner;
	event changeOwnerListener(address indexed previousOwner, address indexed newOwner);

	modifier onlyOwner() {
		require(msg.sender == owner);
		_;
	}

	constructor() public {
		owner = msg.sender;
	}

	function getOwner() public view returns (address) {
		return owner;
	}

	function changeOwner(address newOwner) onlyOwner public {
		require(newOwner != address(0) && newOwner != owner, "Invalid Owner change!");
		emit changeOwnerListener(owner, newOwner);
		owner = newOwner;
	}
}

// 智能合约
contract MusicContract is Ownable {
	enum UserGrade {normal, halfVip, vip}
	
	struct User {
		address owner;		// 用户address
		uint deposit;		// 用户账户存款
		UserGrade grade;	// 用户vip等级
		string name;		// 用户名
		string desc;		// 用户描述
		uint[] purchaseMusics;	// 拥有的音乐的id(包括购买的与免费的)
		uint[] releaseMusics;	// 发布的音乐的id，这里是作为歌手而具有的属性
	}
	
	struct Music {
		address owner;	// 歌曲拥有者
		uint id;		// 歌曲编号
		// string link;	// 歌曲链接
		string title;	// 歌曲名称
		string desc;	// 歌曲描述
		string genre;	// 歌曲类型
		uint price;	// 歌曲价格
		string artwork;	// 歌曲封面(的hash)
		string file;	// 歌曲文件(的hash)
	}
	
	mapping(address => User) public users;		// 用户列表
	address[] public singer_addresses;			// 歌手地址
	Music[] public musics;						// 歌曲列表
	event NewUser(address owner, string name, string desc);
	event NewSinger(address owner, string name, string desc);
	event NewMusic(address owner, string musicTitle, string singerName, string musicDesc,
		string singerDesc);
	event purchaseResult(uint result);

	// 获得某个用户 拥有的音乐的id
	function getPurchaseMusics() public view returns (uint[]) {
		return users[msg.sender].purchaseMusics;
	}

	// 获得某个用户 发布的音乐的id
	function getReleaseMusics() public view returns (uint[]) {
		return users[msg.sender].releaseMusics;
	}

	// 获得歌手数量
	function getSingerNums() public view returns (uint) {
		return singer_addresses.length;
	}

	// 获得用户发行的音乐的数量
	function getReleaseMusicsNum() public view returns (uint) {
		return users[msg.sender].releaseMusics.length;
	}

	// 获得歌曲数量
	function getMusicNum() public view returns (uint) {
		return musics.length;
	}

	/// 注册新用户
	function createUser(string memory _name, string memory _desc, uint[] memory _purchaseMusics,
		uint[] memory _releaseMusics) public payable {
		emit NewUser(msg.sender, _name, _desc);
		users[msg.sender] = User({owner: msg.sender, deposit: msg.value, grade: UserGrade.normal,
			name: _name, desc: _desc, purchaseMusics: _purchaseMusics, releaseMusics: _releaseMusics});
	}
	
	/// 注册新歌
	function createMusic(/*string memory _link,*/ string memory _title, string memory _desc, string memory
		_genre, uint _price, string memory _artwork, string memory _file) public returns (uint) {
		require(_price >= 0, "The price must not be an negative number.");
		uint id = musics.length;
		User storage user = users[msg.sender];
		if (user.releaseMusics.length == 0) {
			emit NewSinger(msg.sender, user.name, user.desc);
			singer_addresses.push(msg.sender);
		}
		user.releaseMusics.push(id);
		musics.push(Music(msg.sender, id, /*_link,*/ _title, _desc, _genre, _price, _artwork, _file));
		emit NewMusic(msg.sender, _title, user.name, _desc, user.desc);
		return id;
	}

	// 检测能否购买歌曲
	function canPurchase(uint _id) public view returns (uint) {
		User storage user = users[msg.sender];
		for (uint i = 0; i < user.purchaseMusics.length; i++)
			if (user.purchaseMusics[i] == _id) return 3;
		for (i = 0; i < user.releaseMusics.length; i++)
			if (user.releaseMusics[i] == _id) return 2;
		if (musics[_id].price > user.deposit) return 1;
		return 0;
	}

	/// 购买歌曲
	function purchaseMusic(uint	_id) public {
		User storage user = users[msg.sender];
		for (uint i = 0; i < user.purchaseMusics.length; i++)
			// require(user.purchaseMusics[i] != _id, "You have purchase the music");
			if (user.purchaseMusics[i] == _id) emit purchaseResult(2);
		for (i = 0; i < user.releaseMusics.length; i++)
			// require(user.purchaseMusics[i] != _id, "You have purchase the music");
			if (user.releaseMusics[i] == _id) emit purchaseResult(3);
		uint price = musics[_id].price;
		if (user.grade == UserGrade.normal) {
			// require(user.deposit >= price, "The menoy is not enough, please charge your money");
			if (user.deposit >= price) emit purchaseResult(1);
			user.deposit -= price;
			users[musics[_id].owner].deposit += price;
		} else if (user.grade == UserGrade.halfVip) {
			// require(user.deposit >= price / 2, "The menoy is not enough, please charge your money");
			if (user.deposit >= price / 2) emit purchaseResult(1);
			user.deposit -= price / 2;
			users[musics[_id].owner].deposit += price / 2;
		} else if (user.grade == UserGrade.vip) {
			// require(user.deposit >= price / 4, "The menoy is not enough, please charge your money");
			if (user.deposit >= price / 4) emit purchaseResult(1);
			user.deposit -= price / 4;
			users[musics[_id].owner].deposit += price / 4;
		}
        user.purchaseMusics.push(_id);
		emit purchaseResult(0);
	}

	/// 充钱
	function addDeposit() public payable {
		users[msg.sender].deposit += msg.value;
	}

	/// 改变用户信息
	function changeUserInfo(string memory _name, string memory _desc) public {
		users[msg.sender].name = _name;
		users[msg.sender].desc = _desc;
	}

	/// --------------------- 以下由于时间问题，暂不在后台实现和调用 --------------------- ///
	/// 取出钱
	function withdraw() public payable {
		require(users[msg.sender].deposit != 0, "Your account has no money");
		msg.sender.transfer(users[msg.sender].deposit);
		users[msg.sender].deposit = 0;
	}

	/// 充会员
	function becomVip(uint _vipType) public payable {
		User storage user = users[msg.sender];
		require(user.grade != UserGrade.vip, "Your grade has been improved to gold grade!");
		if (_vipType == 2 && msg.value == 200) {
			require(user.grade == UserGrade.normal, "Your grade has been larger then normal grade!");
			user.grade = UserGrade.halfVip;
			getOwner().transfer(msg.value);
		}
		else if (_vipType == 3 && msg.value == 400) {
			require(user.grade == UserGrade.halfVip, "Your grade has been larger then sliver grade!");
			user.grade = UserGrade.vip;
			getOwner().transfer(msg.value);
		}
	}

	/// 改变歌曲信息
	function changeMusicInfo(uint _id, /*string memory _link,*/ string memory _title, string memory _desc,
		string memory _genre, uint _price, string memory _artwork, string memory _file) public {
		require(msg.sender == musics[_id].owner);
		require(_price >= 0, "The price must not be an negative number.");
		musics[_id] = Music(msg.sender, _id, /*_link,*/ _title, _desc, _genre, _price, _artwork, _file);
	}
}
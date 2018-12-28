// https://www.cnblogs.com/cyy-13/p/5775344.html -- JS页面跳转大全
$(document).ready(() => {
    // 绑定请求音乐的事件
    function bind() {
        // 查看音乐
        $(".albumcard").click(function (e) {
            $("#allmusic").hide();
            $("#singerpane").fadeIn(300);
            let singername = $("#singername");
            let singeraddress = $(e.currentTarget).attr("data-address");
            if (singeraddress == singername.attr("data-address")) return;
            $.getJSON("/main", { "singeraddress": singeraddress }, function (data) {
                // console.log(data);
                if (!data.error) {
                    singername.text(data.singer);
                    let musicPaneBody = $("#musicPaneBody");
                    musicPaneBody.empty();
                    let songs = data["songs"];
                    songs.forEach((value, index, array) => {
                        musicPaneBody.append($('<tr><td class="col-md-2">' + value.title + '</td><td class="col-md-2">'
                            + value.desc + '</td><td class="col-md-6">' + value.desc + '</td><td class="col-md-2">'
                            + '<a class="glyphicon glyphicon-shopping-cart purchase" data-musicid="' + value.musicid
                            + '" data-price="' + value.price + '"></a>  ' + value.price + ' eth</td></tr>'));
                    });
                    // 购买音乐
                    $(".purchase").click(function (e) {
                        let target = $(e.currentTarget);
                        let musicid = target.attr("data-musicid");
                        let price = target.attr("data-price");
                        if (confirm("确认购买此音乐？")) {
                            $.ajax({
                                type: "POST",
                                url: "/purchase",
                                data: { "musicid": musicid },
                                success: response => { alert("购买音乐成功！") },
                                error: response => { alert(response.msg); }
                            });
                        }
                    });
                }
                else confirm("请求 music album 数据失败");
            });
        });
    }
    // 请求数据
    function getMusicList() {
        let musicSheetBody = $("#musicSheetBody");
        let musicListNum = musicSheetBody.children("tr").length;
        // console.log("" + musicListNum);
        $.getJSON("/main", { "musiclist": "" + musicListNum, }, function (data) {
            // console.log(data);
            if (!data.error) {
                data.forEach((value, index, array) => {
                    musicSheetBody.append($("<tr>" +
                        '<td class="col-md-4">' + value.singer + '</td>' +
                        '<td class="col-md-3">' + value.name + '</td>' +
                        '<td class="col-md-3">' + value.genre + '</td>' +
                        '<td class="col-md-2"><a class="glyphicon glyphicon-download download" href="/download/' +
                        value.musicid + '"></a></td>'));
                });
                // confirm("请求 music list 数据成功");
            } else confirm("请求 music list 数据失败");
        });
    }
    function getMusicAlbums(num) {
        let albumcards = $(".albumcards");
        let musicAlbumNum = parseInt(albumcards.attr("data-albumIndex")) + num;
        let totalAlbumNum = Math.ceil(parseInt(albumcards.attr("data-totalAlbums")) / 6);
        if (musicAlbumNum < 0 || musicAlbumNum >= totalAlbumNum) return;
        $.getJSON("/main", { "musicalbums": musicAlbumNum + "" }, function (data) {
            // console.log(data);
            if (!data.error) {
                albumcards.empty();
                for (let i = 0; i < data.length; i += 3) {
                    let innerHTML = '<div class="row">';
                    for (let j = 0; j < 3 && i + j < data.length; ++j) {
                        let album = data[i + j];
                        innerHTML += '<div class="panel panel-primary albumcard col-sm-4" data-address="'
                            + album.address + '"><div class="panel-heading"><h1 class="panel-title text-center">'
                            + album.singer + '</h1></div><div class="panel-body">';
                        let songs = album.songs;
                        for (let l = 0; l < 3 && l < songs.length; ++l) {
                            let song = songs[l];
                            innerHTML += '<div data-musicid="' + song.musicid + '">' + song.title +
                                '<span style="float: right;">' + song.genre + '</span></div>';
                        }
                        innerHTML += "</div></div>";
                    }
                    innerHTML += "</div>";
                    albumcards.append($(innerHTML));
                }
                // confirm("请求 music albums 数据成功");
                albumcards.attr("data-albumIndex", musicAlbumNum + "");
                bind();
            } else confirm("请求 music albums 数据成功");
        })
    }
    getMusicList();
    $("#albumsPrev").click(function (e) {
        getMusicAlbums(-1);
    });
    $("#albumsNext").click(function (e) {
        getMusicAlbums(1);
    });
    // 切换
    $("#musiclist_btn").click(function (e) {
        $("#allmusic").hide();
        $("#singerpane").hide();
        $("#musiclist").fadeIn(300);
        getMusicList();
    });
    $("#allmusic_btn").click(function (e) {
        $("#musiclist").hide();
        $("#singerpane").hide();
        $("#allmusic").fadeIn(300);
        getMusicAlbums(0);
    });
    // 返回音乐主列表
    $("#singerpane_back").click(function (e) {
        $("#singerpane").hide();
        $("#allmusic").fadeIn(300);
    });
    // 自适应 以及 监视
    setInterval(() => {
        var restWidth = $(".bottom").width() - 40 * 4 - 6 * $(window).width() * 0.016;
        $(".progress-box").width(restWidth * 0.8);
        $(".volume-box").width(restWidth * 0.2);
    }, 200);
    // 美化进度条
    $(".musicsheet").mCustomScrollbar({
        theme: "minimal",
        advanced: {
            updateOnContentResize: true // 数据更新后自动刷新滚动条
        }
    });
    $(".musicpane").mCustomScrollbar({
        theme: "minimal",
        advanced: {
            updateOnContentResize: true // 数据更新后自动刷新滚动条
        }
    });
    // 弹出框
    $(function () {
        $("#searchmusic_btn").click(function () {
            $("#searchmodal").modal("toggle");
        });
    });
    $(function () {
        $("#changeUser_btn").click(function () {
            $("#usermodal").modal("toggle");
        });
    });
    // 搜索音乐
    var searchMusicSubmit = $("#searchMusic_submit");
    searchMusicSubmit.click(function (e) {
        if (searchMusicSubmit.hasClass("disabled")) {
            confirm("此功能暂未实现");
            return;
        }
        var searchMusicForm = document.getElementById("searchMusic_form");
        let formData = new FormData(searchMusicForm);
        formData.append("searchMusic", true);
        $.ajax({
            type: "POST",
            url: '/main',
            data: formData,
            processData: false,
            contentType: false,
            success: response => {
                alert("成功查找到歌曲！");
                $("#searchmusic_btn").click();
                window.location.reload();
            },
            error: response => { alert("发生未知错误"); }
        });
    });
    // 修改用户信息
    $("#changeUser_submit").click(function (e) {
        var changeUserForm = document.getElementById("changeUser_form");
        let formData = new FormData(changeUserForm);
        formData.append("changeUser", true);
        $.ajax({
            type: "POST",
            url: "/main",
            data: formData,
            processData: false,
            contentType: false,
            success: response => {
                alert("修改用户信息成功！");
                $("#changeUser_btn").click();

            },
            error: response => { alert("发生未知错误"); }
        });
    });
    // 上传音乐
    $("#uploadmusic_btn").click(function (e) {
        window.location.href = "/upload";
    });
    // 播放音乐
    // ...
});
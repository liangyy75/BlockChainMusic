$(document).ready(() => {
    $("body").css({
        height: $(window).height() + "px",
        width: $(window).width() + "px"
    });
    $("#register_button").click(() => {
        var username = $("#username").val();
        var registeraddress = $("#registeraddress").val();
        var userdesc = $("#userdesc").val();
        if (registeraddress) {
            $.ajax({
                type: "POST",
                url: "/login",
                data: {
                    username: username,
                    registeraddress: registeraddress,
                    userdesc: userdesc
                },
                success: (response) => {
                    window.location.href = "/main";
                },
                error: (response) => {
                    if (JSON.parse(response.responseText).code == 500) alert('地址不合法');
                    else alert('已经注册了');
                }
            });
        }
        else
            confirm("地址为必填项~");
    });
    $("#login_button").click(() => {
        var loginaddress = $("#loginaddress").val();
        if (loginaddress) {
            $.ajax({
                type: "POST",
                url: "/login",
                data: {
                    loginaddress: loginaddress
                },
                success: response => {
                    window.location.href = "/main";
                },
                error: response => {
                    if (JSON.parse(response.responseText).code == 500) alert("地址不合法");
                    else alert("还未进行注册");
                }
            });
        }
        else
            confirm("地址为必填项~");
    });
});
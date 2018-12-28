$(document).ready(() => {
    var alltags = [];
    $("#addtag").click(function(e) {
        var songtag2 = $("#songtag2").val().trim();
        var flag = typeof alltags.find((value, index, array) => { return value == songtag2; }) == "undefined";
        if (songtag2 && flag) {
            $("#definetags").append($('<span class="badge">' + songtag2 + "</span>"));
            alltags.push(songtag2);
            $("#songtag2").val("");
        } else if (!flag) {
            confirm("这个tag已经定义过了");
            $("#songtag2").val("");
        } else confirm("自定义tag时输入框不可为空");
    });
    $("#songfile").change(function(e) {
        // e.currentTarget.files 是一个数组，如果支持多个文件，则需要遍历
        let files = e.currentTarget.files;
        if (typeof files != "undefined")
            $("#songfile2").val(files[0].name);
        // var names = [];
        // e.currentTarget.files.forEach((value, index, array) => { names.push(value.name); });
        // $("#songfile2").val(names.join(";"));
    });
    $("#cancel_button").click(function(e) {
        window.location.replace("/main");
    });
    var uploadForm = document.getElementById("uploadForm");
    var _uploadForm = $(uploadForm);
    _uploadForm.validate({
        ignore: ".ignore",
        rules: {
            songname: { required: true },
            songdesc: { required: true },
            songfile: { required: true },
            songprice: { number: true }
        },
        messages: {
            songname: { required: "必须填写音乐名称" },
            songdesc: { required: "必须填写音乐描述" },
            songfile: { required: "必须上传音乐文件" },
            songprice: { number: "必须是数字" }
        },
        errorClass: "formError",
        validClass: "formValid",
        highlight: function(
            element /* 触发验证的元素 */,
            errorClass /* 错误的类 */,
            validClass /* 验证通过的类 */
        ) {
            $(element)
                .addClass(errorClass)
                .removeClass(validClass);
            if ($(element).hasClass("form-control")) {
                // $(element)
                //     .next()
                //     .removeClass("glyphicon-ok")
                //     .addClass("glyphicon-remove");
                $(element)
                    .parent()
                    .removeClass("has-success")
                    .addClass("has-error");
            }
            $(element)
                .fadeOut()
                .fadeIn();
        },
        unhighlight: function(
            element /* 触发验证的元素 */,
            errorClass /* 错误的类 */,
            validClass /* 验证通过的类 */
        ) {
            $(element)
                .removeClass(errorClass)
                .addClass(validClass);
            if ($(element).hasClass("form-control")) {
                // $(element)
                //     .next()
                //     .removeClass("glyphicon-remove")
                //     .addClass("glyphicon-ok");
                $(element)
                    .parent()
                    .removeClass("has-error")
                    .addClass("has-success");
            }
        }
    });
    $("#register_button").click(function(e) {
        if (_uploadForm.valid()) {
            var formData = new FormData(uploadForm);
            formData.set("songtag2", alltags.join(" "));
            $.ajax({
                type: "POST",
                url: "/upload",
                data: formData,
                processData: false,
                contentType: false,
                success: response => {
                    confirm("添加音乐成功");
                    uploadForm.reset();
                },
                error: response => {
                    alert("发生错误");
                    uploadForm.reset();
                }
            });
            // var req = new XMLHttpRequest();
            // req.open("post", "${pageContext.request.contextPath}/upload", false);
            // req.send(formData);
        } else confirm("表格填写不合格");
    });
});

// glyphicon-ok
// glyphicon-warning-sign
// glyphicon-remove

// $('#id').siblings()   //当前元素所有的兄弟节点
// $('#id').prev()       //当前元素前一个兄弟节点
// $('#id').prevaAll()   //当前元素之前所有的兄弟节点
// $('#id').next()       //当前元素之后第一个兄弟节点
// $('#id').nextAll()    //当前元素之后所有的兄弟节点
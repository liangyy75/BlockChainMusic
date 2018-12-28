### 参考链接

[IPFS-环境搭建](https://blog.csdn.net/u013022210/article/details/80363107)<br>
[使用ajax提交form表单，包括ajax文件上传](https://www.cnblogs.com/zhuxiaojie/p/4783939.html)<br>
[理解Cookie和Session的区别及使用](https://blog.csdn.net/liyifan687/article/details/80077928)<br>
[express 中间件](http://www.expressjs.com.cn/resources/middleware.html)<br>

弄完页面后发现的。。。<br>
[轻量级前端框架H-ui](http://www.h-ui.net/Hui-overview.shtml)<br>
[基于移动端的UI库FrozenUI](https://frozenui.github.io/components/components)<br>
[经典模块化前端框架layui](https://www.layui.com/)<br>
[移动端&微信UI--ydui](http://www.ydui.org/)<br>
[基于bootstrap的sui组件库](http://sui.taobao.org/sui/docs/index.html)<br>
[HTML5 跨屏前端框架Amaze](http://amazeui.org/)<br>
[Element](http://element.eleme.io/#/zh-CN)<br>

### 准备ipfs(其实后面完全没用上)

先去[官网](https://ipfs.io/docs/install/)下载ipfs压缩包，在一个目录下解压，然后将ipfs.exe的文件目录加入到环境变量的path中。
之后在命令行中用ipfs init创建ipfs节点，如果是windows环境，那么会在C:\Users\Administrator\目录下有一个.ipfs文件夹，里面可以进行节点的配置
和内容的存储。用ipfs id可以查看节点id，用ipfs daemon可以启动节点。

为了后续的开发方便，我们还需要对跨域资源共享(CORS)进行配置，ctrl- c退出ipfs，然后按照下面的步骤进行跨域配置。
```
<!-- windows -->
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '[\"PUT\", \"GET\", \"POST\", \"OPTIONS\"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '[\"*\"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '[\"true\"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '[\"Authorization\"]'
ipfs config --json API.HTTPHeaders.Access-Control-Expose-Headers '[\"Location\"]'
<!-- ios -->
localhost:ipfs-http-demo yuechunli$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST", "OPTIONS"]'
localhost:ipfs-http-demo yuechunli$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
localhost:ipfs-http-demo yuechunli$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
localhost:ipfs-http-demo yuechunli$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization"]'
localhost:ipfs-http-demo yuechunli$ ipfs config --json API.HTTPHeaders.Access-Control-Expose-Headers '["Location"]'
```

完成之后，在官网中提供了一个例子，我们开启节点
```
ipfs daemon
ipfs cat /ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme
```
就可以通过http://localhost:5001/webui看到官方给我们提供的项目例子了。

### 总体目录布局



### login页面

- login
- register

改进，应该在main中使用弹出窗口来代替login页面的一起的：
```html
<button class="btn btn-primary" type="button">点击我</button>
<div class="modal" id="mymodal">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
				<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
				<h4 class="modal-title">模态弹出窗标题</h4>
			</div>
			<div class="modal-body">
				<p>模态弹出窗主体内容</p>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
				<button type="button" class="btn btn-primary">保存</button>
			</div>
		</div><!-- /.modal-content -->
	</div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<script>
    $(function(){
        $(".btn").click(function(){
            $("#mymodal").modal("toggle");
        });
    });
</script>
```

https://segmentfault.com/a/1190000004139342?_ea=504710
https://segmentfault.com/u/bignerdcoding
https://github.com/Nealyang/ejs-express-mysql
https://github.com/Nealyang/React-Express-Blog-Demo
https://github.com/KiiiKi/film_web.1.0
https://github.com/lilongllong/netease-music-react
https://github.com/CFMystery/XiaMiMusic

http://www.ptbird.cn/express-multer-upload-diy-savepath-and-savename.html
http://liyuechun.org/2017/11/21/ipfs-blockchain-blogger/
https://www.cnblogs.com/chyingp/p/express-cookie-parser-deep-in.html
https://github.com/chyingp/nodejs-learning-guide
https://github.com/chyingp/nodejs-learning-guide/blob/master/%E8%BF%9B%E9%98%B6/express+session%E5%AE%9E%E7%8E%B0%E7%AE%80%E6%98%93%E8%BA%AB%E4%BB%BD%E8%AE%A4%E8%AF%81.md

https://www.cnblogs.com/mao2080/p/7667607.html
http://www.mediaelementjs.com/


### index

- main.pug or
- login.pug

pug index.pug -P -O '{"main": true, "login": false}'

### add

https://github.com/CreateJS/SoundJS
http://www.createjs.cc/soundjs/docs/modules/SoundJS.html
https://blog.csdn.net/sunq1982/article/details/77528298

[ajax下post方式如何下载文件](https://blog.csdn.net/laikaikai/article/details/81502019)
[Content-Disposition 响应头，设置文件在浏览器打开还是下载](https://blog.csdn.net/ssssny/article/details/77717287)
[nodeJs实现文件上传，下载，删除](https://blog.csdn.net/qq_36228442/article/details/81709272)
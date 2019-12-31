# TD.js
TD.js
## 初衷
最近接触了web3d技术 使用了three.js 但是发现还是有些麻烦 所以自己封装了常用的一些操作
之所以萌生了这个想法 还是因为在three中我想要为对象绑定事件我需要使用射线#$&*@#%$........

只是封装了一些逻辑和方便管理组件而已 所以还是需要使用three.js的Object3D的一些东西

_开头的方法和属性是内部方法

避免加班自娱自乐 所以demo就好

## demo如下
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<div id="id"></div>
</body>
<script language='javascript' src='lib/jquery-3.3.1.min.js'></script>
<script language='javascript' src='lib/three_110.min.js'></script>
<script language='javascript' src='lib/Tween.js'></script>
<script language='javascript' src='lib/inflate.min.js'></script>
<script language='javascript' src='lib/FBXLoader.js'></script>
<script language='javascript' src='lib/OrbitControls.js'></script>
<script language='javascript' src='lib/stats.min.js'></script>
<script language='javascript' src='lib/dat.gui.min.js'></script>
<script src="TD.js"></script>
<script type="text/javascript">



    //创建2个平面图形 使用平面几何学
    var planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1)//后两个参数为长宽的段数 默认为1 段数越多在弯曲的时候就越柔和
    //定义一个材质 使用随机颜色 半透明 0表示透明 1表示不透明
    var planeMaterial = new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff, opacity: 0.5});
    //创建Mesh网格对象
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    //设置这个平面接受光影
    plane.receiveShadow = true;
    //位置
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.set(0,-10,0);

    var planeGeometry1 = new THREE.PlaneGeometry(15, 15, 1, 1)//后两个参数为长宽的段数 默认为1 段数越多在弯曲的时候就越柔和
    //定义一个材质 使用随机颜色 半透明 0表示透明 1表示不透明
    var planeMaterial1 = new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff, opacity: 0.5});
    //创建Mesh网格对象
    var plane1 = new THREE.Mesh(planeGeometry1, planeMaterial1);
    //设置这个平面接受光影
    plane1.receiveShadow = true;
    //位置
    plane1.rotation.x = -0.5 * Math.PI;
    plane1.position.set(0,-2,0);
    //白色自然光
    var ambientLight = new THREE.AmbientLight(0xFFFFFF);
    //以上是three.js的一些东西



    //创建td对象
    var td = new TD('id');
    //设置为全屏
    td.setAllScreen();
    //修改默认相机的位置和视角方向    默认位置是0,0,0 视角方向是场景原点
    td.camera.position.set(-73.40579538757072, 82.96908554776182,  53.13377987302329);
    td.camera.lookAt(td.scene.position);
    //更改画布颜色
    td.renderer.setClearColor(0xEEEEEE, 1.0);//后面一个参数是阿尔法通道 1表示不透明 0表示透明
    //添加进场景 后面的是名字方便管理
    //添加自然光
    td.addToScene(ambientLight, 'ambientLight');
    td.addToScene(plane, 'plane');
    td.addToScene(plane1, 'plane1');
    //场景中删除平面
    td.removeToScene('plane1');
    //1秒后添加平面
    setTimeout("td.addToScene(plane1, 'plane1')",1000);

    //绑定点击事件
    plane1.click(function () {
        //对象还是需要使用three.js的方法操作
        this.material.color = (new THREE.Color(Math.random() * 0xffffff));
    });
    plane.click(function () {
        this.material.color = (new THREE.Color(Math.random() * 0xffffff));
    });

    //绑定hover事件
    //第一个回调函数是鼠标进入的操作 第二个是鼠标移除的操作
    plane1.hover(function () {
        //因为动态的效果是需要渲染器渲染的 所以我意淫了渲染器事件这个东西  第一个参数是操作的对象 第二个是渲染器的执行函数
        //第三个是事件的名字 默认会使用对象的name name为空会使用uuid
        td.addRendererEvent(plane1, function () {
            this.rotation.z += 0.01;
        },'plane1')
    }, function () {
        //按名字删除渲染器事件
        td.removeRendererEventFromName('plane1');
    });
    plane.hover(function () {
        td.addRendererEvent(plane, function () {
            this.rotation.z += 0.01;
        },'plane')
    }, function () {
        td.removeRendererEventFromName('plane');
    });
    plane.hoverThrough(function () {
        td.addRendererEvent(plane, function () {
            this.rotation.z -= 0.01;
        },'plane2')
    }, function () {
        td.removeRendererEventFromName('plane2');
    });
    //设置最大俯角
    td.controls.maxPolarAngle = Math.PI * 0.5; //最大俯视角
</script>
</html>
```
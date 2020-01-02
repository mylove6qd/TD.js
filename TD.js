/**
 * Created by lichenxi on 2019/12/25.
 */

class TD {
    //-----------------------------------------------------------------方法-------------------------------------------------------------------------
    //加载单个FBX模型方法
    loadFBXModel = function (url) {
        var promise = new Promise(function (resolve,reject) {
            var fbx_loader = new THREE.FBXLoader();
            fbx_loader.load(url,(object)=>{
                //把回调函数连带参数丢出去
                resolve(object);
            });
        });
        return promise;
    };
    //加载多个FBX模型方法
    loadFBXModels = function (urls) {
        //用数组的map映射为新的数组好了
        var fbx_loader = new THREE.FBXLoader();

        var promises = urls.map((url) => {
            var promise = new Promise(function (resolve, reject) {
                fbx_loader.load(url, (object) => {
                    //把回调函数连带参数丢出去
                    resolve(object);
                });
            });
            return promise;
        });
        return Promise.all(promises);
    };
    //渲染
    render3D = function () {
        //每一帧发射射线获取对象存在属性中
        //处理hover事件 因为是每一帧渲染的 所以每一帧都需要判断当前是否有新的移入和新的移除事件
        TD.prototype._hoverProcess(this._rayObjs, TD.prototype._EmittedRay(this));
        this._rayObjs = TD.prototype._EmittedRay(this);
        //遍历运行所有的渲染器事件

        for (var [key, value] of this._rendererEventObjMap) {
            value[key]();
        }
        TWEEN.update();
        this.stats.update();
        // 循环调用
        requestAnimationFrame(() => {
            this.render3D();
        });
        this.renderer.render(this.scene, this.camera);
    };
    //向场景中添加对象  没有名字就默认用对象名字 没有就uuid
    addToScene = function (obj3d, name) {
        if (name == undefined) {
            if (obj3d.name!=''){
                name = obj3d.name
            }else{
                name = obj3d.uuid;
            }
        }
        if (this._sceneChildrenNameId.has(name)) {
            return false;
        }
        this._sceneChildrenNameId.set(name, obj3d.id);
        obj3d.name = name;
        this.scene.add(obj3d);
        return true;
    };
    //添加多个
    addsToScene = function (obj3ds, names) {
        if (names == undefined) {
            obj3ds.forEach((item, index) => {
                this.addToScene(item);
            });
            return
        }
        if (names.length != obj3ds.length) {
            return;
        }
        names.forEach((item, index) => {
            this.addToScene(obj3ds[index], item);
        });
    };
    //删除多个
    removesToScene = function (names) {
        names.forEach((item, index) => {
            this.removeToScene(item);
        });
    };
    //删除场景中的对象
    removeToScene = function (name) {
        if (name instanceof Object){
            if (name.name!=''){
                name = name.name;
            }else{
                name = name.uuid;
            }
        }
        if (this._sceneChildrenNameId.has(name)) {
            this.removeToSceneFromId(this._sceneChildrenNameId.get(name));
            this._sceneChildrenNameId.delete(name);
            return true;
        }
        return false;
    };
    //通过id删除场景中对象
    removeToSceneFromId = function (id) {
        this.scene.remove(this.scene.getObjectById(id));
    };
    //设置全屏
    setAllScreen = function () {
        $(document.body).css(
            "margin", "0px"
        );
        $(document.body).css(
            "overflow", "hidden"
        );
    };
    //是否是测试
    setTest = function (bol) {
        if (this._isTest == bol) {
            return;
        } else {
            this._isTest = bol;
            if (bol) {
                //是测试
                this.container.appendChild(this.stats.domElement);
            } else {
                //不是测试
                this.container.removeChild(this.stats.domElement);
            }
        }
    };
    //获取测试数据
    getTestData = function () {
        console.log('camera.position--', this.camera.position);
        console.log('controls.target--', this.controls.target);
    };
    //在渲染器中添加事件
    addRendererEvent = function (obj, fn, eventName) {
        var size = obj._rendererEventFn.size;
        if (eventName == undefined) {
            if (obj.name != "") {
                eventName = obj.name+"_"+size;
            } else {
                eventName = obj.uuid+"_"+size;
            }
        }
        obj[eventName] =fn;
        this._rendererEventObjMap.set(eventName, obj);
    };
    //在渲染器中删除事件 是对象就取对象的name或uuid
    removeRendererEventFromName = function (eventName) {

        if (this._rendererEventObjMap.has(eventName)) {
            //去掉对象上的方法
            delete (this._rendererEventObjMap.get(eventName))[eventName];
            this._rendererEventObjMap.delete(eventName);
        }
    };
    //查看所有的渲染器事件
    allRendererEvent = function () {
        return this._rendererEventObjMap;
    };
    //获取渲染器事件
    getRendererEventObjFromName = function (eventName) {
        return this._rendererEventObjMap.get(eventName);
    };
    //-----------------------------------------------------------------方法-------------------------------------------------------------------------
    //-----------------------------------------------------------------构造方法-------------------------------------------------------------------------
    constructor(id) {
        //-----------------------------------------------------------------属性-------------------------------------------------------------------------
        //属性
        this._isTest = undefined;     //是否是测试状态(开启帧率 开启gui 开启辅助线.....)
        this._HEIGHT = window.innerHeight;   //得到窗体的像素高度宽度
        this._WIDTH = window.innerWidth; //得到窗体的像素高度宽度
        //对象
        this.container = document.getElementById(id);    // 获取canvas容器
        this.stats = new Stats();
        this.scene = new THREE.Scene();    //创建场景
        this._sceneChildrenNameId = new Map();   //可以被放入场景的名称和id的对应
        this.renderer = new THREE.WebGLRenderer();    //渲染器
        this.camera = new THREE.PerspectiveCamera(50, this._WIDTH / this._HEIGHT, 1, 1000000);
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this._rendererEventObjMap = new Map();
        this._rayObjs = [];
        this._mousePosition = [];
        //-----------------------------------------------------------------属性-------------------------------------------------------------------------
        //-----------------------------------------------------------------初始化-------------------------------------------------------------------------
        TD.prototype._initCamera(this);
        TD.prototype._initRenderer(this);
        TD.prototype._initStats(this);
        TD.prototype._initControls(this);
        TD.prototype._addMouseListener(this);
        //默认是测试
        this.setTest(true);
        //窗口自动变化
        window.addEventListener('resize', TD.prototype._handleWindowResize.bind(this), false);
        //渲染

        this.render3D();
        //-----------------------------------------------------------------初始化-------------------------------------------------------------------------
    }
}

//-----------------------------------------------------------------其他方法-------------------------------------------------------------------------
//添加Object3D的事件监听
TD.prototype._addMouseListener = function (obj) {
    //鼠标移动事件获取鼠标坐标
    obj.container.addEventListener("mousemove", (event) => {
        obj._mousePosition = [event.clientX, event.clientY];
    });
    //单击事件
    obj.container.addEventListener("click", (event) => {
        let mouse = new THREE.Vector2();
        let raycaster = new THREE.Raycaster();
        // 计算鼠标点击位置转换到3D场景后的位置
        mouse.x = (event.clientX / obj.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / obj.renderer.domElement.clientHeight) * 2 + 1;
        // 由当前相机（视线位置）像点击位置发射线
        raycaster.setFromCamera(mouse, obj.camera);
        let intersects = raycaster.intersectObjects(obj.scene.children, true);
        if (intersects.length > 0) {
            // 拿到射线第一个照射到的物体
            //判断第一个是否有单击事件
            intersects[0].object._click && intersects[0].object._click(event);
            //判断后面是否有穿透事件
            for (var i = 1; i < intersects.length; i++) {
                intersects[i].object._clickThrough && intersects[i].object._clickThrough(event);
            }
        }
    });
    //双击事件
    obj.container.addEventListener("dblclick", (event) => {
        let mouse = new THREE.Vector2();
        let raycaster = new THREE.Raycaster();
        // 计算鼠标点击位置转换到3D场景后的位置
        mouse.x = (event.clientX / obj.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / obj.renderer.domElement.clientHeight) * 2 + 1;
        // 由当前相机（视线位置）像点击位置发射线
        raycaster.setFromCamera(mouse, obj.camera);
        let intersects = raycaster.intersectObjects(obj.scene.children, true);
        if (intersects.length > 0) {
            // 拿到射线第一个照射到的物体
            //是否是测试
            if (obj._isTest == true) {
                for (var i = 0; i < intersects.length; i++) {
                    console.log('dblclick--' + i, intersects[i].object);
                }
            }
            //判断第一个是否有单击事件
            intersects[0].object._dblclick && intersects[0].object._dblclick(event);
            //判断后面是否有穿透事件
            for (var i = 1; i < intersects.length; i++) {
                intersects[i].object._dblclickThrough && intersects[i].object._dblclickThrough(event);
            }
        }
    });
};
// 窗口大小变动时调用
TD.prototype._handleWindowResize = function () {
    // 更新渲染器的高度和宽度以及相机的纵横比
    this._HEIGHT = window.innerHeight;
    this._WIDTH = window.innerWidth;
    this.renderer.setSize(this._WIDTH, this._HEIGHT);
    // this.camera.aspect = this._WIDTH / this._HEIGHT;
    // this.camera.updateProjectionMatrix();
};
//初始化性能工具
TD.prototype._initStats = function (obj) {
    // 将性能监控屏区显示在左上角
    obj.stats.domElement.style.position = 'absolute';
    obj.stats.domElement.style.bottom = '0px';
    obj.stats.domElement.style.zIndex = 100;
};
//初始化视角工具
TD.prototype._initControls = function (obj) {
    // obj.controls.minDistance = 1; //最小相机移动距离
    // obj.controls.maxDistance = 3000; //最大相机移动距离
    obj.controls.enableDamping = false; //是否开启惯性滑动
    obj.controls.dampingFactor = 0.25; //惯性滑动
    // obj.controls.autoRotate = true;
};
//初始化相机
TD.prototype._initCamera = function (obj) {
    obj.camera.position.x = 0;
    obj.camera.position.y = 0;
    obj.camera.position.z = 0;
    //默认相机的视角方向是当前相机位置指向场景中心的方向
    obj.camera.lookAt(obj.scene.position);
};
//初始化渲染器
TD.prototype._initRenderer = function (obj) {
    obj.renderer.setSize(obj._WIDTH, obj._HEIGHT);
    //开启阴影效果需要渲染器支持，如果使用的WebGLRender 渲染器 需要开启渲染器
    obj.renderer.shadowMap.enabled = true;
    //设置阴影类型
    obj.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    //将渲染器加入对应div
    obj.container.appendChild(obj.renderer.domElement);
};
//随机数
TD.prototype._Trand = function (min, max) {
    return Math.random() * (max - min) + min;
};
TD.prototype._EmittedRay = function (obj) {
    let mouse = new THREE.Vector2();
    let raycaster = new THREE.Raycaster();
    // 计算鼠标点击位置转换到3D场景后的位置
    mouse.x = (obj._mousePosition[0] / obj.renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(obj._mousePosition[1] / obj.renderer.domElement.clientHeight) * 2 + 1;
    // 由当前相机（视线位置）像点击位置发射线
    raycaster.setFromCamera(mouse, obj.camera);
    let intersects = raycaster.intersectObjects(obj.scene.children, true);
    if (intersects.length > 0) {
        var array = new Array();
        intersects.forEach((item, index) => {
            array.push(item.object);
        });
        return array;
    }
    return [];
};
TD.prototype._hoverProcess = function (oldRayObjs, newRayObjs) {
    var different = oldRayObjs.concat(newRayObjs).filter(function (v, i, arr) {
        return arr.indexOf(v) === arr.lastIndexOf(v);
    });
    if (different.length == 0) {
        return;
    }
    different.forEach((item, index) => {
        //不在旧数组中    新添加
        if (oldRayObjs.indexOf(item) == -1) {
            //如果这个新添加是新的第一个 新添加启动进入 同时将后面的第一个启动移除
            if(newRayObjs.indexOf(item)==0){
                if (item.hasOwnProperty('_mouseenter')) {
                    item._mouseenter();
                }
                //同时将后面的第一个启动移除
                if (newRayObjs.length>1&&newRayObjs[1].hasOwnProperty('_mouseleave')) {
                    newRayObjs[1]._mouseleave();
                }
                //新元素后面的触发穿透
                for(var i = 0 ;i<newRayObjs.length;i++){
                    if (i==0){continue}
                    if (newRayObjs[i].hasOwnProperty('_mouseenterThrough')) {
                        newRayObjs[i]._mouseenterThrough();
                    }
                }
            }



        }
        //不在新数组中    新删除
        if (newRayObjs.indexOf(item) == -1) {
            //如果这个新删除是旧的第一个 新删除的启动移除 后面第一个启动进入
            if (oldRayObjs.indexOf(item)==0){
                if (item.hasOwnProperty('_mouseleave')) {
                    item._mouseleave();
                }
                //同时将后面的第一个启动进入
                if (oldRayObjs.length>1&&oldRayObjs[1].hasOwnProperty('_mouseenter')) {
                    oldRayObjs[1]._mouseenter();
                }
                //老元素后面的触发穿透
                for(var i = 0 ;i<oldRayObjs.length;i++){
                    if (i==0){continue}
                    if (oldRayObjs[i].hasOwnProperty('_mouseleaveThrough')) {
                        oldRayObjs[i]._mouseleaveThrough();
                    }
                }
            }



        }
    });
};
//为所有Object3D对象添加事件
//点击事件click
THREE.Object3D.prototype.click = function (fn) {
    this._click = fn || undefined;
};
//点击穿透事件clickThrough
THREE.Object3D.prototype.clickThrough = function (fn) {
    this._clickThrough = fn || undefined;
};
//双击事件dblclick
THREE.Object3D.prototype.dblclick = function (fn) {
    this._dblclick = fn || undefined;
};
//双击穿透事件dblclickThrough
THREE.Object3D.prototype.dblclickThrough = function (fn) {
    this._dblclickThrough = fn || undefined;
};
//hover事件   hover=mouseenter指针进入（穿过）元素 + mouseleave指针离开元素
THREE.Object3D.prototype.hover = function (mouseenter, mouseleave) {
    this._mouseenter = mouseenter || undefined;
    this._mouseleave = mouseleave || undefined;
};
THREE.Object3D.prototype.hoverThrough = function (mouseenter, mouseleave) {
    this._mouseenterThrough = mouseenter || undefined;
    this._mouseleaveThrough = mouseleave || undefined;
};
//所有对象都可以有多个渲染器事件(支持只Object3D对象 其他对象需要的话在原型方法上加入_rendererEventFn)
THREE.Object3D.prototype._rendererEventFn = new Map();
//-----------------------------------------------------------------其他方法-------------------------------------------------------------------------

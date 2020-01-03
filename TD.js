/**
 * Created by lichenxi on 2019/12/25.
 */

class TD {
    //-----------------------------------------------------------------方法-------------------------------------------------------------------------
    //加载单个FBX模型方法
    loadFBXModel = function (url) {
        var promise = new Promise(function (resolve, reject) {
            var fbx_loader = new THREE.FBXLoader();
            fbx_loader.load(url, (object) => {
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
            if (obj3d.name != '') {
                name = obj3d.name
            } else {
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
        if (name instanceof Object) {
            if (name.name != '') {
                name = name.name;
            } else {
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
        obj[eventName] = fn;
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
        //所有最高层上面有on事件的对象
        if (intersects.length > 0) {
            //只要在组上设置了点击事件 组中所有对象的点击事件都会被覆盖
            //所以我们会把第一个取到的元素的有点击事件的组触发
            //后面会触发有穿透点击事件的组触发

            //强如intersects中保存带有该事件的最高层元素或组
            //第一个 带有点击事件的
            //后面的 带有点击穿透事件的

            var array = new Array();
            for (var i = 0; i < intersects.length; i++) {
                var callChainToScenc = TD.prototype._callChainToScenc(intersects[i].object);
                if (i == 0) {
                    for (let j = 0; j < callChainToScenc.length; j++) {
                        if (callChainToScenc[j].hasOwnProperty('_click')) {
                            array.push(callChainToScenc[j]);
                            break;
                        } else {
                            if (j == callChainToScenc.length - 1) {
                                array.push(callChainToScenc[j]);
                            }
                        }
                    }
                } else {
                    for (let j = 0; j < callChainToScenc.length; j++) {
                        if (callChainToScenc[j].hasOwnProperty('_clickThrough')) {
                            array.push(callChainToScenc[j]);
                            break;
                        } else {
                            if (j == callChainToScenc.length - 1) {
                                array.push(callChainToScenc[j]);
                            }
                        }
                    }
                }
            }
            // 拿到射线第一个照射到的物体
            //判断第一个是否有单击事件
            //判断后面是否有穿透事件
            for (var i = 0; i < array.length; i++) {
                array[0]._click && array[0]._click(event);
                if (i > 0) {
                    array[i]._clickThrough && array[i]._clickThrough(event)
                }
                ;
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
            console.log(intersects);
            //只要在组上设置了点击事件 组中所有对象的点击事件都会被覆盖
            //所以我们会把第一个取到的元素的有点击事件的组触发
            //后面会触发有穿透点击事件的组触发

            //强如intersects中保存带有该事件的最高层元素或组
            //第一个 带有点击事件的
            //后面的 带有点击穿透事件的

            var array = new Array();
            for (var i = 0; i < intersects.length; i++) {
                var callChainToScenc = TD.prototype._callChainToScenc(intersects[i].object);
                if (i == 0) {
                    for (let j = 0; j < callChainToScenc.length; j++) {
                        if (callChainToScenc[j].hasOwnProperty('_dblclick')) {
                            array.push(callChainToScenc[j]);
                            break;
                        } else {
                            if (j == callChainToScenc.length - 1) {
                                array.push(callChainToScenc[j]);
                            }
                        }
                    }
                } else {
                    for (let j = 0; j < callChainToScenc.length; j++) {
                        if (callChainToScenc[j].hasOwnProperty('_dblclickThrough')) {
                            array.push(callChainToScenc[j]);
                            break;
                        } else {
                            if (j == callChainToScenc.length - 1) {
                                array.push(callChainToScenc[j]);
                            }
                        }
                    }
                }
            }
            // 拿到射线第一个照射到的物体
            //判断第一个是否有单击事件
            //判断后面是否有穿透事件
            for (var i = 0; i < array.length; i++) {
                array[0]._dblclick && array[0]._dblclick(event);
                if (i > 0) {
                    array[i]._dblclickThrough && array[i]._dblclickThrough(event)
                }
                ;
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
//子对象到场景的调用链
TD.prototype._callChainToScenc = function (obj) {
    var array = new Array();
    array.push(obj);
    while (obj.parent && obj.parent.type !== 'Scene') {
        obj = obj.parent;
        array.push(obj);
    }
    return array.reverse();
};
TD.prototype._hoverProcess = function (oldRayObjs, newRayObjs) {


    //不同的元素
    var different = oldRayObjs.concat(newRayObjs).filter(function (v, i, arr) {
        return arr.indexOf(v) === arr.lastIndexOf(v);
    });


    //没有改变的元素
    if (different.length == 0) {
        return;
    }


    var array = new Array();
    for (var i = 0; i < oldRayObjs.length; i++) {
        var callChainToScenc = TD.prototype._callChainToScenc(oldRayObjs[i]);
        for (let j = 0; j < callChainToScenc.length; j++) {
            if (callChainToScenc[j].hasOwnProperty('_mouseenter') || callChainToScenc[j].hasOwnProperty('_mouseleave')
                || callChainToScenc[j].hasOwnProperty('_mouseenterThrough') || callChainToScenc[j].hasOwnProperty('_mouseleaveThrough')) {
                array.push(callChainToScenc[j]);
                break;
            } else {
                if (j == callChainToScenc.length - 1) {
                    array.push(callChainToScenc[j]);
                }
            }
        }
    }
    oldRayObjs = array;

    var array1 = new Array();
    for (var i = 0; i < newRayObjs.length; i++) {
        var callChainToScenc1 = TD.prototype._callChainToScenc(newRayObjs[i]);

        for (let j = 0; j < callChainToScenc1.length; j++) {

            if (callChainToScenc1[j].hasOwnProperty('_mouseenter') || callChainToScenc1[j].hasOwnProperty('_mouseleave')
                || callChainToScenc1[j].hasOwnProperty('_mouseenterThrough') || callChainToScenc1[j].hasOwnProperty('_mouseleaveThrough')) {
                array1.push(callChainToScenc1[j]);
                break;
            } else {
                if (j == callChainToScenc1.length - 1) {
                    array.push(callChainToScenc1[j]);
                }
            }
        }
        console.log(array1);
    }


    newRayObjs = array1;
    //  console.log(newRayObjs);


    var array = new Array();
    for (var i = 0; i < different.length; i++) {
        var callChainToScenc = TD.prototype._callChainToScenc(different[i]);

        for (let j = 0; j < callChainToScenc.length; j++) {
            if (callChainToScenc[j].hasOwnProperty('_mouseenter') || callChainToScenc[j].hasOwnProperty('_mouseleave')
                || callChainToScenc[j].hasOwnProperty('_mouseenterThrough') || callChainToScenc[j].hasOwnProperty('_mouseleaveThrough')) {
                array.push(callChainToScenc[j]);
                break;
            } else {
                if (j == callChainToScenc.length - 1) {
                    array.push(callChainToScenc[j]);
                }
            }
        }
    }
    different = array;


    //如果是一帧内没有检测到
    if (different.length == oldRayObjs.length) {
        var tag = true;
        for (let i = 0; i < different.length; i++) {
            if (different[i] != oldRayObjs[i]) {
                tag == false;
            }
        }
        if (tag) {
            oldRayObjs.forEach((item, index) => {
                if (item.hasOwnProperty('_mouseleaveThrough')) {
                    item._mouseleaveThrough();
                }
                if (item.hasOwnProperty('_mouseleave')) {
                    item._mouseleave();
                }
            })
        }
    }
    different.forEach((item, index) => {
        //不在旧数组中    新添加
        if (oldRayObjs.indexOf(item) == -1) {
            //如果这个新添加是新的第一个 新添加启动进入 同时将后面的第一个启动移除
            if (newRayObjs.indexOf(item) == 0) {
                if (item.hasOwnProperty('_mouseenter')) {
                    item._mouseenter();
                }
                //同时将后面的第一个启动移除 触发穿透
                if (newRayObjs.length > 1 && newRayObjs[1].hasOwnProperty('_mouseleave')) {
                    newRayObjs[1]._mouseleave();
                }
                if (newRayObjs.length > 1 && newRayObjs[1].hasOwnProperty('_mouseenterThrough')) {
                    newRayObjs[1]._mouseenterThrough();
                }
            } else {
                //如果这个元素不是第一个 则触发他的穿透
                if (item.hasOwnProperty('_mouseenterThrough')) {
                    item._mouseenterThrough();
                }
            }
        }
        //new 2 3
        //old 1 2 3
        //不在新数组中    新删除
        if (newRayObjs.indexOf(item) == -1) {
            //如果这个新删除是旧的第一个 新删除的启动移除 后面第一个启动进入
            if (oldRayObjs.indexOf(item) == 0) {
                if (item.hasOwnProperty('_mouseleave')) {
                    item._mouseleave();
                }
                //同时将后面的第一个启动进入
                if (oldRayObjs.length > 1 && oldRayObjs[1].hasOwnProperty('_mouseenter')) {
                    oldRayObjs[1]._mouseenter();
                }
                //触发穿透
                if (oldRayObjs.length > 1 && oldRayObjs[1].hasOwnProperty('_mouseleaveThrough')) {
                    oldRayObjs[1]._mouseleaveThrough();
                }
            } else {
                //如果这个元素不是第一个 则触发他的穿透
                if (item.hasOwnProperty('_mouseleaveThrough')) {
                    item._mouseleaveThrough();
                }
                //如果是一帧内没有检测到
                if (item.hasOwnProperty('_mouseleave')) {
                    item._mouseleave();
                }
            }
        }
    });
};
//自定义的方法属性
TD.prototype.attributes = ['_click', '_clickThrough', '_dblclick', '_dblclickThrough', '_mouseenter', '_mouseenterThrough', '_mouseleave', '_mouseleaveThrough'];
//递归删除方法
TD.prototype.deletePropertyRecursive = function (obj, name) {
    if (obj.type == "Group") {
        obj.children.forEach((item) => {
            TD.prototype.deletePropertyRecursive(item, name);
        })
    } else {
        if (obj.hasOwnProperty(name)) {
            delete obj[name];
        }
    }
};
//为所有Object3D对象添加事件
//点击事件click
THREE.Object3D.prototype.click = function (fn) {
    if (this.type == "Group") {
        //如果是组的话 覆盖组内所有元素的此方法
        TD.prototype.attributes.forEach(item => {
            TD.prototype.deletePropertyRecursive(this, item);
        });
    } else {
        //如果不是组的话 覆盖组上所有元素的此方法
        var reverse = TD.prototype._callChainToScenc(this).reverse();
        reverse.forEach((obj) => {
            if ((obj.hasOwnProperty("_click")) && obj.type == 'Group') {
                //delete obj._click;
                return;
            }
        })
    }
    this._click = fn || undefined;
};
//点击穿透事件clickThrough
THREE.Object3D.prototype.clickThrough = function (fn) {
    if (this.type == "Group") {
        //如果是组的话 覆盖组内所有元素的此方法
        TD.prototype.attributes.forEach(item => {
            TD.prototype.deletePropertyRecursive(this, item);
        });
    } else {
        //如果不是组的话 覆盖组上所有元素的此方法
        var reverse = TD.prototype._callChainToScenc(this).reverse();
        reverse.forEach((obj) => {
            if ((obj.hasOwnProperty("_clickThrough")) && obj.type == 'Group') {
                //delete obj._click;
                return;
            }
        })
    }
    this._clickThrough = fn || undefined;
};
//双击事件dblclick
THREE.Object3D.prototype.dblclick = function (fn) {
    if (this.type == "Group") {
        //如果是组的话 覆盖组内所有元素的此方法
        TD.prototype.attributes.forEach(item => {
            TD.prototype.deletePropertyRecursive(this, item);
        });
    } else {
        //如果不是组的话 覆盖组上所有元素的此方法
        var reverse = TD.prototype._callChainToScenc(this).reverse();
        reverse.forEach((obj) => {
            if ((obj.hasOwnProperty("_dblclick")
            ) && obj.type == 'Group') {
                //delete obj._click;
                return;
            }
        })
    }
    this._dblclick = fn || undefined;
};
//双击穿透事件dblclickThrough
THREE.Object3D.prototype.dblclickThrough = function (fn) {
    if (this.type == "Group") {
        //如果是组的话 覆盖组内所有元素的此方法
        TD.prototype.attributes.forEach(item => {
            TD.prototype.deletePropertyRecursive(this, item);
        });
    } else {
        //如果不是组的话 覆盖组上所有元素的此方法
        var reverse = TD.prototype._callChainToScenc(this).reverse();
        reverse.forEach((obj) => {
            if ((obj.hasOwnProperty("_dblclickThrough")
            ) && obj.type == 'Group') {
                //delete obj._click;
                return;
            }
        })
    }
    this._dblclickThrough = fn || undefined;
};
//hover事件   hover=mouseenter指针进入（穿过）元素 + mouseleave指针离开元素
THREE.Object3D.prototype.hover = function (mouseenter, mouseleave) {
    if (this.type == "Group") {
        //如果是组的话 覆盖组内所有元素的此方法
        TD.prototype.attributes.forEach(item => {
            TD.prototype.deletePropertyRecursive(this, item);
        });
    } else {
        //如果不是组的话 覆盖组上所有元素的此方法
        var reverse = TD.prototype._callChainToScenc(this).reverse();
        reverse.forEach((obj) => {
            if ((obj.hasOwnProperty("_mouseenter")
                || obj.hasOwnProperty("_mouseenterThrough"))
                && obj.type == 'Group') {
                //delete obj._click;
                return;
            }
        })
    }
    this._mouseenter = mouseenter || undefined;
    this._mouseleave = mouseleave || undefined;
};
THREE.Object3D.prototype.hoverThrough = function (mouseenter, mouseleave) {
    if (this.type == "Group") {
        //如果是组的话 覆盖组内所有元素的此方法
        TD.prototype.attributes.forEach(item => {
            TD.prototype.deletePropertyRecursive(this, item);
        });
    } else {
        //如果不是组的话 覆盖组上所有元素的此方法
        var reverse = TD.prototype._callChainToScenc(this).reverse();
        reverse.forEach((obj) => {
            if ((obj.hasOwnProperty("_mouseleave")
                || obj.hasOwnProperty("_mouseleaveThrough")) && obj.type == 'Group') {
                //delete obj._click;
                return;
            }
        })
    }
    this._mouseenterThrough = mouseenter || undefined;
    this._mouseleaveThrough = mouseleave || undefined;
};
//-----------------------------------------------------------------其他方法-------------------------------------------------------------------------

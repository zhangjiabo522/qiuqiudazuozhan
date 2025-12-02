/**
 * 摇杆模块
 * 当前版本 0.2.1
 * 写于2025年3月4日
 * 更新：电脑端支持键盘控制
 * @author MiaoShangZuan <3268208143@qq.com>
 */
const sqrt = Math.sqrt;
const acos = Math.acos;

class Vec2 {
    constructor( x=0, y=0 ) {
        this.x = x;
        this.y = y;
    }
    set( x=0, y=0 ) {
        this.x = x;
        this.y = y;
    }
    copy( vec ) {
        this.x = vec.x;
        this.y = vec.y;
    }
    norm() {
        return sqrt(this.x*this.x + this.y*this.y);
    }
    unit() {
        const _n = this.norm();
        if (_n === 0) return new Vec2(0, 0);
        return new Vec2( this.x / _n, this.y / _n );
    }
    scale( length=1 ) {
        const _n = this.norm();
        if (_n === 0) return;
        const _scale = length / _n;
        this.x *= _scale;
        this.y *= _scale;
    }
}

class Rocker {
    constructor() {
        // 检测平台
        this.isMobile = this.checkIfMobile();
        
        // 创建摇杆DOM（移动端显示，桌面端隐藏）
        const dom = document.createElement('div');
        dom.style.position = 'absolute';
        dom.style.width = '100px';
        dom.style.height = '100px';
        dom.style.borderRadius = '50%';
        dom.style.backgroundColor = 'rgba(0,0,0,0.6)';
        dom.style.backgroundRepeat = 'no-repeat';
        dom.style.backgroundSize = '100% 100%';
        
        // 桌面端隐藏摇杆
        if (!this.isMobile) {
            dom.style.display = 'none';
        }

        const cdom = document.createElement('div');
        cdom.style.position = 'relative';
        cdom.style.width = '50px';
        cdom.style.height = '50px';
        cdom.style.borderRadius = '50%';
        cdom.style.backgroundColor = 'white';
        dom.style.backgroundRepeat = 'no-repeat';
        dom.style.backgroundSize = '100% 100%';
        dom.appendChild(cdom);

        dom.style.left = '50px';
        dom.style.top = '50px';
        cdom.style.left = '25px';
        cdom.style.top = '25px';

        this.domElement = dom;
        
        // 桌面端键盘控制
        if (!this.isMobile) {
            this.setupKeyboardControls();
        }
        
        // 移动端触摸控制
        if (this.isMobile) {
            this.setupTouchControls(dom, cdom);
        }
    }
    
    // 检测是否为移动端
    checkIfMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768; // 小屏幕也视为移动端
    }
    
    // 设置移动端触摸控制
    setupTouchControls(dom, cdom) {
        const coord = new Vec2(), vec = new Vec2();
        let radius, cradius, x, y, x0, y0, unvec;
        
        cdom.ontouchstart = event=>{
            event.preventDefault();
            coord.set( event.targetTouches[0].pageX, event.targetTouches[0].pageY );
            radius = parseFloat(dom.style.width.replace('px',''))*0.5;
            cradius = parseFloat(cdom.style.width.replace('px',''))*0.5;
            x0 = parseFloat(dom.style.left.replace('px',''));
            y0 = parseFloat(dom.style.top.replace('px',''));
            this.touch?.( 'start', undefined );
        };
        
        cdom.ontouchmove = event=>{
            event.preventDefault();
            x = event.targetTouches[0].pageX;
            y = event.targetTouches[0].pageY;
            vec.set( x-coord.x, y-coord.y );
            unvec = vec.unit();
            if( vec.norm() < radius ) {
                cdom.style.left = x - x0 - cradius + 'px';
                cdom.style.top = y - y0 - cradius + 'px';
            }
            else {
                cdom.style.left = radius * ( 1 + unvec.x ) - cradius + 'px';
                cdom.style.top = radius * ( 1 + unvec.y ) - cradius + 'px';
            }
            this.touch?.( 'move', unvec );
        };
        
        cdom.ontouchend = ()=>{
            cdom.style.left = cdom.style.top = radius - cradius + 'px';
            this.touch?.( 'end', undefined );
        };
    }
    
    // 设置桌面端键盘控制
    setupKeyboardControls() {
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            w: false,
            s: false,
            a: false,
            d: false
        };
        
        this.keyboardVector = new Vec2(0, 0);
        this.keyboardActive = false;
        
        // 键盘按下事件
        document.addEventListener('keydown', (event) => {
            const key = event.key;
            
            if (this.keys.hasOwnProperty(key)) {
                event.preventDefault();
                
                if (!this.keys[key]) {
                    this.keys[key] = true;
                    this.updateKeyboardVector();
                    
                    // 触发开始事件
                    if (!this.keyboardActive && this.touch) {
                        this.touch('start', this.keyboardVector.unit());
                        this.keyboardActive = true;
                    }
                }
            }
        });
        
        // 键盘释放事件
        document.addEventListener('keyup', (event) => {
            const key = event.key;
            
            if (this.keys.hasOwnProperty(key)) {
                event.preventDefault();
                
                this.keys[key] = false;
                this.updateKeyboardVector();
                
                // 如果没有按键被按下，触发结束事件
                if (this.keyboardActive && !this.isAnyKeyPressed() && this.touch) {
                    this.touch('end', undefined);
                    this.keyboardActive = false;
                }
            }
        });
        
        // 窗口失去焦点时重置所有按键
        window.addEventListener('blur', () => {
            this.resetAllKeys();
        });
        
        // 每秒更新键盘向量（平滑移动）
        setInterval(() => {
            if (this.keyboardActive && this.touch) {
                this.touch('move', this.keyboardVector.unit());
            }
        }, 16); // 约60fps
    }
    
    // 更新键盘向量
    updateKeyboardVector() {
        this.keyboardVector.set(0, 0);
        
        // 左右方向
        if (this.keys.ArrowLeft || this.keys.a) {
            this.keyboardVector.x -= 1;
        }
        if (this.keys.ArrowRight || this.keys.d) {
            this.keyboardVector.x += 1;
        }
        
        // 上下方向
        if (this.keys.ArrowUp || this.keys.w) {
            this.keyboardVector.y -= 1; // Canvas Y轴是反的
        }
        if (this.keys.ArrowDown || this.keys.s) {
            this.keyboardVector.y += 1;
        }
    }
    
    // 检查是否有按键被按下
    isAnyKeyPressed() {
        for (const key in this.keys) {
            if (this.keys[key]) {
                return true;
            }
        }
        return false;
    }
    
    // 重置所有按键
    resetAllKeys() {
        for (const key in this.keys) {
            this.keys[key] = false;
        }
        this.keyboardVector.set(0, 0);
        this.keyboardActive = false;
        
        if (this.touch) {
            this.touch('end', undefined);
        }
    }
    
    // 适配屏幕大小变化
    adaptToScreenSize() {
        const isMobileNow = this.checkIfMobile();
        
        // 如果平台状态改变
        if (isMobileNow !== this.isMobile) {
            this.isMobile = isMobileNow;
            
            if (this.isMobile) {
                // 切换到移动端：显示摇杆
                this.domElement.style.display = 'block';
                this.setupTouchControls(this.domElement, this.domElement.children[0]);
            } else {
                // 切换到桌面端：隐藏摇杆，启用键盘
                this.domElement.style.display = 'none';
                this.setupKeyboardControls();
            }
        }
    }
    
    setRadius( radius=50 ) {
        const dom = this.domElement, cdom = dom.children[0];
        const cradius = parseFloat(cdom.style.width.replace('px',''))*0.5;
        dom.style.width = dom.style.height = 2*radius + 'px';
        cdom.style.left = cdom.style.top = radius - cradius + 'px';
    }
    
    setCRadius( cradius=25 ) {
        const dom = this.domElement, cdom = dom.children[0];
        const radius = parseFloat(dom.style.width.replace('px',''))*0.5;
        cdom.style.width = cdom.style.height = 2*cradius + 'px';
        cdom.style.left = cdom.style.top = radius - cradius + 'px';
    }
    
    setPosition( x=100, y=100 ) {
        const dom = this.domElement, cdom = dom.children[0];
        const radius = parseFloat(dom.style.width.replace('px',''))*0.5,
        cradius = parseFloat(cdom.style.width.replace('px',''))*0.5;
        dom.style.left = x - radius + 'px';
        dom.style.top = y - radius + 'px';
        cdom.style.left = cdom.style.top = radius - cradius + 'px';
    }
    
    setColor( color ) {
        this.domElement.style.backgroundColor = color;
    }
    
    setChColor( color ) {
        this.domElement.children[0].style.backgroundColor = color;
    }
    
    setImage( url ) {
        this.domElement.style.backgroundImage = 'url("' + url + '")';
    }
    
    setChImage( url ) {
        this.domElement.children[0].style.backgroundImage = 'url("' + url + '")';
    }
}

export { Rocker };
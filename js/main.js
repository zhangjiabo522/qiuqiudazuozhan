import * as LIAO from '../build/liao.module.js'
import { Rocker } from '../plug-in/rocker.js'
import { GOject, GameLoader } from './game.js'

const PI = Math.PI
const E = Math.E
const world_w = 20, world_h = 20
const player_name_arr = [ '月蓝星晨寒', '倾听、花开雨落', '眠袭', '南巷清风', '稚甜很差劲', '朝夕相处', '狂野', '呆萌的欧尼酱', '小耳朵',
'夜美但淒涼', '姐不收二手货', '书娟', '淡漠安然', '总有人机突突我', '素年凉音', '入云栖', '帅的不明朗', '要把难过藏起来', '晶莹泪眼',
'时光凉了他走了', '呆萌菇凉很有爱', '突然疏远', '北觅', '心碎的方式', '诺克给你吹个萨斯', '花开宿语', '撞上南墙', '一曲琴声', '感觉心髒',
'过零点的信', '苞米地蒙面侠', '细雨挽轻裳', '泪在投降', '是童话，不是真', '萌音小软妹', '节操嘎嘣脆', '绮丝凡雪', '赖着不放掉', '惧人心',
'與寂寞脫軌', '挽轻纱', '旧纸伞', '卜铃卜铃', '殇子狼魂', '.來卋再續', '〆愿风、载尘', '泪水成就未来', '以为的以为', '深榆巷',
'秋刀鱼', '环城路飙车', '甜忱', '不经沧桑怎成男人', '沫时', '回忆曾经', '独活', '泡果奶', '全校第一哇塞男', '清欢渡',
'他是她的岛', '小氣灬鬼メ', '信求,咱狠爱', '踩了牛奶的猫', 'つ低調成傷', '故人衣', '青春为谁朽', '懒癌弃疗', '几番春秋', '浪纵成性',
'我已毁容', '光阴只方寸', '逍遥℡圣佑轩', '撑起一片天', '风寒影', '一念痴狂', '爱意漫花海', '柠夏初开', '大叔不要跑', '沈听雨',
'吃素的狼', '囚禁自己', '风卷着沙', '囿錍氣', '沅', '呆大旺', '梦执', '时光取名叫无心', '全力以赴', '流年碎影',
'空城旧梦忆悲凉', '何以心动', '夜泳', '狠心的伤', '一只优蕥的猪', '清风与我', '暴风少年' ]

const random = Math.random
const trunc = Math.trunc
const round = Math.round
const pow = Math.pow
const sin = Math.sin
const cos = Math.cos

const renderer = new LIAO.Canvas2DRenderer()
const scene = new LIAO.Scene()
const camera = new LIAO.Camera()

// 创建 GameLoop
const gameLoop = new LIAO.GameLoop(renderer, scene, camera)

const player = new GOject( '玩家', 0.5, 40, 'mediumSlateBlue', 0, 0, 'consumer' )
const games = new GameLoader( world_w, world_h, scene, camera, player )

// 存储所有 consumer 对象的引用
const gameObjectsMap = new Map()

function animate() {
    games.update()
    
    // 每帧更新小地图数据
    updateMinimapData()
    
    // 相机跟随玩家
    updateCamera()
    
    requestAnimationFrame(animate)
}

// 新增小地图数据更新函数
function updateMinimapData() {
    if (!games || !games.element) return
    
    const minimapObjects = []
    
    // 遍历所有游戏对象
    games.element.forEach(go => {
        if (!go || !go.position) return
        
        if (go.identity === 'consumer') {
            // 玩家或NPC
            minimapObjects.push({
                type: go.id === player.id ? 'player' : 'enemy',
                x: go.position.x,
                y: go.position.y,
                radius: go.radius || 0.5
            })
        } else if (go.identity === 'producer') {
            // 食物
            minimapObjects.push({
                type: 'item',
                x: go.position.x,
                y: go.position.y,
                radius: go.radius || 0.1
            })
        }
    })
    
    // 更新场景的小地图数据
    if (scene.updateMinimap) {
        scene.updateMinimap(minimapObjects)
    } else if (scene.minimap) {
        scene.minimap.gameObjects = minimapObjects
    }
}

// 新增相机更新函数
function updateCamera() {
    if (!player || !camera || !camera.position) return
    
    // 相机平滑跟随玩家
    const targetX = player.position.x
    const targetY = player.position.y
    
    // 平滑插值
    camera.position.x += (targetX - camera.position.x) * 0.1
    camera.position.y += (targetY - camera.position.y) * 0.1
    
    // 相机高度根据玩家大小调整（距离缩放）
    const targetZ = player.radius * 1.6 + 10
    camera.position.z += (targetZ - camera.position.z) * 0.1
}

function init() {
    const rocker = new Rocker()
    rocker.setColor('rgba(255,255,255,0.6)')
    rocker.setRadius( 70 )
    rocker.setPosition( 100, 240 )
    rocker.touch = ( state, vec ) => {
        if( state == "move" ) {
            const k = 0.02 * pow( E, -0.4214 * (player.radius-0.5) )
            player.velocity.set( vec.x * k, -vec.y * k )
        }
        else player.velocity.set(0,0)
    }
    document.body.appendChild(rocker.domElement)
    
    renderer.setSize(innerWidth, innerHeight)
    document.querySelector('#graphic').appendChild(renderer.domElement)
    
    // 相机初始位置
    camera.position.z = 10.8
    camera.model = player.model
    player.name.content = getNames(player_name_arr)
    
    const w_x = world_w * 0.5, w_y = world_h * 0.5
    scene.add(new LIAO.GridModel({
        extent: [ w_x, w_y, -w_x, -w_y ],
        opacity: 0.6
    }))
    
    games.add(player)
    
    // 保存对象引用
    gameObjectsMap.set(player.id, player)
    
    initProducer(600) // 生成食物
    initConsumer(20) // 生成npc
    
    // 启动动画循环
    animate()
    
    // 启动游戏循环（用于小地图）
    gameLoop.start()
}

function getNames( names ) {
    const count = names.length, index = round(random() * count)
    return names[index]
}

function initProducer( count=80 ) {
    // mediumSpringGreen
    let r, x, y, color, R, G, B
    for( let i = 0; i < count; i++ ) {
        R = trunc(random() * 255)
        G = trunc(random() * 255)
        B = trunc(random() * 255)
        color = 'rgb(' + R + ',' + G + ',' + B + ')'
        r = random() * 0.06 + 0.02
        x = (random() * 2 - 1) * world_w * 0.5
        y = (random() * 2 - 1) * world_h * 0.5
        games.add(new GOject( 'producer', r, 5, color, x, y ))
    }
}

function initConsumer( count=10 ) {
    // turquoise
    let x, y, vx, vy, color, R, G, B
    for( let i = 0; i < count; i++ ) {
        R = trunc(random() * 255)
        G = trunc(random() * 255)
        B = trunc(random() * 255)
        color = 'rgb(' + R + ',' + G + ',' + B + ')'
        x = (random() * 2 - 1) * world_w * 0.5
        y = (random() * 2 - 1) * world_h * 0.5
        vx = cos(random() * 2 * PI) * 0.02
        vy = sin(random() * 2 * PI) * 0.02
        
        const npc = new GOject( getNames(player_name_arr), 0.5, 40, color, x, y, 'consumer', vx, vy)
        games.add(npc)
        gameObjectsMap.set(npc.id, npc)
    }
}

// 修复小地图显示 - 修复镜像问题
if (LIAO.RendererLogic) {
    LIAO.RendererLogic.MinimapRenderer = function(data) {
        const { Draw, minimap } = data;
        const { width, height, backgroundColor, borderColor } = minimap;
        
        // 绘制小地图背景
        Draw.fillStyle = backgroundColor || 'rgba(0, 0, 0, 0.7)';
        Draw.fillRect(10, 10, width, height);
        
        // 绘制边框
        Draw.strokeStyle = borderColor || '#00ff00';
        Draw.lineWidth = 2;
        Draw.strokeRect(10, 10, width, height);
        
        // 绘制小地图标题
        Draw.fillStyle = '#ffffff';
        Draw.font = 'bold 12px Arial';
        Draw.fillText('小地图', 15, 25);
        
        // 绘制中心点
        Draw.fillStyle = 'rgba(255, 255, 255, 0.3)';
        Draw.beginPath();
        Draw.arc(10 + width/2, 10 + height/2, 2, 0, Math.PI * 2);
        Draw.fill();
        
        // 绘制方向指示（修复镜像问题的关键）
        Draw.fillStyle = 'rgba(255, 255, 255, 0.5)';
        Draw.font = '10px Arial';
        Draw.fillText('N', 10 + width/2 - 5, 20);  // 北 - 顶部
        Draw.fillText('S', 10 + width/2 - 5, 10 + height - 5);  // 南 - 底部
        Draw.fillText('W', 15, 10 + height/2 + 4);  // 西 - 左边
        Draw.fillText('E', 10 + width - 12, 10 + height/2 + 4);  // 东 - 右边
        
        // 绘制网格参考线
        Draw.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        Draw.lineWidth = 0.5;
        
        // 水平线
        Draw.beginPath();
        Draw.moveTo(10, 10 + height/2);
        Draw.lineTo(10 + width, 10 + height/2);
        Draw.stroke();
        
        // 垂直线
        Draw.beginPath();
        Draw.moveTo(10 + width/2, 10);
        Draw.lineTo(10 + width/2, 10 + height);
        Draw.stroke();
        
        // 绘制小地图内容
        if (minimap.gameObjects && minimap.gameObjects.length > 0) {
            minimap.gameObjects.forEach((obj) => {
                if (!obj || obj.x === undefined || obj.y === undefined) return;
                
                // 计算在小地图中的位置
                // 世界坐标范围是 -world_w/2 到 world_w/2
                const worldX = obj.x;
                const worldY = obj.y;
                
                // 关键修复：Y坐标需要取反，因为Canvas的Y轴是向下的
                // 世界坐标：向上为+Y，Canvas坐标：向下为+Y
                // 所以需要将 worldY 取反
                const normalizedX = (worldX + world_w/2) / world_w;  // 0到1
                const normalizedY = 1 - ((worldY + world_h/2) / world_h);  // 修复：1- 来反转Y轴
                
                // 转换为小地图坐标
                const mapX = 10 + normalizedX * width;
                const mapY = 10 + normalizedY * height;
                
                // 确保坐标在小地图范围内
                if (mapX < 10 || mapX > 10 + width || mapY < 10 || mapY > 10 + height) {
                    return;
                }
                
                // 根据类型绘制
                if (obj.type === 'player') {
                    // 玩家 - 红色，大小根据半径调整
                    const size = Math.max(4, Math.min(8, (obj.radius || 0.5) * 5));
                    Draw.fillStyle = '#ff0000';
                    Draw.beginPath();
                    Draw.arc(mapX, mapY, size, 0, Math.PI * 2);
                    Draw.fill();
                    
                    // 白色边框
                    Draw.strokeStyle = '#ffffff';
                    Draw.lineWidth = 1;
                    Draw.beginPath();
                    Draw.arc(mapX, mapY, size + 1, 0, Math.PI * 2);
                    Draw.stroke();
                    
                    // 绘制玩家朝向指示线（如果有速度）
                    if (player.velocity && (player.velocity.x !== 0 || player.velocity.y !== 0)) {
                        Draw.strokeStyle = '#ffff00';
                        Draw.lineWidth = 1;
                        Draw.beginPath();
                        Draw.moveTo(mapX, mapY);
                        
                        // 速度方向（注意Y轴取反）
                        const dirX = player.velocity.x;
                        const dirY = -player.velocity.y; // 取反以匹配Canvas坐标系
                        const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);
                        
                        if (dirLength > 0) {
                            const arrowX = mapX + (dirX / dirLength) * (size + 5);
                            const arrowY = mapY + (dirY / dirLength) * (size + 5);
                            Draw.lineTo(arrowX, arrowY);
                        }
                        Draw.stroke();
                    }
                    
                } else if (obj.type === 'enemy') {
                    // 敌人 - 蓝色
                    const size = Math.max(2, Math.min(6, (obj.radius || 0.5) * 4));
                    Draw.fillStyle = '#00aaff';
                    Draw.beginPath();
                    Draw.arc(mapX, mapY, size, 0, Math.PI * 2);
                    Draw.fill();
                    
                } else if (obj.type === 'item') {
                    // 食物 - 绿色，非常小
                    const size = Math.max(1, Math.min(3, (obj.radius || 0.1) * 15));
                    Draw.fillStyle = '#00ff00';
                    Draw.beginPath();
                    Draw.arc(mapX, mapY, size, 0, Math.PI * 2);
                    Draw.fill();
                }
            });
        }
        
        // 绘制游戏范围边框
        Draw.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        Draw.lineWidth = 1;
        Draw.strokeRect(10, 10, width, height);
        
        // 显示玩家数量信息
        if (minimap.gameObjects) {
            const playerCount = minimap.gameObjects.filter(obj => obj.type === 'player').length;
            const enemyCount = minimap.gameObjects.filter(obj => obj.type === 'enemy').length;
            const itemCount = minimap.gameObjects.filter(obj => obj.type === 'item').length;
            
            Draw.fillStyle = '#ffffff';
            Draw.font = '10px Arial';
            Draw.fillText(`玩家: ${playerCount}`, 15, height + 25);
            Draw.fillText(`敌人: ${enemyCount}`, 15, height + 40);
            Draw.fillText(`食物: ${itemCount}`, 15, height + 55);
        }
    };
}

// 修复：移除 webapp 调用，直接初始化
window.addEventListener('load', () => {
    // 检查是否有 #graphic 元素
    if (!document.querySelector('#graphic')) {
        // 如果不存在，创建一个
        const graphicDiv = document.createElement('div');
        graphicDiv.id = 'graphic';
        document.body.appendChild(graphicDiv);
    }
    
    // 添加一些基础样式
    const style = document.createElement('style');
    style.textContent = `
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #000;
        }
        #graphic {
            width: 100%;
            height: 100%;
            position: relative;
        }
        canvas {
            display: block;
            width: 100%;
            height: 100%;
        }
    `;
    document.head.appendChild(style);
    
    // 初始化游戏
    init();
    
    console.log('🎮 游戏启动成功！');
    console.log('🗺️ 小地图已修复镜像问题，方向正常');
    console.log('📱 摇杆支持手机触摸和电脑键盘控制');
    console.log('👆 玩家向上移动时，小地图上也向上显示');
});
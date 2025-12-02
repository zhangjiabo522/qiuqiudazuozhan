## games.js 接口文档
## 于2025年3月13日编写
## 编写者 庙上攥 <3268208143@qq.com>
## export { GOject, GameLoader }
## 此模块需要引入liao.js使用

/**
 * GOject
 * 此方法用于创建游戏角色，无论是被吃的生产者，还是移动的消费者，都可以调用这个方法创建
 * 此方法会自动生成并绑定相关liaojs对象，无需二次绑定
 * 构造参数 ( name: string, radius: number, seg: number(int), color: string|number, x: number, y: number, identity: string, vx: number, vy: number, step: number(int) )
 * name：游戏角色名字，该属性只有消费者才有效。如果是消费者，渲染画面时还会渲染名字，默认值为 "producer"
 * radius：游戏角色半径，默认值为 0.5
 * seg：游戏角色形状，根据seg生成指定边数的正多边形，值越大越接近圆形，注意只接受整数！！！默认值为 40
 * color：游戏角色颜色。"red"、"rgb(255,0,0)"、0xff0000都可作为颜色参数。默认值为 "mediumSlateBlue"
 * x：游戏角色初始x坐标，默认值为 0
 * y：游戏角色初始y坐标，默认值为 0
 * identity：游戏角色身份，表示当前角色是生产者还是消费者。"producer"为生产者，"consumer"为消费者，默认值为 "producer"
 * vx：游戏角色初始速度向量 x，默认值为 0
 * vy：游戏角色初始速度向量 y，默认值为 0
 * step：步数，当游戏角色是npc时，表示前进多少步才随机下一次方向，注意只接受整数！！！默认值为 120
 * 
 * 可调用属性 无
 */

/**
 * GameLoader
 * 此方法用于创建游戏加载器，游戏角色需要添加到游戏加载器并调用更新函数才会处理游戏内所有对象的行为
 * 构造参数 ( width: number(int), height: number(int), scene: object<Scene>, camera: object<Camera>, player: object<GOject> )
 * width：地图宽度，注意只接受整数！！！默认值为 10
 * height：地图高度，注意只接受整数！！！默认值为 10
 * scene：liao.js中的scene，添加即可
 * camera：liao.js中的camera，添加即可
 * player：玩家操控的游戏角色，添加即可
 * 
 * 可调用属性 { add: Function, remove: Function, update: Function }
 * add：向游戏加载器添加游戏角色，用法示例 games.add( GOject )
 * remove：向游戏加载器删除游戏角色，用法示例 games.remove( GOject )
 * update：调用后会自动处理游戏内所有对象的行为，无参数，直接调用即可，用法示例 games.update()
 */
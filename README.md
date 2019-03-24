# RenderingWork

reference: 
- https://bulma.io/
- https://electron.com
- https://github.com
- https://zhuanlan.zhihu.com/p/43537323
- https://blog.csdn.net/silangquan/article/details/21990713 重心插值
- https://en.wikipedia.org/wiki/Midpoint_circle_algorithm 画圆
- https://blog.csdn.net/MMogega/article/details/53055625 Bresenham 画圆
- http://fooplot.com/?lang=zh_hans#W3sidHlwZSI6MCwiZXEiOiJ4XjIoeD4wKSIsImNvbG9yIjoiIzAwMDAwMCJ9LHsidHlwZSI6MTAwMCwid2luZG93IjpbIi01Ljg2IiwiNy4xNCIsIi0zLjMwMDAwMDAwMDAwMDAwMDMiLCI0LjcwMDAwMDAwMDAwMDAwMSJdfV0- 坐标图绘制网站

electron 特性：
1. renderer process 不留全局对象，除非是保留在 html 里面的
2. rederer process 不能使用 nodejs module
3. main process 的对象在 app 不会保留引用，除非声明在 renderer 里面

3.13:
绘制线段：
考虑到后面的颜色问题，我们需要一个颜色渐变工具以及对应的颜色变化公式
考虑到数据的存储，我们需要 Point Class 去存储 position and color
考虑到最后是一个 3D 的 Cube 渲染需要 z-index 数据，因此我们需要增加坐标属性数据 Vec2 重构成为 Vec3

3.14:
BresherHam 的绘制线段手段是没什么问题，但是过于限制了只能绘制线段的功能，因此需要将 drawPoint 和获取线段数组的方式分离开来。
需要获取的是 points 而不是直接绘制
drawPoints 留在外面不再进行传值
方便绘制 triangle

重构 line 函数变为返回 points 用于 drawPoints 使用
这里还需要考虑返回 null 的情况
同时我们还有重新声明一个 clear 函数
清除上一轮的 proxy 存储的数据，避免下一个 scene 中复用

3.15:

调整 BresenHam Line 关于 dy 步长更长的情况下，计算点数据的方式，由 bottom to top 改为保持 left to right 为了方便 triangle 绘制时的遍历，这有利于减少遍历循环次数

缺陷来了... 无论是 bottom to top 还是 left to right 都会存在线段顺序的问题，这个时候自创的方法就只能消耗性能去完善效果，增加循环数量了
同时我们还是需要保证传入的点的顺序，还是由左到右

缺陷二： 需要判断第二长和第三长的边，保证循环边内容是对应正确的，节省效率的办法是直接一个循环内将两条边都遍历一次，保证可以填充上
第二种方法可以参考一下，是否要将第二第三长边分辨开来

采用了一个简单粗暴的解法，就是全遍历方案，这个解法基本上是不考虑任何优化，进行了部分的优化，减少了遍历的次数，少许，点越多，后续的遍历会更少
坐标绘制图
我们不使用 includes 的原因是因为他也是通过遍历进行对象查找的，本质上是不会对性能有特别大的优化的。

知乎参考方案是重点在于确定顶点位置

- https://learnopengl-cn.readthedocs.io/zh/latest/04%20Advanced%20OpenGL/01%20Depth%20testing/ 深度检测

一旦启用深度测试，如果片段通过深度测试，OpenGL自动在深度缓冲区存储片段的 z 值，如果深度测试失败，那么相应地丢弃该片段。如果启用深度测试，那么在每个渲染之前还应使用GL_DEPTH_BUFFER_BIT清除深度缓冲区，否则深度缓冲区将保留上一次进行深度测试时所写的深度值
1. 首先是深度检测的基本功能，比较数据点深度清除不显示的点数据

// 这里证明我们需要两个参数：near 和 far

2. 考虑深度精度问题，在可投影视角范围下，应该是保持 z 属于 0 ~ 1.0

3. 深度冲突问题

depth 的重点在于只能检测 triangle 对象，line 对象消耗比较小可以不用检测，但是一旦开启了 depth line 将无法绘制，为了避免这个问题，需要加个判断在 push 上检测传入对象是否是 triangle 否则直接导入。

__考虑到 triangle 依赖于 line 绘制，那么就不能直接在 line 生成时加入 depthbuffer，只能通过 depth 和 push 函数配合使用。__

投影透视参考
http://www.songho.ca/opengl/gl_projectionmatrix.html

深度检测我打算使用新的缓冲区用于存储数据，然后新的点创建的时候进行对比
但是该生成点是否我们需要让它生成呢

根据这个方向的思路我们修改的对象就会不一样
若是全部的点都存在了之后我们在 utils 修正
若是生成 line 的时候生成新的 point 我们修改 point，让 pixel 无法生成

应该是前者了，毕竟该有的数据我们还是要存下来的。而且更好处理，虽然可能还是要消耗一部分处理时间。

性能太差了，绘制的三角形越多性能越差，因为遍历已有像素点太消耗性能
那么需要优化，优化方案应该是获取 triangles 然后根据是否覆盖 triangles 进行数据的简化处理
比原来还要慢的原因不是因为要绘制点增多了，而是遍历的数量多了更多。

优化方案是从 已有三角形判断，若存在包含则进入判断，若不存在包含，则不进入判断。
那么优化对象从单一个的点变为了三角形优化

创建新对象 triangle
- http://dec3.jlu.edu.cn/webcourse/t000096/graphics/chapter5/01_1.html
- https://www.cnblogs.com/Duahanlang/archive/2013/05/11/3073434.html

point 增加一个 dropByDepth 属性用于节省循环遍历所消耗的时间，毕竟要 keep 一个 triangle 的原有数据还要保证深度测试的缓存能够丢弃数据

3.16:

需要考虑深度检测问题，现在需要在 Vec3 的基础上考虑 index-z 对于绘制的影响，是否需要将对应点上的较小的 z 的对象导入 point 绘制数组
可以在 triangle 那个部分增添深度检测，因为绘制慢的很大一部分原因是因为 z-index 导致的。
三角形的颜色渐变重心判断法。

3.17:
需要完成内容 仿射变换，Cube 绘制旋转。


3.21:
完成绘制圆：
重新创建一个 utils circleArray 存储对象。

3.22:
- http://gad.qq.com/article/detail/35782 纹理投影和映射（暂定）

3.22:
求质心算法 （很具体）：
- https://jingsam.github.io/2016/10/05/centroid.html
组合图形质心算法 （更具体，单一）：
- https://zhuanlan.zhihu.com/p/26395651

这里我们认识到一个原理上的内容，我们的任何计算都需要以 int 为基础，因为我们的转换必须得是一个像素点位置。


### 今日重点：
1. 实现位移比较麻烦的一点是，原有数据的处理，若场景中存在两个以上的图形对象 (triangle)，那么我们的 proxy 就需要在每次绘制的时候重新导入 proxy.points;
2. 需要调整一下结构， utils 增添存储非 triangle 数据对象，保证 line 和 triangle 能够存在。
3. 每一次绘制的数据处理都需要重新生成 proxy.points;

### 反思要点：
传参传的太多了，既然使用范围很广的话，建议还是可以使用全局对象。
utils 之前没有考虑的地方再议 line 单独的存在，因此 depth 方面的内容需要调整，调整范围比较大。
调整顺序有下自上：
声明一个 draw method
从 Point 到 Triangle
自后没曾加一种对象，就要有专门的内容去存储对象。
为了方便其他效果演示。

proxy 可以省略对象了

drawPoints 已经不再单纯了，现在处理数据，和引擎不同的地方在于，引擎更加倾向于把 data 放入一个 array 内进行处理，
但是由于我们内容更加的复杂，现在想真的硬件处理器看起，就需要将 draw 内容分散开来。

创建 drawMain 对象。（就因为考虑了移动问题，因为数据需要单独的存储了）

这里我们产生了一个不同的生产分区：
1. 使用向：往使用向的角度考虑，我们确实应该保留 API 分离数据组织，但是这个项目本身不具有实际使用的意义
2. 结构向：我们只负责传入顶点数据，由顶点数据，以及顶点数据类型决定最终的绘制内容，所以现在的结构是有问题的。

那么实际内容的填充是不需要我们进行调整的。我们需要的只是存储 points
tempPoints 本身没有意义，因为每次绘制的时候都应该是重新计算的。triangle 或许应该保留毕竟 depth 里面我们需要。
tempPoints 本身没什么意义，因为渲染的本质就是 Pixel 的计算填充以及绘制。

### 今日任务：

大重构！目前应当以调整数据绘制结构为优先

renderer 可以控制的应该是：
- 数据传入
- 是否开始绘制

input triangle 里面是一定会考虑 dropByDepth 的因为 depth 的数据变动在这之前已经处理过了，因为 tempPoints 的数据都是重新生成的。

dropByDepth 的检测一定实在 draw 之前就已经检测完毕的.

circle 后序单独做调整

drawLine 大改，因为剪裁算法对象已经不能单独作为绘制方案存在了
作为一个单独函数存在

因为 circle 绘制大概，最后建议是直接导入的 circle 中对应的 triangle 数据而不是pixel 数据，但是需要考虑这个地方的修改是否会影响到性能

更新完成之后，depth 的效率更低，原因是遍历像素点过多。
遍历之后反而效率比不开启 depth 更低，可能是原先的算法有问题 isContain 的算法是对的，但是可能数据并没有真正的实现 depthTest。

优化方案：
用空间换时间。
声明 width * height 数组，记录相同 pos index 的像素数据信息，之后遍历 array 节省时间，这样可以减少大量的遍历数据时间，甚至比原来的数据处理要快，因为遍历的数据更少。

无法考虑 viewport 之外的像素点，不然会报错，__这个部分以后在考虑要通过什么内容修复。__

方案弊端还有一个：
误差问题，误差导致的覆盖出现瑕疵，理论上应该是 x,y index 对应的问题？又或者是那一条 line 的 index 的问题？
屏蔽了 continue 语句，还是出现了这个问题
应该是 x,y 的问题了。
是随机出现的误差瑕疵，因此应该是 js 本身的数据误差导致的。

texture Scene 绘制
新建 texture class
难度在于纹理映射，如何将像素数据不同的信息绘制到相同既定长度的 object 上
涉及：线性差值，双线性差值，mipmap(可能太复杂了，不一定会写)

- 方案参考： https://www.bbsmax.com/A/qVdeYvn1dP/

- https://www.bbsmax.com/A/KE5QYyk5LG/

- https://www.jianshu.com/p/61c93bbe6014 offScreen Electron load pic

- https://www.lihuasoft.net/article/show.php?id=4509 texture and mipmap

- https://blog.csdn.net/jiangtao_killer/article/details/7495473 filter 解释

3.22 优先度较低的 Clip (可以暂时不做考虑):
- https://zhuanlan.zhihu.com/p/43586784

3.22:
deadLine:
3.23: translate
3.23 texture nearst 差值， linear 差值计算，要求从 engine 上面参考

3.24: cube
3.24： textureCube
3.25: pointLight? (暂定)

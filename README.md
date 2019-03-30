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

- https://www.bbsmax.com/A/KE5QYyk5LG/ mipmap

- https://www.lihuasoft.net/article/show.php?id=4509 texture and mipmap

- https://blog.csdn.net/jiangtao_killer/article/details/7495473 filter 解释

- https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-3d-perspective-correct-texturemapping.html webgl 关于纹理透视矫正

3.22 优先度较低的 Clip (可以暂时不做考虑):
- https://zhuanlan.zhihu.com/p/43586784

3.22:
deadLine:
3.23: translate
3.23 texture nearst 差值， linear 差值计算，要求从 engine 上面参考

实际上我们渲染 cube 似乎是不一定非要考虑 mipmap 的。因为直接渲染并没有错误。 仿射变换也成功了，那么做一个 element 的计算就应该没问题了。

需要纹理绘制的话在采取特殊的手段，比如特定尺寸的 cube 以及 texture 素材。

3.24: cube

透视矩阵的计算还不完整，需要优化，同时还有 clip 多余的物体剪裁。
CVV -> Canonical view volume （规范视图量）

- https://blog.csdn.net/popy007/article/details/1797121 透视剪裁参考 ！！ important

- http://www.songho.ca/opengl/gl_projectionmatrix.html 关于 z [-1, 1]

- https://www.cnblogs.com/murongxiaopifu/p/6920641.html 包含一个 z-index 最后计算出来是个伪深度的解释，有点东西

w 在投影矩阵最后获取的 w 作用是获得了标准显示范围下的 x,y,z 的区间，超出区间的点被视为在图形之外不予绘制。


绘制 cube 就需要纹理透视矫正，因为 triangle 一直是二维的绘制手段加入了 z 的检测之后也没有变为真正的三维空间。

3.25:
涉及到一个部分的改动，首先明确一点，当前的渲染单位应该是以 width 和 height 来决定的，那么我们需要在传入以 [-1, 1] 的范围的对象式考虑如何转换为我们需要的 viewport 坐标。
还有一点，根据我们参考的 《webgl 编程指南》提供的 matrix4 方法库，我们可以知道整个库是不够全面的，至少是不够完美的，这个库中提供的算法是基于书中案例需求设计的，当时实际使用比如：
透视投影矩阵的时候，需要考虑根据书中案例所设计的限定，比如：
1. 案例中的 cube 数据单位是 [-1, 1]。
2. 案例中的 cube 一直都是相同的顶点数据，具体的绘制位置变换都是通过 affine-translate 获得的。这也是在 fog 那一节的时候产生了十分严重的违和感的原因之一，数据的固定化。
既然我们借用了第三方的数据计算库，理所当然的需要在自己的代码中添加响应的适配方案。

在增添了 Vec3 关于 z-index 的考虑之后 Line 的绘制也需要进行变动，需要增加 z-index 部分相关的计算。

3.26:
cube 无法正确绘制的原因在于 z-index 的设置不够理想，和计算误差有一定的关系，但是核心原因在于 z-index 的取值会有相交的区间部分。那么实际的判断方位就需要重新的思考。
z-index 应该使用真实数值。
深度缓存算法。
参考：《计算机图形学》

还是 drawLine 的问题，按照区间计算是不存在大于 [-100, 100] 的对象的。
如果这个方法不行，就采用逐点计算，根据传入 x, y 通过线性公式计算伪深度: z -> (a * z + b) / -z 

3.27:
texture 读取 pixel 渲染
顺序应先完成 texture 的二维渲染，还是应该考虑到纹理映射问题
https://blog.csdn.net/wangdingqiaoit/article/details/51457675 - 关于 filter 较详细讲解

http://blog.atelier39.org/cg/555.html  透视纹理映射系列文章
完成 mipmap 的生成，（填充方案）

2D 渲染相对于 3D 渲染简单在深度的渲染计算。
2D 没有关于深度的概念，因此渲染内容往往只是放在平面上来思考
3D 增加了大量关于深度计算三维转换为二维的计算，因此需要考虑的部分更多。
查看了不少相关的资料，目前我的思维还大致停留在二维的思想阶段上，因为可能比较少的计算更好理解，当涉及到三维的计算时，设计程序的方向就变得更加的复杂。
这个阶段我希望整理一下关于三维物体渲染的流程，在不考虑光照的影响下，以绘制一个 cube 包含 texture 为例：
1. 确认顶点，确认当前 cube 的 12 个顶点以及 12 个 triangle。
2. 投影矩阵变换顶点数据坐标。
在第二步，以透视投影矩阵为例，透视投影中考虑了数据位点投影到 near 平面上最后生成的点信息。同时随着公式的不断完善，透视投影矩阵包含了更多的信息数据。
在 cube 场景中，有一处处理失误的地方在于透视投影的数据因为和仿射变换矩阵相乘s导致最后的 w 数据变得错误，存储了错误的信息。由链接：http://www.songho.ca/opengl/gl_projectionmatrix.html 中我们可以获悉在齐次坐标的投影矩阵数据下 w 最终应该存储 -z 原深度信息作为最终计算时的参考。
为什么 az + b / -z 作为 z 的线性关系呢？
__我们保留 -z 数据就足够了，但是为了配合 CVV 的剪裁计算，因此需要单位化 z 对象。那么 az + b 实际上应该是为了归一化。__ 最后留得三个对象的线性公式为：透视投影的公式。这是一种推到方式。下面还有另一种推到方式，结合来看效果更佳。
链接：http://www.cnblogs.com/mikewolf2002/archive/2012/11/25/2787265.html
给了部分解释，这也是我在重写深度检测是意识到的问题，投影过后的 x, y 信息与 z 不具备对应的线性关系，而解释中正好发现 x, y 与 1 / z 有线性关系，归功于相似三角形，那么根据这两个·特性，在一开始获取了 x, y 与 z 的关系之后，再推到 z 数据关系。 深度数据应该是以 [-1, 1] 为区间，但是我在计算的时候是按照 [0, 1] 的思路计算的，这是错误的，至少从单位上来看是错误的。

接下里考虑矩阵相乘问题，通过参考韦易笑工程，可以得知 update_tranfrom 在创建 box 之前，那意味着矩阵相乘之后的变化不影响 CVV 的检测，可以得知矩阵之间对于变量的影响是相对独立的，虽然数值上有偏差但是综合矩阵并不会改变最后的数据对应结论。

3. 填充变换过后的三角形像素数据, 最中转换为屏幕坐标后按照现有颜色填充方案向图形中填充数据，至于权重取颜色的 cube 设计与之前三角形和线段的颜色分析类似，就不做详细的实现了。

3.28:
关于纹理映射，算法思路比较简单这里根据参考：https://blog.csdn.net/popy007/article/details/5570803
分为两个部分：
1. 简单的实现部分，根据图形原 x, y 求出关于 1 / z 的线性关系后，求出 x\`, y\` 对应的 uv 像素数据属性。因为原 x, y 对应的是标准 uv 坐标。这个初步实现的方案比较麻烦的一点是在求线性关系上，因此第二步自然而然为优化方案（这里不做强行考虑）。
2. 这里为了实现之前 triangle 的代码衔接，添加了绑定原理数据，用于 triangle 像素填充的时候进行计算。

3.29 最终实现 texture 渲染的时候遇到的一个大问题，数据格式不统一的问题，cube 的时候通过新创建的 depthBufferTest 方案，绕过了矩阵变换后的效果展示。
经过最后的修改，目前是添加了投影矩阵之后，传入的顶点数据就必须按照 CVV 标准下进行传入，不能直接传入像素点数据了。因为 multiplyMatrix 包含了投影矩阵的变换，因此最后求出的数据是 CVV 下的单位数据。
3.30:
增加关于 w 的计算。
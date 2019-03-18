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

投影透视参考
http://www.songho.ca/opengl/gl_projectionmatrix.html

深度检测我打算使用新的缓冲区用于存储数据，然后新的点创建的时候进行对比
但是该生成点是否我们需要让它生成呢

根据这个方向的思路我们修改的对象就会不一样
若是全部的点都存在了之后我们在 utils 修正
若是生成 line 的时候生成新的 point 我们修改 point，让 pixel 无法生成

应该是前者了，毕竟该有的数据我们还是要存下来的。而且更好处理，虽然可能还是要消耗一部分处理时间。

3.16:

需要考虑深度检测问题，现在需要在 Vec3 的基础上考虑 index-z 对于绘制的影响，是否需要将对应点上的较小的 z 的对象导入 point 绘制数组
可以在 triangle 那个部分增添深度检测，因为绘制慢的很大一部分原因是因为 z-index 导致的。
三角形的颜色渐变重心判断法。

3.17:
需要完成内容 仿射变换，Cube 绘制旋转。
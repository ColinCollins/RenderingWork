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

3.16:

需要考虑深度检测问题，现在需要在 Vec3 的基础上考虑 index-z 对于绘制的影响，是否需要将对应点上的较小的 z 的对象导入 point 绘制数组
可以在 triangle 那个部分增添深度检测，因为绘制慢的很大一部分原因是因为 z-index 导致的。
三角形的颜色渐变重心判断法。

3.17:
需要完成内容 仿射变换，Cube 绘制旋转。
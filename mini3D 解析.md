draw_box
// rotate 操作是在旋转 camera 而不是旋转物体
// transfrom.world 存储 camera rotateMatrix
draw_plane

// a b c d 顶点索引
// tc 存储 texture uv 顶点坐标，单位为 [0,1]

device_draw_primitive // 根据原始渲染状态绘制三角形
// 传入 v1, v2, v3 为顶点数据信息，单位为 [-1, 1]
ts 存储所有的 transform Matrix 数据信息
transform_update 用于更新矩阵， ts->transform 存储最后的 mvpMatrix
transform_apply 更新顶点数据信息，每个顶点与 ts->transform 相乘。 devices-> transform === ts->transform
transform_check_cvv (cvv 剪裁，不再 view 内三角形丢弃)

transform——homogenize -> format 格式化 result.x / result.w, 将数据转换为投影屏幕坐标数据 此时 x,y 已经是屏幕坐标

// t1, t2, t3 存储转换完成的 vertex point[1-3]
// p[1-3] 是转换完后的数据， v[1-3] 是为格式化（归一化）的数据
将 t[1-3].w 重新替换保留 v.w, 同时 t.pos 记录转换后 pos
v[1-3] 存有的数据有 pos, uv, color, w
t = v 只是替换了 pos 和 w

trapezoid_init_triangl 拆分三角形, 横向处理的吧，判断是否是平顶三角形，不是就拆分左右，而我是拆分上下
拆分三角形的时候并没有进行插值。。

device_render_trap 填充三角形
// scanline_t -> v, step, x,y,w
从顶部到底部 （height） 遍历 Y 超出屏幕高度数据不计算。
+ 0.5 为了四舍五入吧。保证进位，此时的 j 是按照屏幕像素数值在进行计算。
// vertex_interp
// y->rhw = interp(x1->rhw, x2->rhw, t);
// 横向插值，使用的是顶端到底端两个顶点分别的 w 值。


trapezoid_edge_interp 计算边界顶点 -> vertex_interp 顶点差值，
t1 是比例，当前 y 点到顶端的比例 左线
t2 同上，不过是右线

edge_t.v 当前坐标， v1 ， v2 分别是上下顶点坐标
在插值计算部分， mini3D 要比我处理的好很多，一次计算全部数据，并且是按照比例计算，我还需要考虑多种情况，虽然填充的时候是不需要。

w 的数据很关键，也需要在插值的时候同步的计算，三个顶点的差值数据也需要保留一下，最后用于计算步长内容。
计算还是按照屏幕比例计算的，我在结构设计的时候还是有不少失误点的，但是还能补救。

vector_interp 矢量差值，
return x1 + (x2 - x1) * t;

trapezoid_init_scan_line
device_draw_scanline


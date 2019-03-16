
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;

uniform float u_PointSize;
uniform mat4 u_MvpMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;

varying vec4 v_Color;

void main() {
    gl_Position = a_Position;
    gl_PointSize = u_PointSize;
    v_Color = a_Color;
}
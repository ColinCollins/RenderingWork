# RenderingWork

reference: 
- https://bulma.io/
- https://electron.com
- https://github.com


electron 特性：
1. renderer process 不留全局对象，除非是保留在 html 里面的
2. rederer process 不能使用 nodejs module
2. main process 的对象在 app 不会保留引用，除非声明在 renderer 里面
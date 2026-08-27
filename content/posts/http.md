# 一、HTTP协议

概念：Hyper Text Transfer Protocol 超文本传输协议，规定了浏览器和服务器之间数据传输的规则

特点：

· 基于TCP协议：面向连接，安全

· 基于请求-响应模型的：一次请求对应一次响应

· HTTP协议是无状态的协议：对于事务处理没有记忆能力。每次请求-响应都是独立的

 缺点：多次请求间不能共享数据

优点：速度快

# 二、HTTP请求协议

常见的请求头

|      Host       |                         请求的主机名                         |
| :-------------: | :----------------------------------------------------------: |
|   User-Agent    | 浏览器版本，例如Chrome浏览器的标识类似Mozilla/5.0 ... Chorme.79, IE浏览器的标识类似Mozilla/5.0  (Windows NT ...) like Gecko |
|     Accept      | 表示浏览器能接收的资源类型，如text/✳️，image/✳️或者✳️/✳️表示所有 |
| Accept-Language |    表示浏览器偏好的语言，服务器可以据此返回不同语言的网页    |
| Accept-Encoding |      表示浏览器可以支持的压缩类型，例如gzip，deflate等       |
|  Content-Type   |                      请求主体的数据类型                      |
| Content-Length  |                  请求主体的大小(单位：字节)                  |


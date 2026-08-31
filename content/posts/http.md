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

1. Http协议中请求数据分为

   · 请求行(请求数据的第一行)

   · 请求头(key: value)

   · 请求体(与请求头之间隔了一个空行)

2. 请求数据的获取

   代码

   ```java
   package com.wdss;
   
   import jakarta.servlet.http.HttpServletRequest;
   import org.springframework.web.bind.annotation.RequestMapping;
   import org.springframework.web.bind.annotation.RestController;
   
   @RestController
   public class RequestController {
   
       @RequestMapping("/request")
       public String request(HttpServletRequest request) {
           //1. 获取请求方式
           String method = request.getMethod();
           System.out.println("请求方式:" + method);//GET
           //2. 获取请求url地址
           String url = request.getRequestURL().toString();
           System.out.println("请求url地址:" + url);//http://localhost:8080/request
   
           String uri = request.getRequestURI();
           System.out.println("请求uri地址:" + uri);//request
           //3. 获取请求协议
           String protocol = request.getProtocol();
           System.out.println("请求协议:" + protocol);//HTTP/1.1
           //4. 获取请求参数 - name,age
           String name = request.getParameter("name");
           String age = request.getParameter("age");
           System.out.println("name:" + name + ",age:" + age);
           //5. 获取请求头 - Accept
           String accept = request.getHeader("Accept");
           System.out.println("Accept:" + accept);
           return "ok";
       }
   }
   ```

   项目运行之后 启动浏览器 访问http://localhost:8080/request?name=wdss&age=18 浏览器检查请求

   ```
   请求网址
   http://localhost:8080/request?name=wdss&age=18
   请求方法
   GET
   状态代码
   200 OK
   远程地址
   [::1]:8080
   引荐来源网址政策
   strict-origin-when-cross-origin
   connection
   keep-alive
   content-length
   2
   content-type
   text/html;charset=UTF-8
   date
   Thu, 27 Aug 2026 06:38:30 GMT
   keep-alive
   timeout=60
   accept
   text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
   accept-encoding
   gzip, deflate, br, zstd
   accept-language
   zh-CN,zh;q=0.9,en;q=0.8
   cache-control
   max-age=0
   connection
   keep-alive
   cookie
   __clerk_db_jwt_V1MFdHls=dvb_3AERLPE2je5TjdaC3HNxBzNmj8Z; __clerk_db_jwt=dvb_3AERLPE2je5TjdaC3HNxBzNmj8Z; __session=eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zQUJ1TVFsSlVWMDB5aTRNRXNLQ2xlVlNvdlgiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJleHAiOjE3NzIxNTk5MzAsImZ2YSI6WzksLTFdLCJpYXQiOjE3NzIxNTk4NzAsImlzcyI6Imh0dHBzOi8vdG9sZXJhbnQtbXV0dC05Ny5jbGVyay5hY2NvdW50cy5kZXYiLCJuYmYiOjE3NzIxNTk4NjAsInNpZCI6InNlc3NfM0FFWWRsNm8xQm9EZ29KQnEyYVhyb2ZaWFFHIiwic3RzIjoiYWN0aXZlIiwic3ViIjoidXNlcl8zQUVZZHJBN0VUVXFDRFp4T1JZOEVIVllFalAiLCJ2IjoyfQ.sU5CEyRbwJW6XK69Ij4kN7q9X8Kp4ajRG_ct4LGINXRmCwdWaOB0bsTXSLxDkI06lOYR7RM_NPpt8xlOpie4_S6JWoQ1mc8ARjI9n9xbuTk6Zy6yuI1U84wykb3F-t5W5Kl60gY-pbiC28Ukm5x2zGrbXTampV5AaQMH1mHhE0KC1fP7_pnPk3Y0ewY6m1NF7ByessAOa70DqS4jprMevoxJLqcnucEN5EQib_veH3yF44KvXAPFzuZGvbrlQjbIDu4K3g_tT7VBgkaI1ylG2kW8skV-lrvjhwpVofAoiQBuzfJWTXe_rgHfLhDQpGHpngRbjQM69iRrZAyfZ9xpzw; __session_V1MFdHls=eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zQUJ1TVFsSlVWMDB5aTRNRXNLQ2xlVlNvdlgiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJleHAiOjE3NzIxNTk5MzAsImZ2YSI6WzksLTFdLCJpYXQiOjE3NzIxNTk4NzAsImlzcyI6Imh0dHBzOi8vdG9sZXJhbnQtbXV0dC05Ny5jbGVyay5hY2NvdW50cy5kZXYiLCJuYmYiOjE3NzIxNTk4NjAsInNpZCI6InNlc3NfM0FFWWRsNm8xQm9EZ29KQnEyYVhyb2ZaWFFHIiwic3RzIjoiYWN0aXZlIiwic3ViIjoidXNlcl8zQUVZZHJBN0VUVXFDRFp4T1JZOEVIVllFalAiLCJ2IjoyfQ.sU5CEyRbwJW6XK69Ij4kN7q9X8Kp4ajRG_ct4LGINXRmCwdWaOB0bsTXSLxDkI06lOYR7RM_NPpt8xlOpie4_S6JWoQ1mc8ARjI9n9xbuTk6Zy6yuI1U84wykb3F-t5W5Kl60gY-pbiC28Ukm5x2zGrbXTampV5AaQMH1mHhE0KC1fP7_pnPk3Y0ewY6m1NF7ByessAOa70DqS4jprMevoxJLqcnucEN5EQib_veH3yF44KvXAPFzuZGvbrlQjbIDu4K3g_tT7VBgkaI1ylG2kW8skV-lrvjhwpVofAoiQBuzfJWTXe_rgHfLhDQpGHpngRbjQM69iRrZAyfZ9xpzw; __client_uat_V1MFdHls=0; __client_uat=0; _ga=GA1.1.1218525189.1772591302; _ga_ZYY0P4FLG5=GS2.1.s1785295321$o35$g1$t1785295591$j54$l0$h0; _ga_D5Q1DYP36Q=GS2.1.s1787127178$o21$g0$t1787127178$j60$l0$h0; __next_hmr_refresh_hash__=47; _ga_22CRPL38R2=GS2.1.s1787809541$o3$g1$t1787809542$j59$l0$h0
   host
   localhost:8080
   sec-ch-ua
   "Not=A?Brand";v="99", "Google Chrome";v="151", "Chromium";v="151"
   sec-ch-ua-mobile
   ?0
   sec-ch-ua-platform
   "macOS"
   sec-fetch-dest
   document
   sec-fetch-mode
   navigate
   sec-fetch-site
   none
   sec-fetch-user
   ?1
   upgrade-insecure-requests
   1
   user-agent
   Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36
   ```

   控制台输出结果

   ```js
   请求方式:GET
   请求url地址:http://localhost:8080/request
   请求uri地址:/request
   请求协议:HTTP/1.1
   name:wdss,age:18
   Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
   
   ```

# 三、HTTP响应数据

常见状态码

| 1xx  | 响应中-临时状态码，表示请求已经接收，告诉客户端应该继续请求或者如果它已经完成则忽略它 |
| :--: | :----------------------------------------------------------: |
| 2xx  |           成功-表示请求已经被成功接收，处理已完成            |
| 3xx  | 重定向-重定向到其他地方；让客户端在发起一次请求以完成整个处理 |
| 4xx  | 客户端错误-处理发生错误，责任在客户端。如：请求了不存在的资源、客户端未被授权、禁止访问等 |
| 5xx  |  服务器错误-处理发生错误，责任在服务端。如：程序抛出异常等   |

常见响应头

|   Content-type   |    表示该响应内容的类型，例如text/html，application/json     |
| :--------------: | :----------------------------------------------------------: |
|  Content-Length  |                 表示该响应内容的长度(字节数)                 |
| Content-Encoding |                 表示该响应压缩算法，例如gzip                 |
|  Cache-Control   | 表示客户端应该如何缓存，例如max-age=300表示可以嘴多缓存300秒 |
|    Set-Cookie    |            告诉浏览器为当前页面所在的域设置cookie            |

## 响应数据设置

```java
package com.wdss;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
public class ResponseController {

    /**
     * 方式一设置响应体
     */
    @RequestMapping("/response")
    public void response(HttpServletResponse response) throws IOException {
        //1. 设置响应状态码
        response.setStatus(HttpServletResponse.SC_OK);
        //2. 设置响应头
        response.setHeader("name","wdsss");
        //3. 设置响应体
        response.getWriter().write("<h1>hello response</h1>");
    }

    /**
     * 方式二 ResponseEntity(springboot提供)
     */
    @RequestMapping("/response2")
    public ResponseEntity<String> response2() {
        return ResponseEntity
                .status(HttpStatus.OK)
                .header("name", "javaweb-ai")
                .body("<h1>hello response</h1>");
    }
}

```

# 四、SpringBootWeb小案例

首先在静态资源目录resources下存放充当数据库的user.txt

```txt
1,daqiao,1234567890,大乔,22,2024-07-15 15:05:45
2,xiaoqiao,1234567890,小乔,18,2024-07-15 15:12:09
3,diaochan,1234567890,貂蝉,21,2024-07-15 15:07:16
4,lvbu,1234567890,吕布,28,2024-07-16 10:05:15
5,zhaoyun,1234567890,赵云,27,2024-07-16 11:03:28
6,zhangfei,1234567890,张飞,31,2024-07-16 11:03:28
7,guanyu,1234567890,关羽,34,2024-07-16 12:05:12
8,liubei,1234567890,刘备,37,2024-07-16 15:03:28
```

之后在resources/static下面存放前端user.html以及js文件夹

新建一个包pojo放User实体类

```java
package com.wdss.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 用户信息
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    private Integer id;
    private String username;
    private String password;
    private String name;
    private Integer age;
    private LocalDateTime updateTime;
}

```

新建一个包controller放UserController

```java
package com.wdss.controller;

import cn.hutool.core.io.IoUtil;
import com.wdss.pojo.User;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController//@ResController包含@ResponseBody->作用：将controller返回值直接作为响应体的数据直接响应；返回值是对象/集合->json->响应
public class UserController {

    @RequestMapping("/list")
    public List<User> list() throws Exception {
        //1. 加载并读取user.txt文件并获取用户数据
        // InputStream in = new FileInputStream(new File("/Users/weiheng/Desktop/wh/study/web-ai-01/springboot-web-01/src/main/resources/user.txt"));
        InputStream in = this.getClass().getClassLoader().getResourceAsStream("user.txt");
        ArrayList<String> lines = IoUtil.readLines(in, StandardCharsets.UTF_8, new ArrayList<>());

        //2. 解析用户信息，封装为User对象 -> list集合
        List<User> userList = lines.stream().map(line -> {
            String[] parts = line.split(",");
            Integer id = Integer.parseInt(parts[0]);
            String username = parts[1];
            String password = parts[2];
            String name = parts[3];
            Integer age = Integer.parseInt(parts[4]);
            LocalDateTime updateTime = LocalDateTime.parse(parts[5], DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            return new User(id, username, password, name, age, updateTime);
        }).toList();

        //3. 返回json数据
        return userList;
    }
}

```

启动项目 访问http://localhost:8080/user.html 页面出现表格 检查浏览器请求 发现请求list

```js
[
    {
        "id": 1,
        "username": "daqiao",
        "password": "1234567890",
        "name": "大乔",
        "age": 22,
        "updateTime": "2024-07-15T15:05:45"
    },
    {
        "id": 2,
        "username": "xiaoqiao",
        "password": "1234567890",
        "name": "小乔",
        "age": 18,
        "updateTime": "2024-07-15T15:12:09"
    },
    {
        "id": 3,
        "username": "diaochan",
        "password": "1234567890",
        "name": "貂蝉",
        "age": 21,
        "updateTime": "2024-07-15T15:07:16"
    },
    {
        "id": 4,
        "username": "lvbu",
        "password": "1234567890",
        "name": "吕布",
        "age": 28,
        "updateTime": "2024-07-16T10:05:15"
    },
    {
        "id": 5,
        "username": "zhaoyun",
        "password": "1234567890",
        "name": "赵云",
        "age": 27,
        "updateTime": "2024-07-16T11:03:28"
    },
    {
        "id": 6,
        "username": "zhangfei",
        "password": "1234567890",
        "name": "张飞",
        "age": 31,
        "updateTime": "2024-07-16T11:03:28"
    },
    {
        "id": 7,
        "username": "guanyu",
        "password": "1234567890",
        "name": "关羽",
        "age": 34,
        "updateTime": "2024-07-16T12:05:12"
    },
    {
        "id": 8,
        "username": "liubei",
        "password": "1234567890",
        "name": "刘备",
        "age": 37,
        "updateTime": "2024-07-16T15:03:28"
    }
]
```

# 五、分层解耦

三层架构

· controller：控制层，接收前端发送的请求，对请求进行处理，并响应数据

· service：业务逻辑层，处理具体的业务逻辑

· dao：数据访问层(Data Access Object) (持久层)，负责数据访问操作，包括数据的增、删、改、查

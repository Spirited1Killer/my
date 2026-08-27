# Maven学习

## 一、Maven坐标

### 1.1 什么是坐标？

Maven中的坐标是资源(jar)的唯一标识，通过该坐标可以唯一定位资源位置。

使用坐标来定义项目或引入项目中需要的依赖。

### 1.2 坐标主要组成

groupId：定义当前Maven项目隶属组织名称(通常是域名反写，例如：com.wdss)

artufactid：定义当前Maven项目名称(通常是模块名称,例如order-service、goods-service)

versuion：定义当前项目版本号

#### 1.2.1 版本号后缀

SNAPSHOT：功能不稳定、尚处于开发中的版本，即快照版本

RELEASE：功能趋于稳定、当前更新停止，可以用于发型的版本

## 二、Maven依赖管理

依赖指当前项目运行所需要的jar包，一个项目中可以引入多个依赖

### 1.配置：

```xml
1.在pom.xml中编写<dependencies>标签

2.在<dependencies>标签中使用<dependency>引入坐标

3.定义坐标的groupId，artifactId，version

4.点击刷新按钮，引入最新加入的坐标
  <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>6.1.4</version>
          	<--->依赖范围</--->
          	<scope>test</scope>
        </dependency>
    </dependencies>
```

### 2.排除依赖

排除依赖：指主动断开依赖的资源，被排除的资源无需指定版本

```xml
<dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>6.1.4</version>
          
						<!--排除依赖-->
            <exclusions>
                <exclusion>
                    <groupId>io.micrometer</groupId>
                    <artifactId>micrometer-observation</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
    </dependencies>
```

### 3.生命周期

Maven的生命周期就是为了对所有的maven项目构建过程进行抽象和统一，Maven中有三套相互独立的生命周期：

clean：清理工作

default：核心工作，如：编译、测试、打包、安装、部署等

site：生成报告、发布站点等

### 4.需要关注的生命周期阶段

clean：移除上一次构建生成的文件

compile：编译项目源代码

test：使用合适的单元测试框架运行测试(junit)

package：将编译后的文件打包，如：jar、war等

install：安装项目到本地仓库

==在同一套生命周期中 运行后面的阶段时 前面的阶段都会运行==

==执行生命周期可以右侧maven面板双击 或者命令行 mvn +生命周期==

### 5.依赖范围

```xml
<dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>6.1.4</version>
          	<--->依赖范围</--->
          	<scope>test</scope>
        </dependency>
    </dependencies>
```

|    scope值    | 主程序 | 测试程序 | 打包(运行) |    范例     |
| :-----------: | :----: | :------: | :--------: | :---------: |
| compile(默认) |   y    |    y     |     y      |    log4j    |
|     test      |   -    |    y     |     -      |    junit    |
|   provided    |   y    |    y     |     -      | servlet-api |
|    runtime    |   -    |    y     |     y      |  jdbc驱动   |



## 三、单元测试

测试：是一种用来促进鉴定软件的正确性、完整性、安全性和质量的过程

阶段划分：单元测试、集成测试、系统测试、验收测试

单元测试：就是针对最小的功能单元(方法)，编写测试代码对其正确性进行测试

### 1.断言

JUnit：最流行的Java测试框架之一，提供了一些功能，方便程序员进行单元测试(第三方公司提供)

|          main方法测试          |          Junit单元测试           |
| :----------------------------: | :------------------------------: |
| 测试代码与源代码未分开，难维护 |  测试代码与源代码分开，便于维护  |
| 一个方法测试失败，影响后面方法 |     可根据需要进行自动化测试     |
|  无法自动化测试，得到测试报告  | 可自动分析测试结果，产出测试报告 |



JUnit提供了一些辅助方法，用来帮我们确定被测试的方法是否按照预期额效果正常工作，这种方式称为断言

|                           断言方法                           |                   描述                   |
| :----------------------------------------------------------: | :--------------------------------------: |
| Assertions.assertEquals(Object exp, Object act, String msg)  |     检查两个值是否相等，不相等就报错     |
| Assertions.assertNoEquals(Object unexp, Object act, String msg) |     检查两个值是否不相等，相等就报错     |
|        Assertions.assertNul l(Object act, String msg)        |   检查对象是否为null，不为null，就报错   |
|      Assertions.assertNotNul l(Object act, String msg)       |   检查对象是否不为null，为null，就报错   |
|     Assertions.assertTrue(boolean condition, String msg)     |   检查条件是否为true，不为true，就报错   |
|    Assertions.assertFalse(boolean condition, String msg)     |  检查条件是否为false，不为false，就报错  |
| Assertions.assertThrows(Class exptype, Executable exec, String msg) | 检查两个对象引用是否相等，不相等，就报错 |

```java
package com.wdss;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * 测试类
 */
public class UserServiceTest {

    @Test
    public void testGetAge() {
        UserService userService = new UserService();
        Integer age = userService.getAge("100000200103031237");
        System.out.println(age);
    }

    @Test
    public void testGetGender() {
        UserService userService = new UserService();
        String gender = userService.getGender("100000200103031237");
        System.out.println(gender);
    }

    /**
     * 断言
     */
    @Test
    public void testGenderWithAssert() {
        UserService userService = new UserService();
        String gender = userService.getGender("100000200103031237");
        //断言
        Assertions.assertEquals("男", gender, "性别获取逻辑有问题");
    }

}

```

### 2.常见注解

在JUnit中还提供了一些注解，还增强其功能 常见的注解有以下几个

|        注解        |                             说明                             |              备注               |
| :----------------: | :----------------------------------------------------------: | :-----------------------------: |
|       @Test        |       测试类中的方法用它修饰才能测试方法 才能启动执行        |            单元测试             |
| @ParameterizedTest | 参数化测试的注解(可以让单个测试运行多次，每次运行仅参数不同) | 用了该注解，就不需要@Test注解了 |
|    @ValueSource    |            参数化测试的参数来源，赋予测试方法参数            |    与参数化测试注解配合使用     |
|    @DisplayName    |      指定测试类、测试方法显示的名称(默认为类名、方法名)      |                                 |
|    @BeforeEach     | 用来修饰一个实例方法，该方法会在每一个测试方法执行前执行一次 |      初始化资源(准备工作)       |
|     @AfterEach     | 用来修饰一个实例方法，该方法会在每一个测试方法执行后执行一次 |       释放资源(清理工作)        |
|     @BeforeAll     |  用来修饰一个静态方法，该方法会在所有测试方法之前只执行一次  |      初始化资源(准备工作)       |
|     @AfterAll      |  用来修饰一个静态方法，该方法会在所有测试方法之后只执行一次  |       释放资源(清理工作)        |


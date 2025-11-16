# type-extractor

type-extractor是基于[ts-patch](https://github.com/nonara/ts-patch)的Program Transformer，目的是在编译时提取装饰器目标的类型信息，并作为参数回传给装饰器。

✨ **已实现的装饰器**

-   @comstructorParams()：提取被装饰器类的构造函数的类型
-   @autowired(): 提取被装饰器field的类型
-   @component(): 提取被装饰器方法的返回值的类型

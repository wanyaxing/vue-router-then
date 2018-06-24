# vue-router-then

[demo](http://jsfiddle.net/wanyaxing/2c7f2wef/embedded/)

## 使用方法1

> 顾名思义，就是给router的方法(push,replace,go)返回一个promise对象，并支持新页面的vm作为参数，进行then方法处理。

```javascript
example.vue

methods:{
    clickSomeOne:function(){
        this.$routerThen.push('/hello_world').then(vm=>{
            console.log(vm);
        });
    },
}
```

## 使用方法2

> 支持自定义指令v-model-link，捕捉新页面的input事件与当前元素互动，与同一元素上的v-model互动效果会更好。（此功能需要在keep-alive下的roter-view中使用，因为需要页面缓存支持。）


```html
App.vue
<template>
    <keep-alive>
        <router-view class="transit-view"></router-view>
    </keep-alive>
</template>

example.vue
<template>
    <div>
        <input v-model-link="'/select_someone'" @input="inputOfModelLink"/>

        <inputCustomer v-model="fee" v-model-link="'/select_fee'" />

        <textarea v-model="price" v-model-link="'/select_price'" ></textarea>
    </div>
</template>
<script>
methods:{
    jumpToNextPage:function(value){
        this.$routerThen.modelLink('/select_price',value=>{
            this.inputOfModelLink(value);
        });
    },
}
</script>

select_someone.vue
<script>
methods:{
    clickSomeOne:function(value){
        this.$emit('input',value);
        this.$router.go(-1);
    },
}
</script>

```

## 安装到VUE项目中：

``` bash

npm install vue-router-then --save;

```

```javascript
import Vue from 'vue'
import router from './router'

import routerThen from 'vue-router-then';
routerThen.initRouter(router)
Vue.use(routerThen)

```

## 继续开发和调试

* 将本项目下载到本地，在src/index.js基础上进行修改后，可以使用gulp进行代码压缩和转化。
```
    npm install
    gulp
```
* 如果本地没有安装gulp，需要先安装gulp
```
    sudo npm install -g gulp
```
* 你也可以将代码发布到npm，如果你有权限的话。（或者你可以仿照此例，开发其他npm项目）
```
    npm config set registry=http://registry.npmjs.org

    npm publish
```
## License

MIT


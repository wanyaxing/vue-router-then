# vue-router-then

> Promise the router request,  then do anything you want .

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

> v-model-link: add a eventListener of the element or component, to catch the input event in next router page.

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

## 安装：

> * ES6

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

## 使用方法

## License

MIT


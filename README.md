# DJI Tello SDKv3

> This is a Work in progress

### Install

```
npm i tello-sdk3
```

### Example

```js
import Tello from 'tello-sdk3';

const drone = new Tello();

await drone.connect();

await drone.takeOff();

await drone.sleep(1000);

await drone.land();
```

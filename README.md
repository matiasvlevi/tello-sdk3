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

### Read example

```js
import Tello from 'tello-sdk3';

const drone = new Tello();

// Move until you reach 150cm 
while (drone.sensor.height < 150) {
    await drone.move.up(25);
}

await drone.land();
```

### Set example

```js
import Tello from 'tello-sdk3';

const drone = new Tello();

await drone.set.speed(50);

await drone.move.front(30);

await drone.move.back(30);

await drone.land();
```
import Tello from './lib/Tello.js';

const drone = new Tello();

await drone.connect();

await drone.takeOff();

await drone.sleep(4000);

await drone.flip.back();

await drone.sleep(4000);


await drone.land();
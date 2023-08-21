export default function read(drone) {
    return {
        speed: async () => await drone.send('speed?'),
        battery: async () => await drone.send('battery?'),
        time: async () => await drone.send('time?'),
        wifi: async () => await drone.send('wifi?'),
        height: async () => await drone.send('height?'),
        temperature: async () => await drone.send('temperature?'),
        attitude: async () => await drone.send('attitude?'),
        barometer: async () => await drone.send('barometer?'),
        tof: async () => await drone.send('tof?'),
        acceleration: async () => await drone.send('acceletation?')
    }
};
export default function set(drone) {
    return {
        speed: async (s) => {
            drone.speed = s;
            await drone.send(`speed ${s}`);
        },
        rc: async (s) => await drone.send(`rc ${x} ${y} ${z}, ${yaw}`),
        wifi: async (s) => await drone.send(`wifi ${ssid} ${password}`),
    }
}
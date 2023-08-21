
const flip = (side) => `flip ${side}`

export default function control(drone) {
    return {
        takeOff: async () => await drone.send('takeoff'),
        land: async () => await drone.send('land'),
        emergency: async () => await drone.send('emergency'),
        stop: async () => await drone.send('stop'),
        go: async (x, y, z) => await drone.send(`go ${x} ${y} ${z} ${drone.speed}`),
        curve: async (x1, y1, z1, x2, y2, z2) =>
            await drone.send(`curve ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} ${drone.speed}`),
        move: {
            up: async (distance) => await drone.send(`up ${distance}`),
            down: async (distance) => await drone.send(`down ${distance}`),
            left: async (distance) => await drone.send(`left ${distance}`),
            right: async (distance) => await drone.send(`right ${distance}`),
            back: async (distance) => await drone.send(`back ${distance}`),
            front: async (distance) => await drone.send(`forward ${distance}`)
        },
        rotate: {
            clockwise: async (angle) => await drone.send(`cw ${angle}`),
            counterClockwise: async (angle) => await drone.send(`ccw ${angle}`)
        },
        flip: {
            left: async () => await drone.send(flip('l')),
            right: async () => await drone.send(flip('r')),
            back: async () => await drone.send(flip('b')),
            front: async () => await drone.send(flip('f')),
        }
    }
};

import dgram from 'node:dgram';

import { spawn } from 'node:child_process';

import set from './set.js'
import read from './read.js'

const flip = (side) => `flip ${side}`

export default class Tello {

    constructor(
        this_ip= '192.168.10.1',
        control_port_client= 8889,
        control_port_server= 8001,
        video_port_server= 11111,
        verbose= true
    ) {

        this.verbose = verbose;

        this.this_ip = this_ip;
        this.command_port_client = control_port_client;
        this.command_port_server = control_port_server;
        this.video_port_server = video_port_server;

        this.speed = 10;

        this.commandSocket = dgram.createSocket('udp4');

        this.commandSocket.on('error', (err) => {
            if (this.verbose) console.log('error: ', err);
        });

        this.commandSocket.on('listening', () => {
            const address = this.commandSocket.address();
            if (this.verbose) console.log(`control listening ${address.address}:${address.port}`);
        });


        this.stateSocket = dgram.createSocket('udp4');
        this.stateSocket.bind(8890);
        
        this.state = {};

        this.stateSocket.on('message', (msg, info) => {
            const keyValues = msg.toString().split(';');

            const data = {};

            keyValues.forEach(kv => {
                const [key, text] = kv.split(':');
                
                const prop = Tello.UdpStateKeys[key] || key;

                let value;
                if (Tello.StateValueConversions[key]) {
                    value = Tello.StateValueConversions[key](text);
                } else {
                    value = +text;
                }

                data[prop] = value;
            });

            this.state = data;
        })


        this.read = read(this);
        this.set = set(this);

        this.takeOff = (async () => await this.send('takeoff')).bind(this);
        this.land = (async () => await this.send('land')).bind(this);
        this.emergency = (async () => await this.send('emergency')).bind(this);
        this.stop = (async () => await this.send('stop')).bind(this);
        this.go = (async () => await this.send(`go ${x} ${y} ${z} ${this.speed}`)).bind(this);
        this.curve = (async (x1, y1, z1, x2, y2, z2) =>
            await this.send(`curve ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} ${this.speed}`)).bind(this);
        
        this.move = {}
        this.move.up = (async (distance) => await this.send(`up ${distance}`)).bind(this);
        this.move.down = (async (distance) => await this.send(`down ${distance}`)).bind(this);
        this.move.right = (async (distance) => await this.send(`right ${distance}`)).bind(this);
        this.move.left = (async (distance) => await this.send(`left ${distance}`)).bind(this);
        this.move.back = (async (distance) => await this.send(`back ${distance}`)).bind(this);
        this.move.forward = (async (distance) => await this.send(`forward ${distance}`)).bind(this);

        this.rotate = {}
        this.rotate.left = (async (angle) => await this.send(`cw ${angle}`)).bind(this);
        this.rotate.right = (async (angle) => await this.send(`ccw ${angle}`)).bind(this);
    
        this.flip = {}
        this.flip.left = (async () => await this.send(flip('l'))).bind(this);
        this.flip.right = (async () => await this.send(flip('r'))).bind(this);
        this.flip.back = (async () => await this.send(flip('b'))).bind(this);
        this.flip.front = (async () => await this.send(flip('f'))).bind(this);

    }

    static UdpStateKeys = {
        vgx: 'speedX',
        vgy: 'speedY',
        vgz: 'speedZ',

        agx: 'accelerationX',
        agy: 'accelerationY',
        agz: 'accelerationZ',

        templ: 'minTemperature',
        temph: 'maxTemperature',
        
        tof: 'timeOfFlight',

        h: 'height',
        bat: 'battery',
        baro: 'barometer'
    }

    static StateValueConversions = {
        h: (x) => x,
        baro: (x) => x*100,
        vgx: (x) => x*10,
        vgy: (x) => x*10,
        vgz: (x) => x*10
    }

    static Commands = {
        'land': {},
        'command': {},
        'takeoff': {},
        'streamon': {},
        'streamoff': {},
        'emergency': {},
        'up': {},
        'down': {},
        'left': {},
        'right': {},
        'forward': {},
        'back': {},
        'cw': {},
        'ccw': {},
        'flip': {},
        'go': {},
        'curve': {},
        'speed': {},
        'rc': {},
        'wifi': {},
        'mon': {},
        'moff': {},
        'mdirection': {},
        'ap': {},
        'speed?': {},
        'battery?': {},
        'time?': {},
        'wifi?': {},
        'sdk?': {},
        'sn?': {},
    }

    async connect () {
        await this.start();
        await this.send('command');
    }

    static DEFAULT_TIMEOUT = 15000;

    async sleep(time) {
        return new Promise(r => setTimeout(r, time));
    }

    async start() {
        return new Promise(async resolve => {
            this.commandSocket.bind(this.command_port_client, () => {
                this.commandSocket.setBroadcast(true);

                const address = this.commandSocket.address();
                if (this.verbose) console.log(`client listening ${address.address}:${address.port}`);

                resolve();
            });
        });
    }

    async abort(reject) {
        await this.send('land')
        reject();
    }

    async send(command = 'land') {
        return new Promise((resolve, reject) => {
            if (!Tello.Commands[command.split(' ')[0]]) {
                command = 'land';
            };

            const message = Buffer.from(command);

            if (this.verbose) console.log(`\x1b[92mSending:\x1b[0m ${command}`)

            this.commandSocket.on('message', (msg, rinfo) => {
                
                let words = msg.toString().split(' ');
                
                const error = words.splice(0, 1)[0] === 'error';
                words = words.join(' ')
                if (this.verbose) console.log('received: ', error, words,  rinfo);

                if (error) this.abort(reject);
                 
                resolve(msg.toString());

                this.commandSocket.removeAllListeners('message');
            });

            this.commandSocket.on('error', (err) => {
                if (this.verbose) console.log('error: ', err);
                reject(err);
            });

            this.commandSocket.send(
                message,
                0, message.length,
                this.command_port_client, this.this_ip,
                (err, bytes) => {
                    if (err) {
                        if (this.verbose) console.log("Error in sending: ", err);
                        return reject(err);
                    }

                    setTimeout(() => {
                        resolve(0);
                    }, this.DEFAULT_TIMEOUT)

                    if (this.verbose) console.log(`\x1b[93mSent...\x1b[0m ${command}`);
                }
            );
        });
    }

    video() {
        const file = `udp://0.0.0.0:${this.video_port_server}`;

        const opt = [
            '-fflags', 'nobuffer', 
            '-flags', 'low_delay',
            '-probesize', '32',
            '-analyzeduration', '1',
            '-strict', 'experimental',
            '-framedrop', 
            '-vf', 'setpts=0', 
            file
        ]
    
        return spawn(
            'ffplay', opt, {stdio:'ignore'} 
        );
    }

}

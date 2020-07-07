const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Radio = require('./models/radio');
const Files = require('./models/files');
const { exec } = require('child_process');
var fs = require('fs')
let playlist = []
var setTimeOut = []

fs.readFile('/home/pi/Desktop/H1', function (err, logData) {
    if (err) throw err;
    var text = logData.toString();
    playlist = text.split('\n')
})

//setInterval(sendActiveLastTime, 3000)

var fileNumber = 0
const fid = '1'

async function convertTimeToMilliSeconds(time) {
    const hour = parseInt(time.slice(0, 2))
    const minute = parseInt(time.slice(3, 5))
    const milliseconds = hour * 3600000 + minute * 60000
    return milliseconds

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendActiveLastTime() {
    status = await getOutputFromCommandLine('mpc status')
    console.log(status)
    //client.publish('tk/demo2', `${Date.now()} from player ${1} \n${status}`)
    const payload = { 'activeLastTime': Date.now() }
    const radios = await Radio.findByIdAndUpdate(fid, { $set: payload })
}

async function clearSetTimeOut() {
    if (setTimeOut.length > 0) {
        for (let id in setTimeOut) {
            clearTimeout(setTimeOut[id])
        }
        setTimeOut = []
    }
}

function calculateWaitTime(time) {
    const minute = Math.floor(time)
    const second = time - minute
    const timeToWait = minute * 60000 + second * 100000
    return timeToWait
}

function callNextFile(vol, waitTime) {
    setTimeOut.push(setTimeout(function () { exec(`mpc volume ${vol}`); exec(`mpc next`); }, waitTime));
}

async function getVolume(fileName) {
    const radios = await Radio.findById(fid)
    const fileType = fileName.split('-')[0]
    let vol = radios.mainVolume
    if (fileType === 'SONG') { 
        vol = vol + radios.musicVolume 
    }
    else if (fileType === 'PRO') { 
        vol = vol + radios.spotVolume 
    }
    else if (fileType === 'DJ') { 
        vol = vol + radios.spotVolume 
    }
    else if (fileType === 'ID') {
         vol = vol + radios.storeIdentityVolume 
        }
    else {
         vol = vol + radios.spotVolume 
        }
    console.log(`vol ${vol}`)
    return(vol)
}

async function play() {
    exec('mpc clear')
    for (var i = 0; i < playlist.length; i++) {
        exec(`mpc add '${playlist[i]}'`)
        await sleep(1)
    }
    var waitTime = parseInt(await getOutputFromCommandLine(`mediainfo --Inform="Audio;%Duration%" /var/lib/mpd/music/"${playlist[0]}"`)) - 150
    let vol = await getVolume(playlist[0])
    exec(`mpc volume ${vol}`)
    exec('mpc play')
    for (var i = 1; i < playlist.length; i++) {
        const vol = await getVolume(playlist[i])
        const milli = parseInt(await getOutputFromCommandLine(`mediainfo --Inform="Audio;%Duration%" /var/lib/mpd/music/"${playlist[i]}"`)) - 150
        //console.log(milli)

        const timeOut = callNextFile(vol, waitTime)
        waitTime = waitTime + parseInt(milli)
        console.log(playlist[i])
        console.log(waitTime)

    }
}

async function interrupt(fileName) {
    const date1 = Date.now()
    const stringStatus = await getOutputFromCommandLine('mpc status')
    const status = stringStatus.split('\n')[1].split('   ').join(',').split('  ').join(',').split(' ').join(',').split(',')
    const number = parseInt(status[1].split('/')[0].slice(1))
    const time = status[2].split('/')
    const minuteHavePlayed = time[0].split(':')[0]
    const secondHavePlayed = time[0].split(':')[1]
    const minute = time[1].split(':')[0]
    const second = time[1].split(':')[1]
    console.log(minute)
    console.log(second)
    console.log(minuteHavePlayed)
    console.log(secondHavePlayed)
    const length = parseInt(await getOutputFromCommandLine(`mediainfo --Inform="Audio;%Duration%" /var/lib/mpd/music/"${fileName}"`)) - 150
    clearSetTimeOut()
    exec('mpc clear')
    await new Promise((resolve, reject) => exec(`mpc add "${fileName}"`, (error, stdout, stderror) => {
        if (error) {
            return reject(error)
        }

        return resolve()
    }
    ))
    exec('mpc play')
    setTimeout(function () {
        exec('mpc clear');
        for (var i = 0; i < playlist.length; i++) {
            exec(`mpc add '${playlist[i]}'`)
        }
        exec('mpc volume 0');
        exec(`mpc play ${number}`);
        exec(`mpc seek ${minuteHavePlayed}:${secondHavePlayed}`);
        exec(`mpc volume 50`);
    }, length);
    const date2 = Date.now()
    var waitTime = calculateWaitTime(parseInt(minute) + (parseInt(second) / 100)) - calculateWaitTime(parseInt(minuteHavePlayed) + (parseInt(secondHavePlayed) / 100)) + length + date2 - date1 + 200
    for (var i = number; i < playlist.length; i++) {
        //const fileType = await getType(playlist[i])
        const vol = 50
        const milli = parseInt(await getOutputFromCommandLine(`mediainfo --Inform="Audio;%Duration%" /var/lib/mpd/music/"${playlist[i]}"`)) - 150
        exec('mpc play')
        const timeOut = callNextFile(vol, waitTime)
        waitTime = waitTime + parseInt(milli)
        console.log(playlist[i])
        console.log(waitTime)
    }
}

async function interruptAtSpecificTime(time, fileName) {
    const now = Date.now()
    const day = new Date('June 30, 2020 10:02:00:000')
    const waitTime = day - now
    setTimeout(function () { exec('mpc play 3') }, waitTime)

    //console.log(day-now)
    console.log(waitTime)
    // console.log(day.getTime())
    // console.log(day.getDate());
    // console.log(day.getDay())
    // console.log(day.getHours())
    // console.log(day.getMinutes())
    // console.log(day.getSeconds())
    // console.log(day.getMilliseconds())
    // console.log(day.getMonth())
    // console.log(day.getFullYear())
}

async function getOutputFromCommandLine(cmd) {
    try {
        const child = await new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    return reject(error)
                }
                return resolve(stdout)
            });
        })
        return child
    } catch (e) {
        console.error(e)
        throw e;
    }
};

var mongo_uri = 'mongodb+srv://waris46842:Gamerpg46842@next-radio.scrbg.mongodb.net/radio?retryWrites=true&w=majority';
mongoose.Promise = global.Promise;
mongoose.connect(mongo_uri, { useNewUrlParser: true }).then(
    () => {
        console.log('[success] task 2 : connected to the database ');
    },
    error => {
        console.log('[failed] task 2 ' + error);
        process.exit();
    }
);

const app = express();
app.use(express.json());

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log('[success] task 1 : listening on port ' + port);
});

const mqtt = require('mqtt');

const MQTT_SERVER = 'test.mosquitto.org';
const MQTT_PORT = '1883';

var client = mqtt.connect({
    host: MQTT_SERVER,
    port: MQTT_PORT
});

client.on('connect', function () {
    console.log('MQTT Connect');
    client.subscribe('tk/demo', function (err) {
        if (err) {
            console.log(err);
        }
    });
});

client.on('message', async (topic, message) => {
    const x = message.toString()
    console.log(x)
    //exec(x)

    if (x === 'plays') {
        play()
    }
    else if (x === 'interrupt') {
        interrupt('A6-01-Sandee Rice-005-16-TM (เพลงข้าวแสนดี แม่ครัว ผมหิวข้าว).mp3')
    }
    else if (x === 'getOutput') {
        const cmd = await getOutputFromCommandLine('mpc status')
        console.log(cmd)
        status = cmd.split('   ').join(',').split('  ').join(',').split(' ').join(',').split('\n').join(',').split(',')
        console.log(status)
    }
    else if (x.slice(0, 9) === 'interrupt') {
        interruptFile = x.slice(10)
        console.log(interruptFile)
        interrupt(interruptFile)
    }

});


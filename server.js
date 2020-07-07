const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Radio = require('./models/radio');
const File = require('./models/file');
const Command = require('./models/command');
const Files = require('./models/files')
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

// function callCommand(pid, vol, time){
//     setTimeOut.push(setTimeout(function() {client.publish('tk/demo', `mpc volume ${vol}`); client.publish('tk/demo', `mpc play ${pid}`); fileNumber=fileNumber+1}, time));
// }

function callNextFile(vol, waitTime) {
    setTimeOut.push(setTimeout(function () { exec(`mpc volume ${vol}`); exec(`mpc next`); }, waitTime));
}

// async function getVolume(fileName) {
//     const radios = await Radio.findById(fid)
//     const file = await File.findById(fileName)
//     const fileType = file.fileType
//     let vol = radios.mainVolume
//     if (fileType === 'jingle') { vol = vol + radios.jingleVolume }
//     else if (fileType === 'music') { vol = vol + radios.musicVolume }
//     else if (fileType === 'spot') { vol = vol + radios.spotVolume }
//     else if (fileType === 'storeIdentity') { vol = vol + radios.storeIdentityVolume }
//     //console.log(`vol = ${vol}`)
//     return (vol)
// }

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

// async function play(playlist){
//     exec('mpc clear')
//     exec('mpc update')
//     exec(`mpc load ${playlist}`)
//     exec('mpc play')
// }

//async function play() {
// const radios = await Radio.findById(fid)
// const playlist = radios.playlist
// let waitTime = 0
// var i
// for(i=0;i<playlist.length;i++){
//     const nextFile = playlist[i]
//     console.log(nextFile)
//     const file = await File.findById(nextFile)
//     const pid = file.pid
//     const vol = await getVolume(nextFile)
//     console.log(`volume ${vol}`)
//     console.log(`waitTime = ${waitTime}`)
//     const timeOut = callCommand(pid, vol, waitTime)
//     const length = file.fileLength
//     waitTime = waitTime + calculateWaitTime(length)
// }
// const date =new Date()
// const day = date.getDay()
// let openTime
// let closeTime
// if(day === 0){openTime = await Radio.findById(fid).SunOpenTime; closeTime = await Radio.findById(fid).SunCloseTime}
// else if(day === 1){openTime = await Radio.findById(fid).MonOpenTime; closeTime = await Radio.findById(fid).MonCloseTime}
// else if(day === 2){openTime = await Radio.findById(fid).TueOpenTime; closeTime = await Radio.findById(fid).TueCloseTime}
// else if(day === 3){openTime = await Radio.findById(fid).WedOpenTime; closeTime = await Radio.findById(fid).WedCloseTime}
// else if(day === 4){openTime = await Radio.findById(fid).ThuOpenTime; closeTime = await Radio.findById(fid).ThuCloseTime}
// else if(day === 5){openTime = await Radio.findById(fid).FriOpenTime; closeTime = await Radio.findById(fid).FriCloseTime}
// else if(day === 6){openTime = await Radio.findById(fid).SatOpenTime; closeTime = await Radio.findById(fid).SatCloseTime}
// const open = convertTimeToMilliSeconds(openTime)
// const close = convertTimeToMilliSeconds(closeTime)
// const length = close - open
// console.log(length)
// if(length > waitTime){
//     const defaultPlaylist = radios.defaultPlaylist
//     for(let i=0;i<defaultPlaylist.length;i++){
//         const nextFile = defaultPlaylist[i]
//         console.log(nextFile)
//         const file = await File.findById(nextFile)
//         const pid = file.pid
//         const vol = await getVolume(nextFile)
//         console.log(`volume ${vol}`)
//         console.log(`waitTime = ${waitTime}`)
//         const timeOut = callCommand(pid, vol, waitTime)
//         const length = file.fileLength
//         waitTime = waitTime + calculateWaitTime(length)
//     }
// }
//}

async function interruptAtSpecificTime(time, fileName) {
    const now = Date.now()
    const day = new Date('June 30, 2020 10:02:00:000')
    const waitTime = day - now
    //setTimeout(function() {interrupt(fileName)}, waitTime)
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

// async function interrupt(fileName) {
//     const radios = await Radio.findById(fid)
//     const playlist = radios.playlist
//     stringStatus = await getOutputFromCommandLine('mpc status')
//     const status = stringStatus.split('   ').join(',').split('  ').join(',').split(' ').join(',').split('\n').join(',').split(',')

//     //nowPlaying
//     const nowPlaying = status[0]
//     const minutePlayed = status[3].split('/')[0].split(':')[0]
//     const secondPlayed = status[3].split('/')[0].split(':')[1]
//     const minuteLength = parseInt(status[3].split('/')[1].split(':')[0])
//     const secondLength = parseInt(status[3].split('/')[1].split(':')[1])
//     const nowPlayingVol = status[6].slice(0,-1)
//     const nowPlayingFile = await File.findById(nowPlaying)
//     const nowPlayingPid = nowPlayingFile.pid

//     //interruptFile
//     const interruptFile = await File.findById(fileName)
//     const interruptPid = interruptFile.pid
//     const interruptLength = interruptFile.fileLength
//     const interruptVol = await getVolume(fileName)

//     //play interruptFile
//     exec(`mpc volume ${interruptVol}`)
//     exec(`mpc play ${interruptPid}`)

//     //clear setTimeOut
//     clearSetTimeOut()

//     //play after interrupt
//     setTimeOut.push(setTimeout(function() {client.publish('tk/demo', `mpc volume 0`); 
//                                         client.publish('tk/demo', `mpc play ${nowPlayingPid}`); 
//                                         client.publish('tk/demo', `mpc seek ${minutePlayed}:${secondPlayed}`);
//                                         client.publish('tk/demo', `mpc volume ${nowPlayingVol}`)}, calculateWaitTime(interruptLength)));

//     //add remaining file to playlist
//     let waitTime = calculateWaitTime(minuteLength+(secondLength/100)+interruptLength)
//     for(let i=fileNumber;i<playlist.length;i++){
//         const nextFile = playlist[i]
//         console.log(nextFile)
//         const file = await File.findById(nextFile)
//         const pid = file.pid
//         const vol = await getVolume(nextFile)
//         console.log(`volume ${vol}`)
//         console.log(`waitTime = ${waitTime}`)
//         const timeOut = callCommand(pid, vol, waitTime)
//         const length = file.fileLength
//         waitTime = waitTime + calculateWaitTime(length)
//     }


// }

// async function interrupt(fileName){
//     const status = await getOutputFromCommandLine('mpc status')
//     const milli = await getOutputFromCommandLine(`mediainfo --Inform="Audio;%Duration%" /var/lib/mpd/music/"${fileName}"`)
//     const waitTime = parseInt(milli)
//     console.log(waitTime)
//     const number = status.split('\n')[1].split('#')[1].split('/')[0]
//     const time = status.split('\n')[1].split('   ')[1].split('/')[0].split(':')
//     console.log(`number ${number}`)
//     console.log(time)
//     //const file = await Files.findById(fileName)
//     //const length = file.length
//     exec('mpc pause')
//     exec('mpc clear')
//     exec(`mpc add "${fileName}"`)
//     exec('mpc play')
//     //exec('mpc single on')
//     //exec(`mpc play`)
//     //const status2 = await getOutputFromCommandLine('mpc status')
//     //console.log(status2)
//     setTimeout(function() {exec('mpc pause');
//                         exec('mpc clear'); 
//                         exec('mpc load playlist4');
//                         exec('mpc volume 0');
//                         exec(`mpc play ${number}`);
//                         exec(`mpc seek ${time[0]}:${time[1]}`);
//                         exec('mpc volume 70');}, waitTime)

// }

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


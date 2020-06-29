const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Radio = require('./models/radio');
const File = require('./models/file');
const Command = require('./models/command');
const { exec } = require('child_process');

var fileNumber = 0

async function clearSetTimeOut(){
    if(setTimeOut.length>0){
        for(let id in setTimeOut){
            clearTimeout(setTimeOut[id])
        }
        setTimeOut= []
    }
}

function calculateWaitTime(time){
    const minute = Math.floor(time)
    const second = time-minute
    const timeToWait = minute*60000 + second*100000
    return timeToWait
}

var setTimeOut = []

function callCommand(pid, vol, time){
    setTimeOut.push(setTimeout(function() {client.publish('tk/demo', `mpc volume ${vol}`); client.publish('tk/demo', `mpc play ${pid}`); fileNumber=fileNumber+1}, time));
}

async function getVolume(fileName){
    const radios = await Radio.findById('1')
    const file = await File.findById(fileName)
    const fileType = file.fileType
    let vol = radios.mainVolume
    if(fileType === 'jingle'){
        vol = vol + radios.jingleVolume
    }
    else if(fileType === 'music'){
        vol = vol + radios.musicVolume
    }
    else if(fileType === 'spot'){
        vol = vol + radios.spotVolume
    }
    else if(fileType === 'storeIdentity'){
        vol = vol + radios.storeIdentityVolume
    }
    console.log(vol)
    return(vol)
}

async function play() {
    const radios = await Radio.findById('1')
    const playlist = radios.playlist
    let waitTime = 0
    var i
    for(i=0;i<playlist.length;i++){
        const nextFile = playlist[i]
        console.log(nextFile)
        const file = await File.findById(nextFile)
        const pid = file.pid
        const vol = await getVolume(nextFile)
        console.log(`volume ${vol}`)
        console.log(`waitTime = ${waitTime}`)
        const timeOut = callCommand(pid, vol, waitTime)
        const length = file.fileLength
        waitTime = waitTime + calculateWaitTime(length)
    }
}

async function interrupt(fileName) {
    const radios = await Radio.findById('1')
    const playlist = radios.playlist
    stringStatus = await getOutputFromCommandLine('mpc status')
    const status = stringStatus.split('   ').join(',').split('  ').join(',').split(' ').join(',').split('\n').join(',').split(',')

    //nowPlaying
    const nowPlaying = status[0]
    const minutePlayed = status[3].split('/')[0].split(':')[0]
    const secondPlayed = status[3].split('/')[0].split(':')[1]
    const minuteLength = parseInt(status[3].split('/')[1].split(':')[0])
    const secondLength = parseInt(status[3].split('/')[1].split(':')[1])
    const nowPlayingVol = status[6].slice(0,-1)
    const nowPlayingFile = await File.findById(nowPlaying)
    const nowPlayingPid = nowPlayingFile.pid

    //interruptFile
    const interruptFile = await File.findById(fileName)
    const interruptPid = interruptFile.pid
    const interruptLength = interruptFile.fileLength
    const interruptVol = await getVolume(fileName)

    //play interruptFile
    exec(`mpc volume ${interruptVol}`)
    exec(`mpc play ${interruptPid}`)

    //clear setTimeOut
    clearSetTimeOut()

    //play after interrupt
    setTimeOut.push(setTimeout(function() {client.publish('tk/demo', `mpc volume 0`); 
                                        client.publish('tk/demo', `mpc play ${nowPlayingPid}`); 
                                        client.publish('tk/demo', `mpc seek ${minutePlayed}:${secondPlayed}`);
                                        client.publish('tk/demo', `mpc volume ${nowPlayingVol}`)}, calculateWaitTime(interruptLength)));

    //add remaining file to playlist
    let waitTime = calculateWaitTime(minuteLength+(secondLength/100)+interruptLength)
    for(let i=fileNumber;i<playlist.length;i++){
        const nextFile = playlist[i]
        console.log(nextFile)
        const file = await File.findById(nextFile)
        const pid = file.pid
        const vol = await getVolume(nextFile)
        console.log(`volume ${vol}`)
        console.log(`waitTime = ${waitTime}`)
        const timeOut = callCommand(pid, vol, waitTime)
        const length = file.fileLength
        waitTime = waitTime + calculateWaitTime(length)
    }


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
mongoose.connect(mongo_uri, {useNewUrlParser: true}).then(
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

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log('[success] task 1 : listening on port ' + port);
});

const mqtt = require('mqtt');

const MQTT_SERVER =  'test.mosquitto.org';
const MQTT_PORT = '1883';

var client = mqtt.connect({
    host: MQTT_SERVER,
    port: MQTT_PORT
});

client.on('connect', function () {
    console.log('MQTT Connect');
    client.subscribe('tk/demo', function (err) {
        if(err) {
            console.log(err);
        }
    });
});

client.on('message', async (topic, message) => {
    const x = message.toString()
    console.log(x)
    //exec(x)

    if(x==='plays'){
        play()
    }
    else if(x==='interrupt'){
        interrupt('acoustic.mp3')
    }
    else if(x==='getOutput'){
        const cmd = await getOutputFromCommandLine('mpc status')
        console.log(cmd)
        status = cmd.split('   ').join(',').split('  ').join(',').split(' ').join(',').split('\n').join(',').split(',')
        console.log(status)
    }
    else if(x.slice(0,9) === 'interrupt'){
        interruptFile = x.slice(10,)
        console.log(interruptFile)
        interrupt(interruptFile)
    }

});


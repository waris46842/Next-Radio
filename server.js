const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Radio = require('./models/radio');
const Files = require('./models/files');
const { exec } = require('child_process');
var cron = require('node-cron');
var fs = require('fs')
let playlist = []
var setTimeOut = []
let today

//sync to DB at 00.00 everyday
let syncToServer = cron.schedule('* * * * *', async function () {
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    today = day[new Date(Date.now()).getDay()]
    const radios = await Radio.findById(fid)
    setMonOpen(radios.MonOpenTime)
    setMonClose(radios.MonCloseTime)
    setTueOpen(radios.TueOpenTime)
    setTueClose(radios.TueCloseTime)
    setWedOpen(radios.WedOpenTime)
    setWedClose(radios.WedCloseTime)
    setThuOpen(radios.ThuOpenTime)
    setThuClose(radios.ThuCloseTime)
    setFriOpen(radios.FriOpenTime)
    setFriClose(radios.FriCloseTime)
    setSatOpen(radios.SatOpenTime)
    setSatClose(radios.SatCloseTime)
    setSunOpen(radios.SunOpenTime)
    setSunClose(radios.SunCloseTime)
    setMusicBeforeOpen(radios.musicBeforeOpen)
    setMusicAfterClose(radios.musicAfterClose)
    setSilentBeforeOpen(radios.silentBeforeOpen)
    setSilentAfterClose(radios.silentAfterClose)
    setSpeechBeforeOpen(radios.timeSpeechBeforeOpen)
    setSpeechAfterClose(radios.timeSpeechAfterClose)
    //console.log(radios)
    //console.log(today)
});

let MonOpenTime = cron.schedule('* * * * 1', function () {
    console.log('MonOpen');
});
let MonCloseTime = cron.schedule('* * * * 1', function () {
    console.log('MonClose');
});
let TueOpenTime = cron.schedule('* * * * 2', function () {
    console.log('TueOpen');
});
let TueCloseTime = cron.schedule('* * * * 2', function () {
    console.log('TueClose');
});
let WedOpenTime = cron.schedule('* * * * 3', function () {
    console.log('WedOpen');
});
let WedCloseTime = cron.schedule('* * * * 3', function () {
    console.log('WedClose');
});
let ThuOpenTime = cron.schedule('* * * * 4', function () {
    console.log('ThuOpen');
});
let ThuCloseTime = cron.schedule('* * * * 4', function () {
    console.log('ThuClose');
});
let FriOpenTime = cron.schedule('* * * * 5', function () {
    console.log('FriOpen');
});
let FriCloseTime = cron.schedule('* * * * 5', function () {
    console.log('FriClose');
});
let SatOpenTime = cron.schedule('* * * * 6', function () {
    console.log('SatOpen');
});
let SatCloseTime = cron.schedule('* * * * 6', function () {
    console.log('SatClose');
});
let SunOpenTime = cron.schedule('* * * * 0', function () {
    console.log('SunOpen');
});
let SunCloseTime = cron.schedule('* * * * 0', function () {
    console.log('SunClose');
});
let musicBeforeOpen = cron.schedule('* * * * *', function () {
    //console.log('musicBeforeOpen');
});
let musicAfterClose = cron.schedule('* * * * *', function () {
    //console.log('musicAfterOpen');
});
let silentBeforeOpen = cron.schedule('* * * * *', function () {
    //console.log('silentBeforeOpen');
});
let silentAfterClose = cron.schedule('* * * * *', function () {
    //console.log('silentAfterClose');
});
let timeSpeechBeforeOpen = cron.schedule('* * * * *', function () {
    //console.log('timeSpeechBeforeOpen');
});
let timeSpeechAfterClose = cron.schedule('* * * * *', function () {
    //console.log('timeSpeechAfterClose');
});

fs.readFile('/home/pi/Desktop/H1', function (err, logData) {
    if (err) throw err;
    var text = logData.toString();
    playlist = text.split('\n')
})

setInterval(sendActiveLastTime, 300000)

const fid = '1'

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

async function setMonOpen(time) {
    MonOpenTime.stop()
    const hour = time.slice(0, 2)
    const minute = time.slice(3, 5)
    MonOpenTime = cron.schedule(`${minute} ${hour} * * 1`, function () {
        console.log(`Change MonOpenTime to ${hour}:${minute}`);
    });
    console.log(`Change MonOpenTime to ${hour}:${minute}`);
}

async function setTueOpen(time) {
    TueOpenTime.stop()
    const hour = time.slice(0, 2)
    const minute = time.slice(3, 5)
    TueOpenTime = cron.schedule(`${minute} ${hour} * * 2`, function () {
        console.log(`Change TueOpenTime to ${hour}:${minute}`);
    });
    console.log(`Change TueOpenTime to ${hour}:${minute}`);
}

async function setWedOpen(time) {
    WedOpenTime.stop()
    const hour = time.slice(0, 2)
    const minute = time.slice(3, 5)
    WedOpenTime = cron.schedule(`${minute} ${hour} * * 3`, function () {
        console.log(`Change WedOpenTime to ${hour}:${minute}`);
    });
    console.log(`Change WedOpenTime to ${hour}:${minute}`);
}

async function setThuOpen(time) {
    ThuOpenTime.stop()
    const hour = time.slice(0, 2)
    const minute = time.slice(3, 5)
    ThuOpenTime = cron.schedule(`${minute} ${hour} * * 4`, function () {
        console.log(`Change ThuOpenTime to ${hour}:${minute}`);
    });
    console.log(`Change ThuOpenTime to ${hour}:${minute}`);
}

async function setFriOpen(time) {
    FriOpenTime.stop()
    const hour = time.slice(0, 2)
    const minute = time.slice(3, 5)
    FriOpenTime = cron.schedule(`${minute} ${hour} * * 5`, function () {
        console.log(`Change FriOpenTime to ${hour}:${minute}`);
    });
    console.log(`Change SatOpenTime to ${hour}:${minute}`);
}

async function setSatOpen(time) {
    SatOpenTime.stop()
    const hour = time.slice(0, 2)
    const minute = time.slice(3, 5)
    SatOpenTime = cron.schedule(`${minute} ${hour} * * 6`, function () {
        console.log(`Change SatOpenTime to ${hour}:${minute}`);
    });
    console.log(`Change SatOpenTime to ${hour}:${minute}`);
}

async function setSunOpen(time) {
    SunOpenTime.stop()
    const hour = time.slice(0, 2)
    const minute = time.slice(3, 5)
    SunOpenTime = cron.schedule(`${minute} ${hour} * * 0`, function () {
        console.log(`Change SunOpenTime to ${hour}:${minute}`);
    });
    console.log(`Change SunOpenTime to ${hour}:${minute}`);
}

async function setMonClose(time) {
    MonCloseTime.stop()
    const hour = time.slice(0, 2)
    const minute = time.slice(3, 5)
    MonCloseTime = cron.schedule(`${minute} ${hour} * * 1`, function () {
        console.log(`Change MonCloseTime to ${hour}:${minute}`);
    });
    console.log(`Change MonCloseTime to ${hour}:${minute}`);
}

async function setTueClose(time) {
    TueCloseTime.stop()
    const hour = time.slice(0, 2)
    const minute = time.slice(3, 5)
    TueCloseTime = cron.schedule(`${minute} ${hour} * * 2`, function () {
        console.log(`Change TueCloseTime to ${hour}:${minute}`);
    });
    console.log(`Change TueCloseTime to ${hour}:${minute}`);
}

async function setWedClose(time) {
    WedCloseTime.stop()
    const hour = time.slice(0, 2)
    const minute = time.slice(3, 5)
    WedCloseTime = cron.schedule(`${minute} ${hour} * * 3`, function () {
        console.log(`Change WedCloseTime to ${hour}:${minute}`);
    });
    console.log(`Change WedCloseTime to ${hour}:${minute}`);
}

async function setThuClose(time) {
    ThuCloseTime.stop()
    const hour = time.slice(0, 2)
    const minute = time.slice(3, 5)
    ThuCloseTime = cron.schedule(`${minute} ${hour} * * 4`, function () {
        console.log(`Change ThuCloseTime to ${hour}:${minute}`);
    });
    console.log(`Change ThuCloseTime to ${hour}:${minute}`);
}

async function setFriClose(time) {
    FriCloseTime.stop()
    const hour = time.slice(0, 2)
    const minute = time.slice(3, 5)
    FriCloseTime = cron.schedule(`${minute} ${hour} * * 5`, function () {
        console.log(`Change FriCloseTime to ${hour}:${minute}`);
    });
    console.log(`Change FriCloseTime to ${hour}:${minute}`);
}

async function setSatClose(time) {
    SatCloseTime.stop()
    const hour = time.slice(0, 2)
    const minute = time.slice(3, 5)
    SatCloseTime = cron.schedule(`${minute} ${hour} * * 6`, function () {
        console.log(`Change SatCloseTime to ${hour}:${minute}`);
    });
    console.log(`Change SatCloseTime to ${hour}:${minute}`);
}

async function setSunClose(time) {
    SunCloseTime.stop()
    const hour = time.slice(0, 2)
    const minute = time.slice(3, 5)
    SunCloseTime = cron.schedule(`${minute} ${hour} * * 0`, function () {
        console.log(`Change SunCloseTime to ${hour}:${minute}`);
    });
    console.log(`Change SunCloseTime to ${hour}:${minute}`);
}

async function setMusicBeforeOpen(time) {
    let openTimeHour
    let openTimeMinute
    const radios = await Radio.findById(fid)
    if (today === 'Mon') { openTimeHour = radios.MonOpenTime.slice(0, 2); openTimeMinute = radios.MonOpenTime.slice(3, 5) }
    else if (today === 'Tue') { openTimeHour = radios.TueOpenTime.slice(0, 2); openTimeMinute = radios.TueOpenTime.slice(3, 5) }
    else if (today === 'Wed') { openTimeHour = radios.WedOpenTime.slice(0, 2); openTimeMinute = radios.WedOpenTime.slice(3, 5) }
    else if (today === 'Thu') { openTimeHour = radios.ThuOpenTime.slice(0, 2); openTimeMinute = radios.ThuOpenTime.slice(3, 5) }
    else if (today === 'Fri') { openTimeHour = radios.FriOpenTime.slice(0, 2); openTimeMinute = radios.FriOpenTime.slice(3, 5) }
    else if (today === 'Sat') { openTimeHour = radios.SatOpenTime.slice(0, 2); openTimeMinute = radios.SatOpenTime.slice(3, 5) }
    else if (today === 'Sun') { openTimeHour = radios.SunOpenTime.slice(0, 2); openTimeMinute = radios.SunOpenTime.slice(3, 5) }
    let totalMinute = parseInt(openTimeHour)*60 + parseInt(openTimeMinute) - time
    const musicBeforeOpenHour = Math.floor(totalMinute/60)
    const musicBeforeOpenMinute = totalMinute%60
    musicBeforeOpen.stop()
    musicBeforeOpen = cron.schedule(`0 ${musicBeforeOpenMinute} ${musicBeforeOpenHour} * * *`, function () {
        console.log(`Change musicBeforeOpen to ${musicBeforeOpenHour}:${musicBeforeOpenMinute}`);
    });
    console.log(`Change musicBeforeOpen to ${musicBeforeOpenHour}:${musicBeforeOpenMinute}:0`)
}

async function setMusicAfterClose(time) {
    let closeTimeHour
    let closeTimeMinute
    const radios = await Radio.findById(fid)
    if (today === 'Mon') { closeTimeHour = radios.MonCloseTime.slice(0, 2); closeTimeMinute = radios.MonCloseTime.slice(3, 5) }
    else if (today === 'Tue') { closeTimeHour = radios.TueCloseTime.slice(0, 2); closeTimeMinute = radios.TueCloseTime.slice(3, 5) }
    else if (today === 'Wed') { closeTimeHour = radios.WedCloseTime.slice(0, 2); closeTimeMinute = radios.WedCloseTime.slice(3, 5) }
    else if (today === 'Thu') { closeTimeHour = radios.ThuCloseTime.slice(0, 2); closeTimeMinute = radios.ThuCloseTime.slice(3, 5) }
    else if (today === 'Fri') { closeTimeHour = radios.FriCloseTime.slice(0, 2); closeTimeMinute = radios.FriCloseTime.slice(3, 5) }
    else if (today === 'Sat') { closeTimeHour = radios.SatCloseTime.slice(0, 2); closeTimeMinute = radios.SatCloseTime.slice(3, 5) }
    else if (today === 'Sun') { closeTimeHour = radios.SunCloseTime.slice(0, 2); closeTimeMinute = radios.SunCloseTime.slice(3, 5) }
    if(time === 1){
        musicAfterClose.stop()
        musicAfterClose = cron.schedule(`${musicAfterCloseMinute} ${musicAfterCloseHour} * * *`, function () {
            console.log(`Change musicAfterClose to ${musicAfterCloseHour}:${musicAfterCloseMinute}`);
        });
    }
    else{
        musicAfterClose.stop()
        musicAfterClose = cron.schedule(`${closeTimeMinute} ${closeTimeHour} * * *`, function () {
            console.log(`Change musicAfterClose to ${closeTimeHour}:${closeTimeMinute}`);
        });
    }
    console.log(`Change musicAfterClose to ${closeTimeHour}:${closeTimeMinute}`);

}

async function setSilentBeforeOpen(time) {
    let silentTimeMinute
    let silentTimeSecond
    let silentTimeHour
    const radios = await Radio.findById(fid)
    if (today === 'Mon') { closeTimeHour = radios.MonOpenTime.slice(0, 2); closeTimeMinute = radios.MonOpenTime.slice(3, 5) }
    else if (today === 'Tue') { silentTimeHour = radios.TueOpenTime.slice(0, 2); silentTimeMinute = radios.TueOpenTime.slice(3, 5) }
    else if (today === 'Wed') { silentTimeHour = radios.WedOpenTime.slice(0, 2); silentTimeMinute = radios.WedOpenTime.slice(3, 5) }
    else if (today === 'Thu') { silentTimeHour = radios.ThuOpenTime.slice(0, 2); silentTimeMinute = radios.ThuOpenTime.slice(3, 5) }
    else if (today === 'Fri') { silentTimeHour = radios.FriOpenTime.slice(0, 2); silentTimeMinute = radios.FriOpenTime.slice(3, 5) }
    else if (today === 'Sat') { silentTimeHour = radios.SatOpenTime.slice(0, 2); silentTimeMinute = radios.SatOpenTime.slice(3, 5) }
    else if (today === 'Sun') { silentTimeHour = radios.SunOpenTime.slice(0, 2); silentTimeMinute = radios.SunOpenTime.slice(3, 5) }
    totalSecond = silentTimeHour*3600 + silentTimeMinute*60 - time
    silentTimeHour = Math.floor(totalSecond/3600)
    silentTimeMinute = (Math.floor(totalSecond/60))%60
    silentTimeSecond = totalSecond%60
    silentBeforeOpen.stop()
    silentBeforeOpen = cron.schedule(`${silentTimeSecond} ${silentTimeMinute} ${silentTimeHour} * * *`, function () {
        console.log(`Change silentBeforeOpen to ${silentTimeHour}:${silentTimeMinute}:${silentTimeSecond}`);
    });
    console.log(`Change silentBeforeOpen to ${silentTimeHour}:${silentTimeMinute}:${silentTimeSecond}`)
}

async function setSilentAfterClose(time) {
    let silentTimeMinute
    let silentTimeSecond
    let silentTimeHour
    const radios = await Radio.findById(fid)
    if (today === 'Mon') { closeTimeHour = radios.MonCloseTime.slice(0, 2); closeTimeMinute = radios.MonCloseTime.slice(3, 5) }
    else if (today === 'Tue') { silentTimeHour = radios.TueCloseTime.slice(0, 2); silentTimeMinute = radios.TueCloseTime.slice(3, 5) }
    else if (today === 'Wed') { silentTimeHour = radios.WedCloseTime.slice(0, 2); silentTimeMinute = radios.WedCloseTime.slice(3, 5) }
    else if (today === 'Thu') { silentTimeHour = radios.ThuCloseTime.slice(0, 2); silentTimeMinute = radios.ThuCloseTime.slice(3, 5) }
    else if (today === 'Fri') { silentTimeHour = radios.FriCloseTime.slice(0, 2); silentTimeMinute = radios.FriCloseTime.slice(3, 5) }
    else if (today === 'Sat') { silentTimeHour = radios.SatCloseTime.slice(0, 2); silentTimeMinute = radios.SatCloseTime.slice(3, 5) }
    else if (today === 'Sun') { silentTimeHour = radios.SunCloseTime.slice(0, 2); silentTimeMinute = radios.SunCloseTime.slice(3, 5) }
    totalSecond = silentTimeHour*3600 + silentTimeMinute*60 - time
    silentTimeHour = Math.floor(totalSecond/3600)
    silentTimeMinute = (Math.floor(totalSecond/60))%60
    silentTimeSecond = totalSecond%60
    silentAfterClose.stop()
    silentAfterClose = cron.schedule(`${silentTimeSecond} ${silentTimeMinute} ${silentTimeHour} * * *`, function () {
        console.log(`Change silentAfterClose to ${silentTimeHour}:${silentTimeMinute}:${silentTimeSecond}`);
    });
    console.log(`Change silentAfterClose to ${silentTimeHour}:${silentTimeMinute}:${silentTimeSecond}`)
}

async function setSpeechBeforeOpen(time) {
    let speechTimeMinute
    let speechTimeSecond
    let speechTimeHour
    const radios = await Radio.findById(fid)
    if (today === 'Mon') { speechTimeHour = radios.MonOpenTime.slice(0, 2); speechTimeMinute = radios.MonOpenTime.slice(3, 5) }
    else if (today === 'Tue') { speechTimeHour = radios.TueOpenTime.slice(0, 2); speechTimeMinute = radios.TueOpenTime.slice(3, 5) }
    else if (today === 'Wed') { speechTimeHour = radios.WedOpenTime.slice(0, 2); speechTimeMinute = radios.WedOpenTime.slice(3, 5) }
    else if (today === 'Thu') { speechTimeHour = radios.ThuOpenTime.slice(0, 2); speechTimeMinute = radios.ThuOpenTime.slice(3, 5) }
    else if (today === 'Fri') { speechTimeHour = radios.FriOpenTime.slice(0, 2); speechTimeMinute = radios.FriOpenTime.slice(3, 5) }
    else if (today === 'Sat') { speechTimeHour = radios.SatOpenTime.slice(0, 2); speechTimeMinute = radios.SatOpenTime.slice(3, 5) }
    else if (today === 'Sun') { speechTimeHour = radios.SunOpenTime.slice(0, 2); speechTimeMinute = radios.SunOpenTime.slice(3, 5) }
    totalSecond = speechTimeHour*3600 + speechTimeMinute*60 - time
    speechTimeHour = Math.floor(totalSecond/3600)
    speechTimeMinute = (Math.floor(totalSecond/60))%60
    speechTimeSecond = totalSecond%60
    timeSpeechBeforeOpen.stop()
    timeSpeechBeforeOpen = cron.schedule(`${speechTimeSecond} ${speechTimeMinute} ${speechTimeHour} * * *`, function () {
        console.log(`Change timeSpeechBeforeOpen to ${speechTimeHour}:${speechTimeMinute}:${speechTimeSecond}`);
    });
    console.log(`Change timeSpeechBeforeOpen to ${speechTimeHour}:${speechTimeMinute}:${speechTimeSecond}`)
}

async function setSpeechAfterClose(time) {
    let speechTimeMinute
    let speechTimeSecond
    let speechTimeHour
    const radios = await Radio.findById(fid)
    if (today === 'Mon') { speechTimeHour = radios.MonCloseTime.slice(0, 2); speechTimeMinute = radios.MonCloseTime.slice(3, 5) }
    else if (today === 'Tue') { speechTimeHour = radios.TueCloseTime.slice(0, 2); speechTimeMinute = radios.TueCloseTime.slice(3, 5) }
    else if (today === 'Wed') { speechTimeHour = radios.WedCloseTime.slice(0, 2); speechTimeMinute = radios.WedCloseTime.slice(3, 5) }
    else if (today === 'Thu') { speechTimeHour = radios.ThuCloseTime.slice(0, 2); speechTimeMinute = radios.ThuCloseTime.slice(3, 5) }
    else if (today === 'Fri') { speechTimeHour = radios.FriCloseTime.slice(0, 2); speechTimeMinute = radios.FriCloseTime.slice(3, 5) }
    else if (today === 'Sat') { speechTimeHour = radios.SatCloseTime.slice(0, 2); speechTimeMinute = radios.SatCloseTime.slice(3, 5) }
    else if (today === 'Sun') { speechTimeHour = radios.SunCloseTime.slice(0, 2); speechTimeMinute = radios.SunCloseTime.slice(3, 5) }
    totalSecond = speechTimeHour*3600 + speechTimeMinute*60 - time
    speechTimeHour = Math.floor(totalSecond/3600)
    speechTimeMinute = (Math.floor(totalSecond/60))%60
    speechTimeSecond = totalSecond%60
    timeSpeechAfterClose.stop()
    timeSpeechAfterClose = cron.schedule(`${speechTimeSecond} ${speechTimeMinute} ${speechTimeHour} * * *`, function () {
        console.log(`Change timeSpeechAfterClose to ${speechTimeHour}:${speechTimeMinute}:${speechTimeSecond}`);
    });
    console.log(`Change timeSpeechAfterClose to ${speechTimeHour}:${speechTimeMinute}:${speechTimeSecond}`)
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
    return (vol)
}

async function play() {
    exec('mpc clear')
    for (var i = 0; i < playlist.length; i++) {
        await new Promise((resolve, reject) => exec(`mpc add "${playlist[i]}"`, (error, stdout, stderror) => {
            if (error) {
                return reject(error)
            }

            return resolve()
        }
        ))
    }
    var waitTime = parseFloat(await getOutputFromCommandLine(`ffprobe -i /var/lib/mpd/music/"${playlist[0]}" -show_entries format=duration -v quiet -of csv="p=0"`)) * 1000 - 500
    let vol = await getVolume(playlist[0])
    exec(`mpc volume ${vol}`)
    exec('mpc play')
    for (var i = 1; i < playlist.length; i++) {
        const vol = await getVolume(playlist[i])
        const milli = parseFloat(await getOutputFromCommandLine(`ffprobe -i /var/lib/mpd/music/"${playlist[i]}" -show_entries format=duration -v quiet -of csv="p=0"`)) * 1000 - 500
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
    const length = parseFloat(await getOutputFromCommandLine(`ffprobe -i /var/lib/mpd/music/"${fileName}" -show_entries format=duration -v quiet -of csv="p=0"`)) * 1000 - 150
    clearSetTimeOut()
    exec('mpc clear')
    console.log(`play ${fileName}`)
    await new Promise((resolve, reject) => exec(`mpc add "${fileName}"`, (error, stdout, stderror) => {
        if (error) {
            return reject(error)
        }

        return resolve()
    }
    ))
    console.log(new Date(Date.now()).getMilliseconds())
    exec('mpc play')
    setTimeout(async function () {
        exec('mpc clear');
        for (var i = 0; i < playlist.length; i++) {
            await new Promise((resolve, reject) => exec(`mpc add "${playlist[i]}"`, (error, stdout, stderror) => {
                if (error) {
                    return reject(error)
                }

                return resolve()
            }
            ))
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
        const milli = parseFloat(await getOutputFromCommandLine(`ffprobe -i /var/lib/mpd/music/"${playlist[i]}" -show_entries format=duration -v quiet -of csv="p=0"`)) * 1000 - 150
        exec('mpc play')
        const timeOut = callNextFile(vol, waitTime)
        waitTime = waitTime + parseInt(milli)
        console.log(playlist[i])
        console.log(waitTime)
    }
}

async function interruptAtSpecificTime(time, fileName) {
    const now = Date.now()
    const day = new Date(time)
    const waitTime = day - now
    setTimeout(function () { interrupt(fileName) }, waitTime)
    console.log(waitTime)
    // console.log(day.getTime())
    // console.log(day.getDate());
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
    if (x === 'plays') {
        play()
    }
    else if (x === 'interrupt') {
        interrupt('A6-01-Sandee Rice-005-16-TM (เพลงข้าวแสนดี แม่ครัว ผมหิวข้าว).mp3')
    }
    else if (x.slice(0, 9) === 'interrupt') {
        const time = x.slice(10).split('/')[0]
        const fileName = x.slice(10).split('/')[1]
        console.log(time)
        console.log(fileName)
        interruptAtSpecificTime(time, fileName)
    }

});


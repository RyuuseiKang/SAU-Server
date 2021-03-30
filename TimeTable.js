var mon = {};
var tue = {};
var wed = {};
var thu = {};
var fri = {};

module.exports.SetValue = function(value) {
    let data = value.split('<form name=')[1].split('</form>')[0];

    let paramsCount =
        (data.length - replaceAll(data, 'input', '').length) / 5;

    for (var i = 0; i < paramsCount; i++) {
        this.AddParameter (
            data.split ("name='")[i + 1].split ("'")[0],
            data.split ("value='")[i + 1].split ("'")[0]
        );
    }
};

module.exports.AddValue = function(time, day, value) {
    // var lession = {'time': time, 'lession': value};

    value = value.split(" ")[0].split("(")[0];

    switch(day) {
        case 0: 
            mon[time] = value;
            break;
        case 1:
            tue[time] = value;
            break;
        case 2:
            wed[time] = value;
            break;
        case 3:
            thu[time] = value;
            break;
        case 4:
            fri[time] = value;
            break;
    }

    //map.set(name, value);
};

module.exports.GetValue = function(name) {
    //return map.get(name);
};

module.exports.GetValue = function() {
    var counter = [0, 0, 0, 0, 0];

    var monData = [];
    var tueData = [];
    var wedData = [];
    var thuData = [];
    var friData = [];

    var frontData = null;
    for(var i = 0 ; i < 13; i++) {
        console.log('frontData: ' + frontData + ', mon[' + i + ']: ' + mon[i]);
        if(frontData != mon[i]) {
            monData[counter[0]] = {lesson: mon[i], time: 1};
            frontData = monData[counter[0]].lesson;
            counter[0]++;
        }
        else {
            monData[counter[0] - 1] = {lesson: monData[counter[0] -1].lesson, time: monData[counter[0] - 1].time + 1};
        }
    }

    frontData = null;
    for(var i = 0 ; i < 13; i++) {
        if(frontData != tue[i]) {
            tueData[counter[1]] = {lesson: tue[i], time: 1};
            frontData = tueData[counter[1]].lesson;
            counter[1]++;
        }
        else {
            tueData[counter[1] - 1] = {lesson: tueData[counter[1] -1].lesson, time: tueData[counter[1] - 1].time + 1};
        }
    }

    frontData = null;
    for(var i = 0 ; i < 13; i++) {
        if(frontData != wed[i]) {
            wedData[counter[2]] = {lesson: wed[i], time: 1};
            frontData = wedData[counter[2]].lesson;
            counter[2]++;
        }
        else {
            wedData[counter[2] - 1] = {lesson: wedData[counter[2] -1].lesson, time: wedData[counter[2] - 1].time + 1};
        }
    }

    frontData = null;
    for(var i = 0 ; i < 13; i++) {
        if(frontData != thu[i]) {
            thuData[counter[3]] = {lesson: thu[i], time: 1};
            frontData = thuData[counter[3]].lesson;
            counter[3]++;
        }
        else {
            thuData[counter[3] - 1] = {lesson: thuData[counter[3] -1].lesson, time: thuData[counter[3] - 1].time + 1};
        }
    }

    frontData = null;
    for(var i = 0 ; i < 13; i++) {
        if(frontData != fri[i]) {
            friData[counter[4]] = {lesson: fri[i], time: 1};
            frontData = friData[counter[4]].lesson;
            counter[4]++;
        }
        else {
            friData[counter[4] - 1] = {lesson: friData[counter[4] -1].lesson, time: friData[counter[4] - 1].time + 1};
        }
    }

    return {
        'mon': monData,
        'tue': tueData,
        'wed': wedData,
        'thu': thuData,
        'fri': friData,
    };
};

module.exports.Clear = function() {
    // map.clear();

    mon = {};
    tue = {};
    wed = {};
    thu = {};
    fri = {};
};

function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}

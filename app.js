const express = require("express");
const app = express();

require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// api
const auth = require('./routes/auth')(app);
app.use('/auth', auth);
const book = require('./routes/book')(app);
app.use('/book', book);
const post = require('./routes/post')(app);
app.use('/post', post);
const upload = require('./routes/upload')(app);
app.use('/upload', upload);
const chat = require('./routes/chat')(app);
app.use('/chat', chat);

app.get("/", (req, res) => {
  console.log("/");
  res.send("REST API Server\n");
});

app.listen(3005, () => {
  console.log("API SERVER listening on port 3005!");
});

// TODO: 내 정보 확인
app.get("/me", async (req, res) => {
  const cookie = req.query.cookie;

  profile = GetMe(cookie, res);
});

async function GetMe(_cookie, res) {
  axios
    .post("https://haksa.sau.ac.kr/jsp/haksa/hak_a0_ma0.jsp", null, {
      headers: {
        Host: "haksa.sau.ac.kr",
        Accept: "*/*",
        Referer: "https://haksa.sau.ac.kr/blank.jsp",
        "User-Agent": "SAUApp/0.1",
        Cookie: _cookie
      }
    })
    .then(response => {
      const isLogin = response.data.indexOf("sso redirection") < 0;
      if (!isLogin) {
        var ResponseBody = { isLogin: false };
      } else {
        var userName = response.data.split("<b>")[1].split("</b>")[0];
        var userNumber = response.data
          .split('name="hb" value="')[1]
          .split('"')[0];
        var profileURI =
          "https://scm.sau.ac.kr/upload/per/" + userNumber + ".jpg";

        var ResponseBody = {
          userNumber: userNumber,
          userName: userName,
          profileImageURI: profileURI
        };
      }

      res.send(ResponseBody);
    });
}

// TODO: 시간표 확인
app.get("/me/timetable", async (req, res) => {
  const cookie = req.query.cookie;

  timetable = GetTimeTable(cookie, res);
});

async function GetTimeTable(_cookie, res) {
  var tableDB = [];

  axios
    .post("https://haksa.sau.ac.kr/jsp/haksa/hak_b0_ma0.jsp", null, {
      headers: {
        Host: "haksa.sau.ac.kr",
        Accept: "*/*",
        Referer: "https://haksa.sau.ac.kr/blank.jsp",
        "User-Agent": "SAUApp/0.1",
        Cookie: _cookie
      }
    })
    .then(response => {
      const isLogin = response.data.indexOf("sso redirection") < 0;
      if (!isLogin) {
        var ResponseBody = { isLogin: false };
      } else {
        let paramsCount =
          (response.data.length -
            replaceAll(response.data, '<TR  height="20">', "").length) /
          17;

        var timetable = new require("./TimeTable.js");
        timetable.Clear();

        for (var time = 0; time < paramsCount; time++) {
          timeData = response.data.split('<TR  height="20">')[time + 1];

          for (var day = 0; day < 5; day++) {
            value = timeData.split("cont >")[day + 1].split("</td>")[0];

            // console.log('add Table: ' + time + ', ' + day + ', ' + value);
            timetable.AddValue(time, day, value);

            var professorName = value.split("[")[0].split("]")[1];
            var locationTmp = String(value.split("](")[1]);
            var location = locationTmp.substring(0, locationTmp.length - 1);

            tableDB[value.split(" [")[0].split("(")[0]] = {
              professorName: professorName,
              location: location
            };
          }
        }

        ResponseBody = timetable.GetValue();

        if (res != null) res.send(ResponseBody);
        // console.log(ResponseBody);
        return tableDB;
      }

      if (res != null) res.send(ResponseBody);

      return tableDB;
    });
}

// TODO: 이번주 시간표 확인
app.get("/me/weekTimeTable", async (req, res) => {
  const cookie = req.query.cookie;

  weekTimeTable = GetWeekTimeTable(cookie, res);
});

async function GetWeekTimeTable(_cookie, res) {
  var cookie = new require("./Cookie.js");
  cookie.ClearCookieAll();

  var tableDB = [];

  axios
    .post("https://haksa.sau.ac.kr/jsp/haksa/hak_b0_ma0.jsp", null, {
      headers: {
        Host: "haksa.sau.ac.kr",
        Accept: "*/*",
        Referer: "https://haksa.sau.ac.kr/blank.jsp",
        "User-Agent": "SAUApp/0.1",
        Cookie: _cookie
      }
    })
    .then(response => {
      cookie.AddCookie(
        "cs",
        "AUTOLOGIN",
        response.data.split('oForm.common_rd_id.value = "')[1].split('"')[0]
      );

      const isLogin = response.data.indexOf("sso redirection") < 0;
      if (!isLogin) {
        var ResponseBody = { isLogin: false };
      } else {
        let paramsCount =
          (response.data.length -
            replaceAll(response.data, '<TR  height="20">', "").length) /
          17;

        for (var time = 0; time < paramsCount; time++) {
          timeData = response.data.split('<TR  height="20">')[time + 1];

          for (var day = 0; day < 5; day++) {
            value = timeData.split("cont >")[day + 1].split("</td>")[0];

            if (value != "") {
              var professorName = value.split("[")[1].split("]")[0];
              var locationTmp = String(value.split("](")[1]);
              var location = locationTmp.substring(0, locationTmp.length - 1);

              tableDB[value.split(" [")[0].split("(")[0]] = {
                professorName: professorName,
                location: location
              };
            }
          }
        }

        // console.log(tableDB);

        axios
          .post("https://cs.sau.ac.kr/index.do", null, {
            headers: {
              Host: "cs.sau.ac.kr",
              Accept: "*/*",
              Referer: "https://cs.sau.ac.kr/m/main.do",
              Connection: "keep-alive",
              "User-Agent": "SAUApp/0.1",
              Cookie: cookie.GetCookie("cs")
            }
          })
          .then(response => {
            cookie.AddCookie(
              "cs",
              "JSESSIONID",
              response.headers["set-cookie"][1]
                .split("JSESSIONID=")[1]
                .split(";")[0]
            );
            cookie.AddCookie(
              "cs",
              "SCOUTER",
              response.headers["set-cookie"][0]
                .split("SCOUTER=")[1]
                .split(";")[0]
            );

            axios
              .post("https://cs.sau.ac.kr/m/student/calendar.do", null, {
                headers: {
                  Host: "cs.sau.ac.kr",
                  Accept: "*/*",
                  Connection: "keep-alive",
                  "User-Agent": "SAUApp/0.1",
                  Cookie: cookie.GetCookie("cs")
                }
              })
              .then(response => {
                var thisWeek;
                var weekTable = response.data
                  .split("<ul>")[1]
                  .split("</ul>")[0];
                var date = new Date();

                let weekCount =
                  (weekTable.length -
                    replaceAll(weekTable, "data-weeks", "").length) /
                  10;
                for (var i = 2; i <= weekCount; i++) {
                  weekData = weekTable.split(">")[1].split(" ~ ")[0];
                  month = weekData.split("/")[1];
                  day = weekData.split("/")[2];

                  if (date.getMonth() <= month && date.getDay() < day) {
                    thisWeek = i;
                    i = weekCount + 1;
                  }
                }

                axios
                  .post(
                    "https://cs.sau.ac.kr/m/student/calendarList.do?weeks=" +
                      weekCount,
                    null,
                    {
                      headers: {
                        Host: "cs.sau.ac.kr",
                        Cookie: cookie.GetCookie("cs")
                      }
                    }
                  )
                  .then(response => {
                    list = response.data.list;

                    var tableList = [[], [], [], [], [], []];

                    var mon = [];
                    var tue = [];
                    var wed = [];
                    var thu = [];
                    var fri = [];
                    var sat = [];

                    var monCounter = 0;
                    var tueCounter = 0;
                    var wedCounter = 0;
                    var thuCounter = 0;
                    var friCounter = 0;
                    var satCounter = 0;

                    var table;

                    list.forEach(element => {
                      tableList[element["yoil"] - 1][
                        element["gyosi"] - 1
                      ] = element["gwamok_hname"].split("(")[0];
                    });

                    for (var i = 0; i < 6; i++) {
                      var lessonName = null;
                      for (var j = 0; j < tableList[i].length; j++) {
                        if (lessonName != tableList[i][j]) {
                          var data;
                          if (tableList[i][j] != null)
                            data = {
                              time: j + 9 + ":00",
                              lessonName: tableList[i][j],
                              professorName:
                                tableDB[tableList[i][j]].professorName,
                              location: tableDB[tableList[i][j]].location,
                              isLesson: true,
                              isEnd: false
                            };
                          else
                            data = {
                              time: j + 9 + ":00",
                              lessonName: "공강",
                              professorName: "",
                              location: "",
                              isLesson: false,
                              isEnd: false
                            };

                          switch (i) {
                            case 0:
                              mon[monCounter++] = data;
                              break;
                            case 1:
                              tue[tueCounter++] = data;
                              break;
                            case 2:
                              wed[wedCounter++] = data;
                              break;
                            case 3:
                              thu[thuCounter++] = data;
                              break;
                            case 4:
                              fri[friCounter++] = data;
                              break;
                            case 5:
                              sat[satCounter++] = data;
                              break;
                          }

                          lessonName = tableList[i][j];
                        }
                      }
                      
                      data = {
                        time: tableList[i].length + 9 + ":00",
                        lessonName: "수업 끝",
                        professorName: "",
                        location: "",
                        isLesson: false,
                        isEnd: true
                      };

                      switch (i) {
                        case 0:
                          if (monCounter) mon[monCounter++] = data;
                          break;
                        case 1:
                          if (tueCounter) tue[tueCounter++] = data;
                          break;
                        case 2:
                          if (wedCounter) wed[wedCounter++] = data;
                          break;
                        case 3:
                          if (thuCounter) thu[thuCounter++] = data;
                          break;
                        case 4:
                          if (friCounter) fri[friCounter++] = data;
                          break;
                        case 5:
                          if (satCounter) sat[satCounter++] = data;
                          break;
                      }
                    }

                    table = {
                      mon: mon,
                      tue: tue,
                      wed: wed,
                      thu: thu,
                      fri: fri,
                      sat: sat
                    };

                    res.send(table);
                  });
              });
          });
      }
    });
}

// TODO: 버스 시간표 확인
app.get("/bus", async (req, res) => {
  const hour = req.query.hour;
  const minute = req.query.minute;

  busTable = GetBusTable(hour, minute, res);
});

async function GetBusTable(_hour, _minute, res) {
  axios
    .get("http://sau.ac.kr/intro/notice/view/17224", null, {})
    .then(response => {
      table = response.data.split("<tbody>")[3].split("</tbody>")[0];
      console.log(table);
    });
}

// 함수
function replaceAll(str, searchStr, replaceStr) {
  return str.split(searchStr).join(replaceStr);
}

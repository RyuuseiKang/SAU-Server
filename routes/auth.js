const axios = require("axios");
const crypto = require("crypto");
var db_config = require('../db.js');
var conn = db_config.init();
db_config.connect(conn);

module.exports = (app) => {
	const router = require('express').Router();
	const application = app;

	router.get("/login", async (req, res) => {
			//console.log(req.query);
			const userId = req.query.userId;
			const userPassword = req.query.userPassword;

			if(userId == '' || userPassword == '') {
				res.send({isLogin: false})
				return;
			}
		
			// res.send(test());
			isLogin = await LoginJSP(userId, userPassword, res);
			// res.send('로그인 성공여부' + isLogin);
		});
		
		// TODO: 아래로 로그인 모듈
		async function LoginJSP(userId, userPassword, res) {
			axios
				.post(
					"https://sso.sau.ac.kr/login.jsp?master_id=" +
						userId +
						"&master_passwd=" +
						userPassword +
						"&x=0&y=0",
					null,
					{
						headers: {
							Host: "sso.sau.ac.kr",
							Connection: "keep-alive",
							Accept: "*/*",
							Origin: "https://sso.sau.ac.kr",
							Referer:
								"https://sso.sau.ac.kr/?tmaxsso_next=http://haksa.sau.ac.kr:80",
							"User-Agent": "SAUApp/0.1",
							"Content-Type": "application/x-www-form-urlencoded"
						}
					}
				)
				.then(response => {
					// console.log(response.data);
		
					response_cookie = response.headers["set-cookie"];
		
					var cookie = new require("../Cookie.js");
					cookie.ClearCookieAll();
					parser = new require("../Parser.js");
					parser.Clear();
		
					// Req/Res Tag: console.log('LoginJSP Res: ' + response_cookie);
					// Req/Res Tag: console.log('');
		
					cookie.AddCookie(
						"sso",
						"JSESSIONID",
						response_cookie[0].split("JSESSIONID=")[1].split(";")[0]
					);
					cookie.AddCookie(
						"sso",
						"ROUTEID",
						response_cookie[1].split("ROUTEID=")[1].split(";")[0]
					);
		
					if (response.data.indexOf("틀렸습니다") > 0) {
						var failureCount = response.data.split(" + ")[1];
						// console.log('틀린 횟수: ' + failureCount);
		
						var ResponseBody = { isLogin: false, FailureCount: failureCount };
		
						res.send(ResponseBody);
		
						// 로그인 실패
						return false;
					}
					parser.SetValue(response.data);
		
					// console.log('LoginRegistrationToken: ' + cookie.GetCookie() + ', ' + parser.GetValue());
		
					return LoginRegistrationToken(cookie, parser, res);
				});
		}
		
		async function LoginRegistrationToken(_cookie, _parameter, res) {
			cookieValue = _cookie.GetCookie("sso");
			paramValue = _parameter.GetValue();
			// console.log('LoginRegistrationToken: https://ssoserver.sau.ac.kr/__tmax_eam_server__?' + paramValue);
		
			// Req/Res Tag: console.log('LoginRegistrationToken Req: ' + cookieValue);
			// Req/Res Tag: console.log('LoginRegistrationToken URL: https://ssoserver.sau.ac.kr/__tmax_eam_server__?' + paramValue);
		
			axios
				.post(
					"https://ssoserver.sau.ac.kr/__tmax_eam_server__?" + paramValue,
					null,
					{
						headers: {
							Host: "ssoserver.sau.ac.kr",
							Origin: "https://sso.sau.ac.kr",
							Referer: "https://sso.sau.ac.kr/login.jsp",
							"User-Agent": "SAUApp/0.1",
							"Content-Length": "0",
							Cookie: cookieValue
						}
					}
				)
				.then(response => {
					// console.log(response.data);
		
					response_cookie = response.headers["set-cookie"];
		
					cookie = _cookie;
					parser = new require("../Parser.js");
					parser.Clear();
		
					// Req/Res Tag: console.log('LoginRegistrationToken Res: ' + response_cookie);
					// Req/Res Tag: console.log('');
		
					cookie.AddCookie(
						"haksa",
						"tmaxsso_sessionindex",
						response_cookie[0].split("tmaxsso_sessionindex=")[1].split(";")[0]
					);
					cookie.AddCookie(
						"haksa",
						"ROUTEID",
						response_cookie[2].split("ROUTEID=")[1].split(";")[0]
					);
					cookie.AddCookie(
						"ssoServer",
						"tmaxsso_sessionindex",
						response_cookie[0].split("tmaxsso_sessionindex=")[1].split(";")[0]
					);
					cookie.AddCookie(
						"ssoServer",
						"JSESSIONID",
						response_cookie[1].split("JSESSIONID=")[1].split(";")[0]
					);
					cookie.AddCookie(
						"ssoServer",
						"ROUTEID",
						response_cookie[2].split("ROUTEID=")[1].split(";")[0]
					);
		
					parser.SetValue(response.data);
		
					return LoginRegistrationSession(cookie, parser, res);
				});
		}
		
		async function LoginRegistrationSession(_cookie, _parameter, res) {
			cookieValue = _cookie.GetCookie("haksa");
			paramValue = _parameter.GetValue();
		
			// Req/Res Tag: console.log('LoginRegistrationSession Req: ' + cookieValue);
			// Req/Res Tag: console.log('LoginRegistrationSession URL: https://haksa.sau.ac.kr:443/?' + paramValue);
		
			axios
				.post("https://haksa.sau.ac.kr:443/?" + paramValue, null, {
					headers: {
						Host: "haksa.sau.ac.kr",
						Connection: "keep-alive",
						Accept: "*/*",
						Origin: "null",
						"User-Agent": "SAUApp/0.1",
						Cookie: cookieValue
					}
				})
				.then(response => {
					// console.log(response.data);
		
					response_cookie = response.headers["set-cookie"];
		
					cookie = _cookie;
					parser = new require("../Parser.js");
					parser.Clear();
		
					// Req/Res Tag: console.log('LoginRegistrationSession Res: ' + response_cookie);
					// Req/Res Tag: console.log('');
		
					cookie.AddCookie(
						"haksa",
						"JSESSIONID",
						response_cookie[0].split("JSESSIONID=")[1].split(";")[0]
					);
					cookie.AddCookie(
						"ssoServer",
						"ROUTEID",
						response_cookie[1].split("ROUTEID=")[1].split(";")[0]
					);
		
					parser.SetValue(response.data);
		
					return LoginDistributionToken(cookie, parser, res);
				});
		}
		
		async function LoginDistributionToken(_cookie, _parameter, res) {
			cookieValue = _cookie.GetCookie("ssoServer");
			paramValue = _parameter.GetValue();
		
			// Req/Res Tag: console.log('LoginDistributionToken Req: ' + cookieValue);
			// Req/Res Tag: console.log('LoginDistributionToken URL: http://ssoserver.sau.ac.kr/__tmax_eam_server__?' + paramValue);
		
			axios
				.post(
					"http://ssoserver.sau.ac.kr/__tmax_eam_server__?" + paramValue,
					null,
					{
						headers: {
							Host: "ssoserver.sau.ac.kr",
							Connection: "keep-alive",
							Accept: "*/*",
							Origin: "http://haksa.sau.ac.kr",
							Referer: "http://haksa.sau.ac.kr/",
							"User-Agent": "SAUApp/0.1",
							Cookie: cookieValue
						}
					}
				)
				.then(response => {
					// console.log(response.data);
		
					response_cookie = response.headers["set-cookie"];
		
					cookie = _cookie;
					parser = new require("../Parser.js");
					parser.Clear();
		
					// Req/Res Tag: console.log('LoginDistributionToken Res: ' + response_cookie);
					// Req/Res Tag: console.log('');
		
					cookie.AddCookie(
						"haksa",
						"ROUTEID",
						response_cookie[0].split("ROUTEID=")[1].split(";")[0]
					);
		
					parser.SetValue(response.data);
		
					return LoginCm(cookie, parser, res);
				});
		}
		
		async function LoginCm(_cookie, _parameter, res) {
			cookieValue = _cookie.GetCookie("haksa");
			paramValue = _parameter.GetValue();
		
			// Req/Res Tag: console.log('LoginCm Req: ' + cookieValue);
			// Req/Res Tag: console.log('LoginCm URL: http://haksa.sau.ac.kr/jsp/Tlogin/login_cm.jsp?' + paramValue);
		
			axios
				.post(
					"http://haksa.sau.ac.kr/jsp/Tlogin/login_cm.jsp?" + paramValue,
					null,
					{
						headers: {
							Host: "haksa.sau.ac.kr",
							Connection: "keep-alive",
							Accept: "*/*",
							Origin: "http://ssoserver.sau.ac.kr",
							Referer:
								"http://ssoserver.sau.ac.kr/__tmax_eam_server__?tmaxsso_action=token_distribution",
							"User-Agent": "SAUApp/0.1",
							Cookie: cookieValue
						}
					}
				)
				.then(response => {
					// Req/Res Tag: console.log('Last LoginCm: ' + response.data);
		
					response_cookie = response.headers["set-cookie"];
		
					cookie.AddCookie(
						"haksa",
						"ROUTEID",
						response_cookie[0].split("ROUTEID=")[1].split(";")[0]
					);
		
					const isLogined = response.data.indexOf("blank.jsp");
		
					var ResponseBody = {
						isLogin: false
					};
		
					if((isLogined > 0) == true) {
						// 로그인 성공 DB에서 판별
						return GetMyData(cookie.GetCookie("haksa"), res);
					} else {
						res.send(ResponseBody);
						return false;
					}
				});
		}
		
		async function GetMyData(_cookie, res) {
			var token = "";
			axios
				.post("https://haksa.sau.ac.kr/jsp/haksa/hak_a0_ma0.jsp", null, {
					headers: {
						Host: "haksa.sau.ac.kr",
						Accept: " ",
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
						var userId = response.data.split('name="master_id_i"     value="')[1].split('">')[0];
						var userName = response.data.split("<b>")[1].split("</b>")[0];
						var userNumber = response.data
							.split('name="hb" value="')[1]
							.split('"')[0];
						var profileURI =
							"https://scm.sau.ac.kr/upload/per/" + userNumber + ".jpg";
		
							// 로그인 성공
							var sql = "registration('"+ userId +"', '"+ userNumber +"', '"+ userName +"', " + userNumber.substring(3, 5) + ", 'https://scm.sau.ac.kr/upload/per/" + userNumber + ".jpg')";    
							conn.query("select " + sql + ";", function (err, rows, fields) {
								if(err) {
								console.log('query is not excuted. select fail...\n' + err)
								
								var ResponseBody = {
									isLogin: false,
								};

								res.send(ResponseBody);
							} else {
								var _token = rows[0][sql];
								if (rows[0][sql] == null) {
									var current_date = (new Date()).valueOf().toString();
									var random = Math.random().toString();
									var hash = crypto.createHash('sha1').update(current_date + random).digest('hex');
									_token = hash;
									conn.query("select registrationToken('" + userId + "', '" + hash + "');", function (err, rows, fields) {
										if(err) console.log('query is not excuted. select fail...\n' + err);
										else {
		
										}
									});
								}

								var ResponseBody = {
									isLogin: true,
									token: _token,
								};
		
								res.send(ResponseBody);
							}
							});
					}
		
				});
		}



	// TODO: 세션 생존 여부 확인
	router.get("/session", async (req, res) => {
		const cookie = req.query.cookie;

		GetIsSessionAlive(cookie, res);
	});

	async function GetIsSessionAlive(_cookie, res) {
		axios
			.post("http://haksa.sau.ac.kr/blank.jsp", null, {
				headers: {
					Host: "haksa.sau.ac.kr",
					Connection: "keep-alive",
					Accept: "*/*",
					Referer: "http://haksa.sau.ac.kr/",
					"User-Agent": "SAUApp/0.1",
					Cookie: _cookie
				}
			})
			.then(response => {
				var isAlive = response.data.indexOf("sso redirection");

				if (isAlive < 0) res.send({ isSessionAlive: true });
				else res.send({ isSessionAlive: false });

				return 0;
			});
	}

	return router;
}
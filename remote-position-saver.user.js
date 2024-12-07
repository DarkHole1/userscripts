// ==UserScript==
// @name        Remote Position Saver
// @namespace   Dark Hole's Scripts
// @match       https://smotret-anime.org/*
// @match       https://anime365.ru/*
// @match       https://anime-365.ru/*
// @match       https://hentai365.ru/*
// @match       https://smotret-anime.online/*
// @match       https://smotret-anime.com/*
// @grant       GM_xmlhttpRequest
// @version     0.1.4
// @author      Dark Hole
// @description Saves position in video on server and restores it later
// ==/UserScript==

function throttle(time, f) {
  var last = 0;
  return function() {
    var now = Date.now();
    if (now - last < time) {
      return;
    }
    last = now;
    return f.apply(this, arguments);
  }
}

var BASE_URL = "https://anime365-user.maxproplus.ru/api";

function authRequest(accessToken, cb) {
  var req = new XMLHttpRequest();
  req.open("POST", BASE_URL + "/login");
  req.setRequestHeader("Content-Type", "application/json");
  req.responseType = "json";
  req.onload = function(data) {
    cb.call(this, this.response);
  }
  req.send(JSON.stringify({ accessToken }));
}

function getRequest(jwtToken, translationId, cb) {
  var req = new XMLHttpRequest();
  req.open("GET", BASE_URL + "/positions/" + translationId);
  req.setRequestHeader("Authorization", "Bearer " + jwtToken);
  req.responseType = "json";
  req.onload = function(data) {
    cb.call(this, this.response);
  }
  req.send();
}

function setRequest(jwtToken, translationId, position, cb) {
  var req = new XMLHttpRequest();
  req.open("POST", BASE_URL + "/positions");
  req.setRequestHeader("Authorization", "Bearer " + jwtToken);
  req.setRequestHeader("Content-Type", "application/json");
  req.responseType = "json";
  req.onload = function(data) {
    cb.call(this, this.response);
  }
  req.send(JSON.stringify({ translationId: parseInt(translationId), timecode: Math.floor(position) }));
}

function getAccessToken(cb) {
  var req = new XMLHttpRequest();
  req.open("GET", "/api/accessToken?app=universal");
  req.responseType = "json";
  req.onload = function() {
    cb.call(this, this.response);
  };
  req.send();
}

function jwtValid(token) {
  var parts = token.split(".");
  if (parts.length < 3) {
    return true;
  }
  try {
    var decoded = JSON.parse(atob(parts[1]));
    var exp = decoded.exp;
    var now = Date.now() / 1000;
    return exp - now >= 2 * 60 * 60;
  } catch(e) {
    return false;
  }
}

var AUTHORIZED = false;
var ACB = null;
var JWT_TOKEN = localStorage.getItem("jwtToken");

if(!JWT_TOKEN || !jwtValid(JWT_TOKEN)) {
  getAccessToken(function(data) {
    if('data' in data && 'access_token' in data.data && typeof data.data.access_token == 'string') {
      authRequest(data.data.access_token, function(data) {
        if("status" in data && data.status == "OK" && "results" in data && "jwtToken" in data.results && typeof data.results.jwtToken == "string") {
          JWT_TOKEN = data.results.jwtToken;
          localStorage.setItem("jwtToken", JWT_TOKEN);
          AUTHORIZED = true;
        }
        if(ACB) ACB();
      });
    }
  });
} else {
  AUTHORIZED = true;
}

var watched = false;
var _initVideo = unsafeWindow.initVideo;
unsafeWindow.initVideo = function(embedParams) {
  var parsed = embedParams.url.match(/^\/translations\/embed\/(\d+)$/)
  if (!parsed) {
    return _initVideo.call(this, embedParams);
  }

  var translationId = parsed[1];
  var that = this;
  function init() {
    getRequest(JWT_TOKEN, translationId, function(data) {
      if ("status" in data && data.status == "OK" && "results" in data && "timecode" in data.results) {
        embedParams.playerParams.start = data.results.timecode;
      }
      _initVideo.call(that, embedParams);
      unsafeWindow.player.on("timeupdate", throttle(5000, function() {
        if(!watched) {
          setRequest(JWT_TOKEN, translationId, this.currentTime(), function(){});
        }
      }));
      unsafeWindow.player.on("watched", function() {
        watched = true;
        localStorage.removeItem(translationId);
      })
    })
  }

  if(AUTHORIZED) {
    init();
  } else {
    ACB = init;
  }
}

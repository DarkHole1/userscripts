// ==UserScript==
// @name        Position Saver
// @namespace   Dark Hole's Scripts
// @match       https://smotret-anime.com/translations/embed/*
// @match       https://anime365.ru/translations/embed/*
// @match       https://anime-365.ru/translations/embed/*
// @match       https://hentai365.ru/translations/embed/*
// @grant       none
// @version     0.1.0
// @author      Dark Hole
// @description Saves position in video and restores it later
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

var watched = false;
var _initVideo = window.initVideo;
window.initVideo = function(embedParams) {
  var parsed = embedParams.url.match(/^\/translations\/embed\/(\d+)$/)
  if (!parsed) {
    return _initVideo.call(this, embedParams);;
  }

  var translationId = parsed[1]
  var start = localStorage.getItem(translationId);
  if (start) {
    embedParams.playerParams.start = start;
  }
  var res = _initVideo.call(this, embedParams);
  window.player.on("timeupdate", throttle(5000, function() {
    if(!watched) {
      localStorage.setItem(translationId, this.currentTime());
    }
  }));
  window.player.on("watched", function() {
    watched = true;
    localStorage.removeItem(translationId);
  })
  return res;
}

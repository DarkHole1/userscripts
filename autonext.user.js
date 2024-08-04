// ==UserScript==
// @name        Autonext
// @namespace   Dark Hole's Scripts
// @match       https://smotret-anime.net/*
// @match       https://anime365.ru/*
// @match       https://anime-365.ru/*
// @match       https://hentai365.ru/*
// @grant       none
// @version     0.1.1
// @author      Dark Hole
// @description I guess you know.
// ==/UserScript==

// For quick exit
function hookEmbed() {
  var parsedPath = window.location.pathname.match(/^\/catalog\/.+?-(\d+)\/.*?(\d+)-.+-(\d+)\/[^\/]+-(\d+)$/);
  if(!parsedPath) return;
  var animeId = parsedPath[1];
  var episode = parsedPath[2];
  var episodeId = parsedPath[3];
  var translationId = parsedPath[4];
  console.log(animeId, episode, episodeId);

  var frame = document.getElementById('videoFrame');
  if(!frame) return;
  frame.contentWindow.addEventListener('load', function() {
    var videoElement = frame.contentDocument.querySelector('video');
    if(!videoElement) return;
    videoElement.addEventListener('timeupdate', function() {
      if(videoElement.duration > 0 && videoElement.currentTime / videoElement.duration >= 1) {
        var el = document.querySelector('.m-select-sibling-episode i.right');
        if(!el) return;
        el.parentElement.click();
      }
    });
  })
}

var dynPageLoadSuccess = window.dynPageLoadSuccess;
window.dynPageLoadSuccess = function() {
  var res = dynPageLoadSuccess.apply(this, arguments);
  hookEmbed();
  return res;
}

hookEmbed();

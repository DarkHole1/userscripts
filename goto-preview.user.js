// ==UserScript==
// @name        Go to preview
// @namespace   Dark Hole's Scripts
// @match       https://smotret-anime.com/translations/embed/*
// @match       https://anime365.ru/translations/embed/*
// @match       https://anime-365.ru/translations/embed/*
// @match       https://hentai365.ru/translations/embed/*
// @grant       none
// @version     1.1
// @author      Dark Hole
// @description Adds button during editing video for going to frame that will be preview.
// ==/UserScript==

var el = document.createElement('div');
el.className = 'vjs-loop-sel-RS vjs-icon-button-RS vjs-button-RS vjs-control  vjs-off-RS';
el.role = 'button';
el.ariaLive = 'polite';
el.tabIndex = 0;
el.title = 'Перейти к превью';

var icon = document.createElement('i');
icon.className = 'material-icons vjs-centerialize-RS';
icon.innerText = 'center_focus_weak';

el.append(icon);

var initVideo = window.initVideo;
window.initVideo = function() {
  var res = initVideo.apply(this, arguments);
  var player = window.player;
  var rangeslider = player.rangeslider;

  el.addEventListener('click', function() {
    var range = rangeslider.rangeVal;
    var previewTime = Math.floor((range[1] - range[0]) / 2) + range[0];
    player.currentTime(previewTime);
  });

  player.one('loadedmetadata', function() {
    var buttonsWrapperEl = player.rangeslider.components.RSEditRangeWrapper.RSEditRangeButtonsWrapper.el();
    buttonsWrapperEl.querySelector('.range-controls').append(el);
  });

  return res;
}

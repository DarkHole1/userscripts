// ==UserScript==
// @name        Block auto progress
// @namespace   Dark Hole's Scripts
// @match       https://smotret-anime.org/translations/embed/*
// @match       https://anime365.ru/translations/embed/*
// @match       https://anime-365.ru/translations/embed/*
// @match       https://hentai365.ru/translations/embed/*
// @match       https://smotret-anime.online/translations/embed/*
// @match       https://smotret-anime.com/translations/embed/*
// @grant       none
// @version     1.4
// @author      Dark Hole
// @description Blocks mark "watched" on anime365, when you watched episode.
// ==/UserScript==

window.videojs.plugin("concatenatePlugin", function(options, arg) {
  var result = window.concatenatePlugin.apply(this, arguments);
  var trigger = result.trigger;
  result.trigger = function(ev) {
    if(ev == 'watched') return;
    return trigger.apply(this, arguments);
  };
  return result;
});

// ==UserScript==
// @name        Quick episode switch
// @namespace   Dark Hole's Scripts
// @match       https://smotret-anime.net/*
// @match       https://anime365.ru/*
// @match       https://anime-365.ru/*
// @match       https://hentai365.ru/*
// @grant       none
// @version     0.1.5
// @author      Dark Hole
// @description Add input in title for quick episode switching. Useful when you need to skip a lot of episodes (e.g. 100 -> 150). For use just change number and press enter or remove focus from field.
// ==/UserScript==

// When dynamically load page can be unblur + enter.
var ignoreUnblur = false;

// For quick exit
function createInput() {
  var parsedPath = window.location.pathname.match(/^\/catalog\/.+?-(\d+)\/.*?(\d+)-.+-(\d+)\/[^\/]+-(\d+)$/);
  if(!parsedPath) return;
  var animeId = parsedPath[1];
  var episode = parsedPath[2];
  var episodeId = parsedPath[3];
  var translationId = parsedPath[4];
  console.log(animeId, episode, episodeId);

  var heading = document.querySelector('.m-translation-view-title > h2');
  if(!heading) return;

  var input = document.createElement('input');
  input.value = episode;
  input.style.width = '2.5em';

  function gotoEpisode() {
    var ep = Number(input.value);
    if(!isFinite(ep)) {
      return;
    }
    if(ep == episode) {
      return;
    }
    var req = new XMLHttpRequest();
    req.addEventListener("load", function(e) {
      var res = JSON.parse(this.responseText);
      if(!('data' in res && Array.isArray(res.data.episodes))) {
        return;
      }
      var episodes = res.data.episodes;
      for(var i = 0; i < episodes.length; i++) {
        if(episodes[i].episodeInt == ep) {
          dynChangeUrlManually('../' + ep + '-seriya-' + episodes[i].id);
          break;
        }
      };
    });
    req.open("GET", '/api/series/?id=' + animeId + '&fields=episodes');
    req.send();
  }
  input.addEventListener('keydown', function(e) {
    if(e.key == 'Enter') {
      e.stopPropagation();
      gotoEpisode();
    }
  });
  input.addEventListener('blur', function(e) {
    if(!ignoreUnblur) gotoEpisode();
  });

  heading.innerText = '';
  heading.append(input);
  heading.append(' серия');
}

var dynPageLoadSuccess = window.dynPageLoadSuccess;
window.dynPageLoadSuccess = function() {
  ignoreUnblur = true;
  var res = dynPageLoadSuccess.apply(this, arguments);
  ignoreUnblur = false;
  createInput();
  return res;
}

createInput();

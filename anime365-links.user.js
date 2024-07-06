// ==UserScript==
// @name        Anime365 Link
// @namespace   Dark Hole's Scripts
// @match       https://shikimori.one/*
// @connect     smotret-anime.com
// @grant       GM_xmlhttpRequest
// @version     0.1.2
// @author      Dark Hole
// @description Add link to Anime365 to Shikimori under poster
// ==/UserScript==

var regexParser = /^https:\/\/shikimori\.(?:one|me)\/animes\/(\d+)[^\/]*$/;

function tryInsertButton(url) {
  var match = url.match(regexParser);
  if (!match) {
    return;
  }
  var id = match[1];

  var poster = document.getElementsByClassName('c-image')[0];
  if(!poster) {
    return;
  }
  if (poster.getElementsByClassName('anime365-link').length > 0) {
    return;
  }

  GM_xmlhttpRequest({
    url: 'https://smotret-anime.com/api/series/?myAnimeListId=' + id,
    method: 'GET',
    responseType: 'json',
    onload: function(res) {
      if (res.response.data.length <= 0) {
        return;
      }

      var btn = document.createElement('a');
      btn.className = "b-link_button anime365-link";
      btn.text = 'Anime365';
      btn.href = res.response.data[0].url;
      poster.appendChild(btn);
    }
  });
}

document.addEventListener('turbolinks:load', function(e) {
  tryInsertButton(e.data.url);
});

// ==UserScript==
// @name        Block365
// @namespace   Dark Hole's Scripts
// @match       https://smotret-anime.org/*
// @match       https://anime365.ru/*
// @match       https://anime-365.ru/*
// @match       https://hentai365.ru/*
// @match       https://smotret-anime.online/*
// @match       https://smotret-anime.com/*
// @match       https://smotret-anime.app/*
// @grant       GM_getValue
// @grant       GM_setValue
// @version     0.1.3
// @author      Dark Hole
// @description Hide user's comments on site
// ==/UserScript==

function hideUserComments() {
  var parsedPath = window.location.pathname.match(/^(\/comments|\/catalog\/[^\/]+\/[^\/]+\/[^\/]+|\/catalog\/[^\/]+)$/);
  if(!parsedPath) return;

  var blockList = GM_getValue("blockList", {});
  var comments = document.getElementsByClassName("m-comment");

  for(var i = 0; i < comments.length; i++) {
    var name = comments[i].querySelector(".m-comment-author-name > a");
    if(!name) {
      continue;
    }
    var parsedName = name.href.match(/\/users\/(\d+)$/);
    if(!parsedName) {
      continue;
    }
    var id = parsedName[1];

    if(blockList[id]) {
      comments[i].style.display = "none";
    }
  }
}

function addBanButton() {
  var parsedPath = window.location.pathname.match(/^\/users\/(\d+).*$/);
  if(!parsedPath) return;

  var id = parseInt(parsedPath[1]);
  var blockList = GM_getValue("blockList", {});

  var element = document.querySelector(".card ul.no-margin-bottom");
  if(!element) return;

  var btn = document.createElement('li');
  var link = document.createElement('a');
  link.innerText = blockList[id] ? 'Разблокировать' : 'Заблокировать';
  link.href = "#";

  link.addEventListener('click', function(e) {
    e.preventDefault();
    blockList[id] = !blockList[id];
    GM_setValue("blockList", blockList);
    link.innerText = blockList[id] ? 'Разблокировать' : 'Заблокировать';
    console.log("Blocked %i %s", id, blockList[id]);
  });

  btn.appendChild(link);
  element.appendChild(btn);
}

function create(tagName, className, text) {
  var el = document.createElement(tagName);
  if(className) {
    el.className = className;
  }
  if(text) {
    el.innerText = text;
  }
  return el;
}

function createMainComment(poster, link, ru, romaji, name, date) {
  // <div class="col s12 m6 l4">
  //   <div class="m-new-episode collection-item avatar">
  //     <div class="circle" style="background-image: url('/posters/36014.29824111254.140x140.1.jpg');"></div>
  //     <h5 class="line-1">
  //       <a target="_blank" rel="nofollow" href="/catalog/tsue-to-tsurugi-no-wistoria-36014/2-seriya-340355#comments">
  //         <span class="online-h">Обсуждение </span> Меч и жезл Вистории
  //       </a>
  //     </h5>
  //     <h6 class="line-2">
  //       <a target="_blank" rel="nofollow" href="/catalog/tsue-to-tsurugi-no-wistoria-36014/2-seriya-340355#comments">
  //         <span class="online-h">Обсуждение </span> Tsue to Tsurugi no Wistoria
  //       </a>
  //     </h6>
  //     <span class="title">Ruiz_Kawa сегодня 15:26</span>
  //   </div>
  // </div>

  function p(n) {
    if(n >= 10) {
      return n.toString();
    }
    return "0" + n.toString();
  }

  var year = date.getFullYear();
  if(year >= 2000) year -= 2000;
  var fulldate = p(date.getDate()) + "." + p(date.getMonth() + 1) + "." + p(year);
  var time = p(date.getHours()) + ":" + p(date.getMinutes());
  var nameAndDate = fulldate + " " + time;
  var dayDur = 24 * 60 * 60 * 1000;
  var today = new Date();
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if(today.getFullYear() == date.getFullYear() && today.getMonth() == date.getMonth() && today.getDate() == date.getDate()) {
    nameAndDate = "сегодня " + time;
  } else if(yesterday.getFullYear() == date.getFullYear() && yesterday.getMonth() == date.getMonth() && yesterday.getDate() == date.getDate()) {
    nameAndDate = "вчера " + time;
  }

  nameAndDate = name + " " + nameAndDate;

  var row = create("div", "col s12 m6 l4");
  var newEpisode = create("div", "m-new-episode collection-item avatar");
  var avatar = create("div", "circle");
  avatar.style.backgroundImage = "url('" + poster + "')";
  var line1 = create("h5", "line-1");
  var linkEl1 = create("a");
  linkEl1.target = "_blank";
  linkEl1.rel = "nofollow";
  linkEl1.href = link;
  var span1 = create("span", "online-h", "Обсуждение ");
  var text1 = document.createTextNode(" " + ru);
  var line2 = create("h6", "line-2");
  var linkEl2 = create("a");
  linkEl2.target = "_blank";
  linkEl2.rel = "nofollow";
  linkEl2.href = link;
  var span2 = create("span", "online-h", "Обсуждение ");
  var text2 = document.createTextNode(" " + romaji);
  var title = create("span", "title", nameAndDate);

  linkEl1.appendChild(span1);
  linkEl1.appendChild(text1);
  line1.appendChild(linkEl1);
  linkEl2.appendChild(span2);
  linkEl2.appendChild(text2);
  line2.appendChild(linkEl2);
  newEpisode.appendChild(avatar);
  newEpisode.appendChild(line1);
  newEpisode.appendChild(line2);
  newEpisode.appendChild(title);
  row.appendChild(newEpisode);

  return row;
}

function parseDate(s) {
  var t = s.split(" ");
  var date = t[0].split(".");
  var time = t[1].split(":");
  return new Date(
    Number(date[2]) + 2000,
    Number(date[1]) - 1,
    Number(date[0]),
    Number(time[0]),
    Number(time[1])
  );
}

function getRequest(url, cb) {
  var req = new XMLHttpRequest();
  req.addEventListener("load", cb);
  req.open("GET", url);
  req.send();
}

function getCommentsPage(num, cb) {
  getRequest("/comments/index?ajax=yw0&comments-page=" + num, function() {
    var parser = new DOMParser();
    var dom = parser.parseFromString(this.responseText, "text/html");
    cb.call(this, dom);
  });
}

function getJSONRequest(url, cb) {
  getRequest(url, function() {
    var data = JSON.parse(this.responseText);
    cb.call(this, data);
  });
}

function getEpisodeInfo(episodeId, cb) {
  getJSONRequest("/api/episodes/" + episodeId, cb);
}

function getSeriesInfo(seriesId, cb) {
  getJSONRequest("/api/series/" + seriesId, cb);
}

function hideMainUserComments() {
  if(window.location.pathname != '/') {
    return;
  }

  getCommentsPage(1, function(dom) {
    var comments = dom.getElementsByClassName("m-comment");

    var newItems = document.createElement("div");
    newItems.className = "items";
    var recent = document.querySelector("#m-index-recent-comments > .items");
    recent.replaceWith(newItems);

    var arr = [];
    var k = 0;
    for(var i = 0; i < comments.length && k < 6; i++) void (function() {
      var name = comments[i].querySelector(".m-comment-author-name > a");
      if(!name) {
        return;
      }
      var parsedName = name.href.match(/\/users\/(\d+)$/);
      if(!parsedName) {
        return;
      }
      var userId = parsedName[1];
      var blockList = GM_getValue("blockList", {});

      if(blockList[userId]) {
        return;
      }

      var link = comments[i].querySelector(".m-comment-episode > a").href;
      var parsedLink = link.match(/\/episodes\/(\d+)#comments$|\/catalog\/[^\/]+?(\d+)#comments$/);
      var episodeId = parsedLink[1];
      var seriesId = parsedLink[2];
      var nameText = name.innerText;
      var date = parseDate(comments[i].querySelector(".m-comment-date").innerText);

      var poster, ru, romaji;

      var then = function(data) {
        ru = data.data.titleLines[0];
        romaji = data.data.titleLines[1];
        poster = data.data.posterUrl.replace(/\.[^\.]+$/, ".140x140.1$&");

        arr.push({
          comment: createMainComment(
            poster,
            link,
            ru,
            romaji,
            nameText,
            date
          ),
          date
        });
        k--;

        if(k == 0) {
          console.log("Ready");
          console.log(arr);
          arr.sort((a, b) => b.date - a.date);
          for(var i = 0; i < arr.length; i++) {
            newItems.appendChild(arr[i].comment);
          }
        }
      };

      k++;

      if(episodeId) {
        getEpisodeInfo(episodeId, function(data) {
          seriesId = data.data.seriesId;
          getSeriesInfo(data.data.seriesId, then);
        });
      } else {
        getSeriesInfo(seriesId, then);
      }
    })();
  });
}

var dynPageLoadSuccess = unsafeWindow.dynPageLoadSuccess;
unsafeWindow.dynPageLoadSuccess = function() {
  var res = dynPageLoadSuccess.apply(this, arguments);
  hideUserComments();
  addBanButton();
  return res;
}

hideUserComments();
addBanButton();
hideMainUserComments();

unsafeWindow.listViewPreprocessAjaxPageLoadData = function(id, dataList, options, page) {
  var blockList = GM_getValue("blockList", {});
  for(var i = 0; i < dataList.length; i++) {
    var comments = dataList[i].getElementsByClassName("m-comment");
    console.log(comments);

    for(var i = 0; i < comments.length; i++) {
      var name = comments[i].querySelector(".m-comment-author-name > a");
      if(!name) {
        continue;
      }
      var parsedName = name.href.match(/\/users\/(\d+)$/);
      if(!parsedName) {
        continue;
      }
      var id = parsedName[1];

      if(blockList[id]) {
        comments[i].style.display = "none";
      }
    }
  }
}

// ==UserScript==
// @name        Random Misaka background
// @namespace   Dark Hole's Scripts
// @match       https://smotret-anime.net/*
// @match       https://anime365.ru/*
// @match       https://anime-365.ru/*
// @grant       GM_getResourceURL
// @noframes
// @version     0.1.2
// @author      Dark Hole
// @description Set Anime365 background with Misaka. Taken from official website.
// @resource    bg https://files.catbox.moe/0l8a1j.jpg
// ==/UserScript==


var imgSizeX = 400;
var imgSizeY = 225;
var colspanPc = 5;
var colspanSp = 3;
var switchSize = 900;

var img = null;
var screen = null;
var canvas = document.createElement('canvas');
canvas.classList.add('full-background');
canvas.style.height = 'auto';
canvas.style.background = 'white';
document.getElementsByClassName('full-background')[0].replaceWith(canvas);

function drawCanvas(img) {
  if (!canvas ||
    !canvas.getContext) {
    return;
  }

  var wW = window.innerWidth;
  if (wW > switchSize) {
    if (screen !== 'wide') {
      colspan = colspanPc;
      screen = 'wide';
    } else {
      return;
    }
  } else {
    if (screen !== 'narrow') {
      colspan = colspanSp;
      screen = 'narrow';
    } else {
      return;
    }
  }

  var maxCnt = img.height / imgSizeY;

  var ctx = canvas.getContext('2d');
  canvas.width = imgSizeX * colspan;
  canvas.height = imgSizeY * Math.ceil(maxCnt / colspan);

  var imgList = new Array();
  for (var i = 0; i < maxCnt; i++) {
    imgList[i] = i;
  }
  for (var i = maxCnt - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * maxCnt);
    var tmp = imgList[i];
    imgList[i] = imgList[j];
    imgList[j] = tmp;
  }
  for (var i = 0; i < maxCnt; i++) {
    var x = i % colspan;
    var y = Math.floor(i / colspan);
    ctx.drawImage(img, 0, imgList[i] * imgSizeY, imgSizeX, imgSizeY, x * imgSizeX, y * imgSizeY, imgSizeX, imgSizeY);
  }
};

var bgImage = new Image();
bgImage.src = GM_getResourceURL('bg');

bgImage.addEventListener('load', function() {
  window.addEventListener('resize', function() {
    drawCanvas(bgImage);
  });
  drawCanvas(bgImage);
});

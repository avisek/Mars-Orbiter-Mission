import { SmoothScroll } from "./SmoothScroll.js";

new SmoothScroll(document.querySelector('.SmoothScroll'))

function log(txt) {
  document.querySelector('.Log').innerText = txt
}

document.documentElement.addEventListener('click', e => document.documentElement.requestFullscreen())

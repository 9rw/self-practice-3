import * as app from "./api.js";
import {getElementById} from "./utils/getElementById.js"

function init(){
  const btnGroupElm = getElementById("btn-group");
  if (! btnGroupElm) return;
  getElementById("getUser", btnGroupElm).addEventListener("click", app.getUsers);
  getElementById("getUserById", btnGroupElm).addEventListener("click", app.getUser1);
  getElementById("createPost", btnGroupElm).addEventListener("click", app.createPost);
  getElementById("updatePost", btnGroupElm).addEventListener("click", app.updatePost);
  getElementById("deletePost", btnGroupElm).addEventListener("click", app.deletePost);
}

window.document.addEventListener("DOMContentLoaded", ()=> {
  init();
})

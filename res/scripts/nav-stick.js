window.onscroll = function () { navStick() };

var navbar = document.getElementsByTagName("nav")[0];
var sticky = navbar.offsetTop;
var nav_spacer = document.getElementById("nav-spacer");

function navStick() {
    if (window.scrollY >= sticky) {
        navbar.style.position = "fixed";
        navbar.style.top = "0";
        navbar.style.width = "100%";
        navbar.style.zIndex = "1000";
        nav_spacer.style.display = "block";
        nav_spacer.style.height = navbar.offsetHeight + "px";
    } else {
        navbar.style.position = "relative";
        nav_spacer.style.display = "none";
    }
}
navbar.style.position = "fixed";
navbar.style.top = "0";
navbar.style.width = "100%";
navbar.style.zIndex = "1000";
nav_spacer.style.display = "block";
nav_spacer.style.height = navbar.offsetHeight + "px";
window.setTimeout(navStick, 10);
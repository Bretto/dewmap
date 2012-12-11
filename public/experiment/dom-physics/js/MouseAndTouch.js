/* 
   MouseAndTouch by PÃ¥l Smitt-Amundsen 
   http://paal.org/blog
*/

function MouseAndTouch(dom, down, up, move) {
   var canvas = dom;
   var mouseX, mouseY, startX, startY;
   var isDown = false;


   canvas.addEventListener("mousedown", mouseDownHandler, true);
   canvas.addEventListener("touchstart", touchDownHandler, true);

   //When drawing the "road" get mouse or touch positions
   function mouseMoveHandler(e) {
      updateFromEvent(e);
      move(mouseX, mouseY);
   }

   function updateFromEvent(e) {
      e.preventDefault();
      var touch = e.originalEvent;
      if (touch && touch.touches && touch.touches.length == 1) {
         //Prevent the default action for the touch event; scrolling
         touch.preventDefault();
         mouseX = touch.touches[0].pageX;
         mouseY = touch.touches[0].pageY;
      } else {
         mouseX = e.pageX;
         mouseY = e.pageY;
      }
   }

   function mouseUpHandler(e) {
      canvas.addEventListener("mousedown", mouseDownHandler, true);
      canvas.removeEventListener("mousemove", mouseMoveHandler, true);
      isDown = false;
      updateFromEvent(e);
      up(mouseX, mouseY);
   }

   function touchUpHandler(e) {
      canvas.addEventListener("touchstart", touchDownHandler, true);
      canvas.removeEventListener("touchmove", mouseMoveHandler, true);
      isDown = false;
      updateFromEvent(e);
      up(mouseX, mouseY);
   }

   function mouseDownHandler(e) {
      canvas.removeEventListener("mousedown", mouseDownHandler, true);
      canvas.addEventListener("mouseup", mouseUpHandler, true);
      canvas.addEventListener("mousemove", mouseMoveHandler, true);
      isDown = true;
      updateFromEvent(e);
      down(mouseX, mouseY);
   }

   function touchDownHandler(e) {
      canvas.removeEventListener("touchstart", touchDownHandler, true);
      canvas.addEventListener("touchend", touchUpHandler, true);
      canvas.addEventListener("touchmove", mouseMoveHandler, true);
      isDown = true;
      updateFromEvent(e);
      down(mouseX, mouseY);
   }

   var ret = {};
   ret.mouseX = function () {
      return mouseX;
   }
   ret.mouseY = function () {
      return mouseY;
   }
   ret.isDown = function () {
      return isDown
   }

   return ret;
}
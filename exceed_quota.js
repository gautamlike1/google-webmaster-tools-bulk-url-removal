$(document).ready(() => {
  var port = chrome.runtime.connect({name: "chillOutPort"});

  port.onMessage.addListener((msg) => {
    if(msg.type == 'doReload') {
      window.location.href = msg.url;
    }
  });

  var $countDownTimer = $("<p id='countDown'>timer goes here</p>");
  $("body").append($countDownTimer);

  var interval = 1000;
  var finalTime = 1000*60*3;
  var timeSoFar = 0;

  var timerId = setInterval(() => {
    if (timeSoFar < finalTime) {
      console.log("ticking away : " + timeSoFar);
      timeSoFar += interval;
      $("#countDown").text("Bulk URL Removal will retry in " + ((finalTime-timeSoFar)/1000) + " seconds");
    } else {
      clearInterval(timerId);
      // trigger reload of initUrl
      port.postMessage({
        'type': 'reload'
      });
    }
  }, interval);

});

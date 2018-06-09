$(document).ready(function(){
  var $fileInput = $("<input id='fileInput' type='file' />");
  var $dropdown = $("<select id='removalmethod'><option value='PAGE' selected>Remove page from search results and cache</option><option value='PAGE_CACHE'>Remove page from cache only</option><option value='DIRECTORY'>Remove directory</option></select>");
  $("#create-removal_button").append($dropdown);
  $("#create-removal_button").append($fileInput);

  var port = chrome.runtime.connect({name: "victimPort"});

  port.onMessage.addListener(function(msg) {
    if(msg.type === 'removeUrl') {
      var victim = msg.victim;
      console.log("about to remove: " + victim);
      // delete
      $("input[name='urlt']").attr('value', victim);
      $("input[name='urlt.submitButton']").trigger("click");
    } else if (msg.type === 'doReload') {
      window.location.href = msg.initUrl;
    }
  });


  $fileInput.change(function() {
    $.each(this.files, function(i, f) {
      var reader = new FileReader();
      reader.onload = (function(e) {
        var rawTxt = e.target.result;
        var victimArry = rawTxt.split('\n');
        var removalMethod = $('#removalmethod').val();
        port.postMessage({
          'type': 'initVictims',
          'removalMethod': removalMethod,
          'rawTxt': rawTxt,
          'initUrl': window.location.href
        });
      });
      reader.readAsText(f);
    });
  });


  // If exceed quota limit wait 3 minutes and go again. Also, show a verbiage to let the user know that it's waiting. Perhaps a count down clock.
  // https://www.google.com/webmasters/tools/removals-create-ac?authuser=3
  setTimeout(() => {
    var exceedQuotaMsg = $("body").text().trim();
    if (exceedQuotaMsg == "You have exceeded your quota limit!") {
      var $countDownTimer = $("<p id='countDown'></p>");
      $("body").append($countDownTimer);

      var interval = 1000;
      var finalTime = 1000*60*3;
      var timeSoFar = 0;

      var timerId = setInterval(() => {
        if (timeSoFar < finalTime) {
          timeSoFar += interval;
          $("#countdown").text("Bulk URL removal will retry in " + ((finalTime-timeSoFar)/1000) + " seconds");
        } else {
          clearInterval(timerId);
          // trigger reload of initUrl
          port.postMessage({
            'type': 'reload'
          });
        }
      }, interval);
    } else {
      port.postMessage({
        'type': 'nextVictim'
      });
    }
  }, 1000);
});

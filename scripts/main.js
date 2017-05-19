$(document).ready(function () {
var countMePoints = 0;
var countYouPoint = 0;
var consume = "";
var currQ = 0;

$(".queOptions").click(function () {
  var _thePQ = ($(this).parent());
  if ($(this).hasClass("correct"))
  {
    $(this).addClass("right");
    setTimeout(function () {
    countMePoints+=1; }, 100);
    $('#mePoints').text(countMePoints);
  }
  else
  {
    $(this).addClass("wrong");
    setTimeout(function () {
        ($(this).parent()).find('.queOptions .correct').addClass("notRight");
      countYouPoint+=1; }, 50);

      $('#youPoints').text(countYouPoint);
  }

<<<<<<< Updated upstream
  $('#mePoints').text(countMePoints);
  $('#youPoints').text(countYouPoint);
  $('#laTimer').text('0');
=======

>>>>>>> Stashed changes



//get next question
  currQ = ($(this).parent()).index();
  currQ+=1;


//chack ans
setInterval(function () {
  $(".question").addClass("hidden");

  $(".question[data-id|=" + currQ + "]").removeClass("hidden");
}, 700);
//show feedback


//chack win

    });

});

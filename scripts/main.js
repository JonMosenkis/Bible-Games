$(document).ready(function () {
var countMePoints = 0;
var countYouPoint = 0;
var consume = "";
var currQ = 0;

$(".queOptions").click(function () {
  if ($(this).hasClass("correct"))
  {
    $(this).addClass("right");
    setTimeout(function () {
    countMePoints+=1; }, 1000);
  }
  else
  {
    $(this).addClass("wrong");
    setTimeout(function () {
      countYouPoint+=1; }, 1000);
  }

  $('#mePoints').text(countMePoints);
  $('#youPoints').text(countYouPoint);
  $('#laTimer').text('0');



//get next question
  currQ = ($(this).parent()).index();
  currQ+=1;

//chack ans
setInterval(function () {
  $(".question").addClass("hidden");
  $(".question[data-id|=" + currQ + "]").removeClass("hidden");
}, 1000);
//show feedback


//chack win

    });

});

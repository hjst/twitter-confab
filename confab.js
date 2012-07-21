// bind the tweet loader to the button when the document is complete
$(document).ready( function() {
  $('#confabulation').submit(function() {
    var tweet_input = $(this).children('input#contweet').val();
    alert(tweet_input);
    return false;
  })
});

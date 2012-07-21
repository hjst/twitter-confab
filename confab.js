// common ajax config
$.ajaxSetup({
  dataType: 'jsonp',
  timeout: 10000
});

var displayError = function(jqXHR, status, errorText){
  if (status !== 'timeout') {
    // we got an error of some sort, with JSONP it's usually not possible
    // to know what exactly, we just get the timeout - so if we get something
    // else we should log it
    console.log(jqXHR, status, errorText);
  }
  $('#rendered-tweets').prepend(
    '<p class="error">'+
      '<strong>Twitter Error</strong><br>'+
      'Are you sure the tweet reference is correct? '+
      'Maybe wait a few seconds and try again?'+
    '</p>'
  );
};

var loadConfabulatedTweets = function(tweet, tweetReqStatus) {
  console.log('tweet: ', tweet);
  // get the oembed details for the tweet
  $.ajax({
    url:'http://api.twitter.com/1/statuses/oembed.json?'+
      'id='+tweet.id_str+
      'omit_script=1'+
      '&hide_thread=1',
    success: function(embed, embedReqStatus) {
      $('#rendered-tweets').prepend(embed.html);
      // if this tweet is in reply to another - act on that as well
      if (tweet.in_reply_to_status_id_str) {
        $.ajax({
          url:'http://api.twitter.com/1/statuses/show/'+
            tweet.in_reply_to_status_id_str+'.json?'+
            'trim_user=1',
          success: loadConfabulatedTweets
        });
      }
    }
  });
};

// bind the loader to the form
$(document).ready( function() {
  $('#confabulation').submit(function() {
    $('#rendered-tweets').empty(); // clear old tweets
    var tweet_input = $(this).children('input#contweet').val();
    var matches = tweet_input.match(/(\d+)/g);
    if (matches) {
      // use the last number in the URL/input, which should be the id
      var initial_tweet_id = matches[matches.length-1];

      $.ajax({
        url:'http://api.twitter.com/1/statuses/show/'+initial_tweet_id+'.json?trim_user=1',
        error: displayError,
        success: loadConfabulatedTweets
      });
      
      window.location.hash = '#'+initial_tweet_id;
    } else {
      // input didn't contain a number
      $('#rendered-tweets').prepend(
        '<p class="error">Please enter a tweet id (long number) or a tweet URL.</p>'
      );
    }
    return false;
  });
  // see if there is already an #id in the URL
  if (window.location.hash) {
    $('#contweet').val(window.location.hash.substr(1));
    $('#confabulation').submit();
  }
});

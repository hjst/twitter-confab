var loadConfabulatedTweets = function(tweet, tweetReqStatus) {
  console.log(tweet.id_str, ': ', tweet.text);

  // get the oembed details for the tweet
  $.ajax({
    url:'http://api.twitter.com/1/statuses/oembed.json?'+
      'id='+tweet.id_str+
      '&hide_thread=1',
    dataType: 'jsonp',
    error: function(){},
    success: function(embed, embedReqStatus) {
      console.log(embed);
      $('#confabulation').after(embed.html);
      // if this tweet is in reply to another - act on that as well
      if (tweet.in_reply_to_status_id_str) {
        $.ajax({
          url:'http://api.twitter.com/1/statuses/show/'+
            tweet.in_reply_to_status_id_str+'.json?'+
            'trim_user=1',
          dataType: 'jsonp',
          error: function(){},
          success: loadConfabulatedTweets
        });
      }
    }
  });
};

// bind the tweet loader to the button when the document is complete
$(document).ready( function() {
  $('#confabulation').submit(function() {
    var tweet_input = $(this).children('input#contweet').val();
    var matches = tweet_input.match(/(\d+)/g);
    // use the last number in the URL/input, which should be the id
    var initial_tweet_id = matches[matches.length-1];

    $.ajax({
      url:'http://api.twitter.com/1/statuses/show/'+initial_tweet_id+'.json?trim_user=1',
      dataType: 'jsonp',
      error: function(){},
      success: loadConfabulatedTweets
    });

    return false;
  });
});

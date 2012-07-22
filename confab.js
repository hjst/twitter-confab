// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());

// common ajax config
$.ajaxSetup({
  dataType: 'jsonp',
  timeout: 10000
});

var oembed_list = []; // array: oEmbed objects for each tweet

var displayError = function(){
  $('#rendered-tweets').prepend(
    '<p class="error">'+
      '<strong>Twitter Error</strong><br>'+
      'Are you sure the tweet reference is correct? '+
      'Maybe wait a few seconds and try again? '+
      'You may have requested a private tweet.'+
    '</p>'
  );
  // we're finished, so reset the button
  $('#constatus').html('');
  $('#confabulation').children(':submit')
    .val('Confabulate')
    .removeAttr('disabled');
};

var getTweet = function(tweet, tweetReqStatus) {
  console.log('getTweet ', tweet.id_str, ': ', tweet);

  // get the oembed details for the tweet
  $.ajax({
    url:'http://api.twitter.com/1/statuses/oembed.json?'+
      'id='+tweet.id_str+
      'omit_script=1'+
      '&hide_thread=1',
    error: displayError,
    success: function(embed, embedReqStatus) {
      console.log('embed author: ', embed.author_name, ' - ', embed);
      embed.created_at = tweet.created_at;
      console.log('oembed_list.push(', embed.created_at, '): ', oembed_list.push(embed));
      console.log('oembed_list contents currently (',oembed_list.length, '): ', oembed_list);
      $('#concount').html(oembed_list.length);
      //$('#rendered-tweets').prepend(embed.html);
      // if this tweet is in reply to another - act on that as well
      if (tweet.in_reply_to_status_id_str) {
        $.ajax({
          url:'http://api.twitter.com/1/statuses/show/'+
          tweet.in_reply_to_status_id_str+'.json?'+
            'trim_user=1',
          error: displayError,
          success: getTweet
        });
      } else {
        // no more replies to follow, stop recursing
        console.log('finished recursive calls, oembed_list = ',oembed_list);
        processEmbedData(oembed_list);
      }
    }
  });
};

function getConversation(tweet) {
  // INPUT: single tweet object, as returned by Twitter get/status API
  // RESULT: builds javascript array of all tweet objects in the conversation
  //         and passes it on to getEmbedCodes()
  console.log('getConversation(tweet) ,', tweet);
  $('#constatus').html('Found: <span id="concount">1</span>');

  var conversation = [];

  var recursiveTweetFetch = function(tweet) {

    if (tweet.in_reply_to_status_id_str) {
      // tweet has parent - recursively call the function again
      console.log('recursiveTweetFetch recursing push ',conversation.push(tweet));
      $.ajax({
        url:'http://api.twitter.com/1/statuses/show/'+
          tweet.in_reply_to_status_id_str+'.json?'+
          'trim_user=1',
        error: displayError,
        success: recursiveTweetFetch
      });
    } else {
      // this is the last (first?) tweet in the conversation
      console.log('recursiveTweetFetch termination push ',conversation.push(tweet));
      getEmbedCodes(conversation);
    }
    $('#concount').html(conversation.length); // every time we loop we can add one
  };

  recursiveTweetFetch(tweet);
}

function getEmbedCodes(conversation) {
  console.log('getEmbedCodes: ', conversation);
  $('#constatus').html('Fetching data: <span id="concount">'+conversation.length+'</span>');
  var embed_codes = [];

  var recursiveEmbedFetch = function(tweet) {

    console.log('conversation.length: ', conversation.length);
    if (conversation.length > 0) {
      $.ajax({
        url:'http://api.twitter.com/1/statuses/oembed.json?'+
          'id='+tweet.id_str+
          'omit_script=1'+
          '&hide_thread=1',
        error: displayError,
        success: function(embed) {
          console.log('recursiveEmbedFetch recursing push ', embed_codes.push(embed));
          // pop the next tweet object and recurse
          recursiveEmbedFetch(conversation.pop());
          $('#concount').html(conversation.length);
        }
      });
    } else {
      // no more conversation tweets to handle, so pass embed_codes for processing
      $.ajax({
        url:'http://api.twitter.com/1/statuses/oembed.json?'+
          'id='+tweet.id_str+
          'omit_script=1'+
          '&hide_thread=1',
        error: displayError,
        success: function(embed) {
          console.log('recursiveEmbedFetch termination push ', embed_codes.push(embed));
          processEmbedData(embed_codes);
        }
      });
    }
  };

  // pop the first conversation tweet and start processing
  recursiveEmbedFetch(conversation.pop());
}

function processEmbedData(embeds) {
  // sort the list into reverse date order: most recent at the front of the array
  $('#constatus').html('Sorting...');
  console.log('processEmbedData called with ', embeds);
  embeds.sort(function(a, b) {
    a_created_at = new Date(a.created_at); 
    b_created_at = new Date(b.created_at); 
    if (a_created_at < b_created_at) {
      return -1;
    } else if (a_created_at > b_created_at) {
      return 1;
    } else {
      return 0;
    }
  });
  console.log('sorted: ',embeds);

  // render the embeds
  $('#constatus').html('Rendering...');
  $.each(embeds, function(index, embed) {
    $('#rendered-tweets').append(embed.html);
  });

  // we're finished, so reset the button
  $('#constatus').html('');
  $('#confabulation').children(':submit')
    .val('Confabulate')
    .removeAttr('disabled');
}

// bind the loader to the form
$(document).ready( function() {

  $('form#confabulation').submit(function() {

    // clear any old tweets before loading new ones
    $('#rendered-tweets').slideUp( 400, function() {
      $(this).empty().slideDown();
    });
    
    var tweet_input = $(this).children('input#contweet').val();
    var matches = tweet_input.match(/(\d+)/g);

    if (matches) {
      
      // use the last match in the URL/input, which should be the id
      var initial_tweet_id = matches[matches.length-1];

      // disable the button while we fetch stuff
      $(this).children(':submit')
        .val('Confabulating...')
        .attr('disabled', true);
      $('#constatus').html('Searching for '+initial_tweet_id);

      // initial AJAX call to get the ball rolling
      $.ajax({
        url:'http://api.twitter.com/1/statuses/show/'+initial_tweet_id+'.json?trim_user=1',
        error: displayError,
        success: getConversation
      });
      
      // stash the tweet id in the URL, in case the user wants to share the link
      window.location.hash = '#'+initial_tweet_id;

    } else {

      // input didn't contain a number
      $('#rendered-tweets').prepend(
        '<p class="error">Please enter a tweet id (long number) or a tweet URL.</p>'
      );

    }
    // returning false prevents the form being submitted
    return false;

  });
  // see if there is already an #id in the URL
  if (window.location.hash) {
    // there is, so populate the form and submit automatically
    $('#contweet').val(window.location.hash.substr(1));
    $('#confabulation').submit();
  }
});

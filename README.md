Twitter Confab: a tool for displaying a complete conversation on Twitter,
without requiring authentication.

Input a Tweet ID or URL (which should end with a long number) and Confab will
load every preceding tweet it can find and display them in time order (earliest
tweet first) using Twitter's own embedding mechanism.

Advantages:

* Completely client-side, none of your information (tweets, username, whatever)
  is stored anywhere
* Does not require you to authorise an app with Twitter, or log in anywhere
* Uses Twitter's own tweet embedding mechanism, so you can link/retweet/reply
  as usual

Limitations:

* Cannot follow a conversation with more than 2 participants: each tweet can be
  in reply to only zero or one other tweets
* Cannot find future tweets - so please use the last (most recent) tweet as
  input

Makes use of:

* [Skeleton][https://github.com/dhgamache/Skeleton]
* [jQuery][https://github.com/jquery/jquery]
* Twitter API: [GET statuses/show/:id][https://dev.twitter.com/docs/api/1/get/statuses/show/:id]
* Twitter API: [GET statuses/oembed][https://dev.twitter.com/docs/api/1/get/statuses/oembed]

Twitter Confab: a tool for displaying a complete conversation on Twitter,
without requiring authentication.

Input a Tweet ID or URL (which should end with a long number) and Confab will
load every preceding tweet it can find and display them in time order (earliest
tweet first) using Twitter's own embedding mechanism.

Advantages:

* Completely client-side, none of your information (tweets, username, whatever)
  is stored anywhere, so it's tinfoil hat friendly
* Does not require you to authorise an app with Twitter, or log in anywhere
* Uses Twitter's own tweet embedding mechanism, so you can link/retweet/reply
  as usual

Limitations:

* Can only operate on public tweets
* Can only follow a thread if the `in_reply_to` metadata is present, which it
  will be so long as everyone was using the reply button in their Twitter client
* Cannot follow a conversation with more than 2 participants: each tweet can be
  in reply to only zero or one other tweets
* Cannot find future tweets - so please use the last (most recent) tweet as
  the starting point

In addition to these limitations, sometimes Twitter returns an error for no
discernable reason. If it doesn't work the first time, wait a few seconds and
try again.

All that said, it usually works fine.

Makes use of:

* Twitter API: [GET statuses/show/:id](https://dev.twitter.com/docs/api/1/get/statuses/show/:id)
* Twitter API: [GET statuses/oembed](https://dev.twitter.com/docs/api/1/get/statuses/oembed)
* [jQuery](https://github.com/jquery/jquery)
* [Skeleton](https://github.com/dhgamache/Skeleton)

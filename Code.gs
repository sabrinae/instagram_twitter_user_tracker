function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('FALEN SOCIAL DATA')
    .addItem('Falen IG Data', 'showSidebar')
    .addToUi();
}

var ss = SpreadsheetApp.getActiveSpreadsheet();
var falenIGSheet = ss.getSheetByName('Latest Posts - Falen IG');
var twSheet = ss.getSheetByName('Latest Tweets - Falen TW');

function getFalenIGData() {
  var instagramService = getInstagramService();
  var access_token = instagramService.getAccessToken();
  
  var params = {
    headers: {
      Authorization: 'Bearer ' + access_token
    },
    muteHttpExceptions: true
  }

  var baseUrl = 'https://graph.facebook.com/v4.0/17841400815527210'; //id is associated with cuneo's IG ID
  var endpoint = '?fields=business_discovery.username(falenkdwb)%7Bfollowers_count%2Cmedia_count%2Cbiography%2Cusername%2Cwebsite%2Cmedia%7Blike_count%2Ccomments_count%2Ccaption%2Cmedia_url%2Ctimestamp%7D%7D&access_token=';
  
  var fullURL = baseUrl + endpoint;

  var response = UrlFetchApp.fetch(fullURL, params);

  var instaData = JSON.parse(response.getContentText());
  
  getInstaData(instaData);
}

function getInstaData(instaData) {
  var row1 = [];
  var row2 = [];
  var date = new Date();
  
  var followers = instaData.business_discovery.followers_count;
  var total_media = instaData.business_discovery.media_count;
  var bio = instaData.business_discovery.biography;
  var username = instaData.business_discovery.username;
  var bioLink = instaData.business_discovery.website;
      
  row1.push([date, username, bio, followers, total_media, bioLink]);
  
  for (var node in instaData.business_discovery.media.data) {
    var likes = instaData.business_discovery.media.data[node].like_count;
    var comments = instaData.business_discovery.media.data[node].comments_count;
    var caption = instaData.business_discovery.media.data[node].caption;
    var postURL = instaData.business_discovery.media.data[node].media_url;
    var datePosted = instaData.business_discovery.media.data[node].timestamp;
    var postId = instaData.business_discovery.media.data[node].id;
    
    row2.push([datePosted, postId, caption, postURL, likes, comments]);
  }
  
  var range1 = falenIGSheet.getRange(4, 1, row1.length, row1[0].length).activate().setValues(row1);
  var range2 = falenIGSheet.getRange(8, 1, row2.length, row2[0].length).activate().setValues(row2);
}

/*********************************************************************************************************************/

// TWITTER API

function makeTwitterRequest() {
  var twitterService = getTwitterService();
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var twSheet = ss.getSheetByName('Latest Tweets - Falen TW');
  var user = twSheet.getRange(2, 1).activate().getValue();
  
  var mainURL = 'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=' + user + '&count=50';
  
  var twResponse = twitterService.fetch(mainURL);
  var tweetData = JSON.parse(twResponse.getContentText());
  Logger.log(tweetData);
  
  getTWData(tweetData);
}

function getTWData(tweetData) {
  var row = [];

  for (var key in tweetData) {
    var tweetDate = tweetData[key].created_at;
    var copy = tweetData[key].text;
    var retweetCount = tweetData[key].retweet_count;
    var likeCount = tweetData[key].favorite_count;
    var retweet = tweetData[key].retweeted;
    var location = tweetData[key].geo;
    
    row.push([tweetDate, copy, retweetCount, likeCount, retweet, location]);
    //Logger.log(row);
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Latest Tweets - Falen TW').activate();
  sheet.getRange(6, 1, row.length, row[0].length).setValues(row);
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('FALEN SOCIAL DATA')
    .addItem('Falen IG Data', 'getFalenIGData')
    .addToUi();
}

function getFalenIGData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Latest Posts - Falen IG');
  var user = sheet.getRange(2, 1).getValue();
  
  var baseUrl = 'https://www.instagram.com/' + user + '/?__a=1';
  var response = UrlFetchApp.fetch(baseUrl);
  Logger.log(response);
  var instaData = JSON.parse(response.getContentText());
  
  var followers = instaData.graphql.user.edge_followed_by['count'];
  var bizCategory = instaData.graphql.user.business_category_name;
  var urlInBio = instaData.graphql.user.external_url;
  var numOfPosts = instaData.graphql.user.edge_owner_to_timeline_media['count'];
  var highlightReel = instaData.graphql.user.edge_follow.highlight_reel_count;
  
  var row = [];
  row.push([followers, bizCategory, urlInBio, numOfPosts, highlightReel]);
  var range1 = sheet.getRange(4, 1, 1, 5).activate().setValues(row);
  
  getInstaData(instaData);
}

function getInstaData(instaData) {
  var row2 = [];
  var date = new Date();
  
  for (var i = 0; i < 12; i++) {
      var mediaId = instaData.graphql.user.edge_owner_to_timeline_media.edges[i].node.id;
      var mediaCaption = instaData.graphql.user.edge_owner_to_timeline_media.edges[i].node.edge_media_to_caption.edges[0].node['text'];
      var mediaLikes = instaData.graphql.user.edge_owner_to_timeline_media.edges[i].node.edge_liked_by['count'];
      var mediaComments = instaData.graphql.user.edge_owner_to_timeline_media.edges[i].node.edge_media_to_comment.count;
      //var mediaIsVideo = instaData.graphql.user.edge_owener_to_timeline_media.edges[i].thumbnail_resources.is_video;
      
      row2.push([date, mediaId, mediaCaption, mediaComments, mediaLikes]);
    }
    
  Logger.log(row2);
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Latest Posts - Falen IG');
  var range2 = sheet.getRange(8, 1, row2.length, row2[0].length).activate().setValues(row2);
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

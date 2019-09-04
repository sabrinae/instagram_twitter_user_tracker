var CONSUMER_KEY = 'some_key';
var CONSUMER_SECRET = 'some_secret';

var REDIRECT_URL = 'https://script.google.com/macros/d/<script_id>/usercallback';

function getTwitterService() {
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  return OAuth1.createService('twitter')
  
      // Set the endpoint URLs.
      .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
      .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
      .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')
      
      // Set the consumer key and secret.
      .setConsumerKey(CONSUMER_KEY)
      .setConsumerSecret(CONSUMER_SECRET)
      
      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')
      
      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties());
}

function showSidebar() {
  var twitterService = getTwitterService();
  if (!twitterService.hasAccess()) {
    var authorizationUrl = twitterService.authorize();
    var template = HtmlService.createTemplate(
        '<a href="<?= authorizationUrl ?>" target="_blank">Authorize</a>. ' +
        'Reopen the sidebar when the authorization is complete.');
    template.authorizationUrl = authorizationUrl;
    var page = template.evaluate();
    SpreadsheetApp.getUi().showSidebar(page);
  } else {
    Logger.log('app has access yay');
    
    makeTwitterRequest();
  }
}

function authCallback(request) {
  var twitterService = getTwitterService();
  var isAuthorized = twitterService.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('we gucci! welcome to the data. feel free to close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. sorz, try again l8r. feel free to close this tab.');
  }
}

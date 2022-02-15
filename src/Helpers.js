/**
 * Finds largest dollar amount from email body.
 * Returns null if no dollar amount is found.
 *
 * @param {Message} message An email message.
 * @returns {String}
 */

function sendReplay(event) {
  var message = getCurrentMessage(event);
  var auth = CacheService.getUserCache().get("auth");
  // console.log('this test',JSON.stringify(auth[0]));
  Logger.log(PropertiesService.getScriptProperties().getProperty("auths"));
  message.reply("reply form the plugin");
}

function createDraft(event) {
  var message = getCurrentMessage(event);
  message.createDraftReply("Got your message");
}

/* function sendApiRequest(event) {
  //log the event
  console.log(JSON.stringify(event));
  // var query = '"Apps Script" stars:">=100"';
  // var url = 'https://api.github.com/search/repositories'
  //   + '?sort=stars'
  //   + '&q=' + encodeURIComponent(query);

  // var response = UrlFetchApp.fetch(url, { 'muteHttpExceptions': true });
  // Logger.log(response);
  // var json = response.getContentText();
  // var data = JSON.parse(json);

  // Make a POST request with a JSON payload.
  var datas = {
    email: "sublime@gmail.com",
    password: "U3VibGltZUAxMjM=",
  };
  var options = {
    method: "post",
    contentType: "application/json",
    // Convert the JavaScript object to a JSON string.
    payload: JSON.stringify(datas),
  };
  var respons = UrlFetchApp.fetch(
    "https://stg.speedtoquote.com/api/front-app/auth",
    options
  );
  var json = respons.getContentText();
  var data = JSON.parse(json);
  CacheService.getUserCache().put("auth", data);
  Logger.log(data);
  PropertiesService.getScriptProperties().setProperty("auths", data);
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Request done"))
    .build();
} */

function loginWithHttp(event) {
  var datas = {
    email: event.formInput.email,
    password: Utilities.base64Encode(event.formInput.password),
  };
  var options = {
    method: "post",
    contentType: "application/json",
    // Convert the JavaScript object to a JSON string.
    payload: JSON.stringify(datas),
  };
  var respons = UrlFetchApp.fetch(
    "https://stg.speedtoquote.com/api/front-app/auth",
    options
  );
  var json = respons.getContentText();
  var data = JSON.parse(json);
  var authData = {
    accessToken: data?.access?.token,
    refreshToken: data?.refresh?.token,
  };
  return authData;
}

function parseEmail(event) {
  var message = getCurrentMessage(event);
  var subject = message.getSubject();
  var from = message.getFrom();
  var to = message.getTo();
  var body = message.getPlainBody();
  var meesageId = message.getId();
  var fromEmail = message.getFrom();
  var updatedFrom = from.substring(
    from.indexOf("<") + 1,
    from.lastIndexOf(">")
  );
  var updatedTo = to.substring(to.indexOf("<") + 1, to.lastIndexOf(">"));
  var datas = {
    from: updatedFrom,
    subject: subject,
    text: body,
    clientEmailToken: meesageId,
    plugInType: "gmail",
    pluginUserEmail: updatedTo,
    pluginUserName: updatedTo,
  };

  var accessToken =
    PropertiesService.getScriptProperties().getProperty("ACCESS_TOKEN");
  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    //Authorization: `Bearer ${accessToken}`,
    // Convert the JavaScript object to a JSON string.
    payload: JSON.stringify(datas),
  };
  try {
    var respons = UrlFetchApp.fetch(
      "https://stg.speedtoquote.com/api/front-app/parseemail",
      options
    );

    var json = respons.getContentText();
    var data = JSON.parse(json);
    isInitiated = true;
    PropertiesService.getUserProperties().setProperty("isInitiated", true);
    updateStateWithParsedData(data);
    var newCard = createSingleQuoteFormCard(event);
    var nav = CardService.newNavigation().pushCard(newCard);
    //return;
    //var nav = CardService.newNavigation().pushCard(newCard);
    return CardService.newActionResponseBuilder().setNavigation(nav).build();
    //return data;
  } catch (error) {
    if (error.name == "Exception") {
      logout();
    }
  }
}

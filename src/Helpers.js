/**
 * Finds largest dollar amount from email body.
 * Returns null if no dollar amount is found.
 *
 * @param {Message} message An email message.
 * @returns {String}
 */
function sendEmail(event) {
  var message = getCurrentMessage(event);
  var auth = CacheService.getUserCache().get("auth");
  // console.log('this test',JSON.stringify(auth[0]));
  const draftEmail = fillMailTemplate();
  Logger.log(PropertiesService.getScriptProperties().getProperty("auths"));
  message.reply(draftEmail);
}

function saveDraft(event) {
  var message = getCurrentMessage(event);
  const draftEmail = fillMailTemplate();
  console.log("draft email", draftEmail);

  message.createDraftReply("incapable of HTML", {
    htmlBody: draftEmail,
    noReply: true,
  });
  //message.createDraftReply(draftEmail);
}

function loginWithHttp(event) {
  var datas = {
    email: event.formInput.email || "sublimedev@yopmail.com",
    password: Utilities.base64Encode(
      event.formInput.password || "Sublimedev@123"
    ),
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

function consoleLogValues() {
  console.log("Logging values");
  //Storage State Variables
  //equipmentList
  //tmsRates
  //isOrderPosted
  //equipmentList
  //rateType
}

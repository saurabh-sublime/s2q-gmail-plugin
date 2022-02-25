/**
 * Finds largest dollar amount from email body.
 * Returns null if no dollar amount is found.
 *
 * @param {Message} message An email message.
 * @returns {String}
 */
function sendEmail(event) {
  try {
    var message = getCurrentMessage(event);
    var auth = CacheService.getUserCache().get("auth");
    // console.log('this test',JSON.stringify(auth[0]));
    const draftEmail = fillMailTemplate();
    const sendEmailApiResult = sendEmailHttp(event);
    if (sendEmailApiResult === "success") {
      message.reply("incapable of HTML", {
        htmlBody: draftEmail,
        noReply: true,
      });
      return notify("Email has been sent.");
    } else {
      return notify("Error sending email 1.");
    }
  } catch (e) {
    return notify("Error sending email 2.");
  }
}

function saveDraft(event) {
  try {
    var message = getCurrentMessage(event);
    const draftEmail = fillMailTemplate();
    console.log("draft email", draftEmail);
    const draftApiResult = saveDraftHttp(event);
    if (draftApiResult === "success") {
      message.createDraftReply("incapable of HTML", {
        htmlBody: draftEmail,
        noReply: true,
      });
      return notify("Email has been saved as draft.");
    } else {
      return notify("Error saving draft. Please try again.");
    }
  } catch (e) {
    return notify("Error saving draft. Please try again.");
  }
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
  try {
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
  } catch (e) {
    return notify("Error while logging in 2");
  }
}

function sendEmailHttp(event) {
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
  const quoteData = getState();
  var updatedTo = to.substring(to.indexOf("<") + 1, to.lastIndexOf(">"));
  eval(
    UrlFetchApp.fetch(
      "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js"
    ).getContentText()
  );

  /*   eval(
    UrlFetchApp.fetch(
      "https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.34/moment-timezone.min.js"
    ).getContentText()
  );

  eval(
    UrlFetchApp.fetch(
      "https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.31/moment-timezone-with-data.js"
    ).getContentText()
  ); */

  //https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.31/moment-timezone-with-data.js

  const fromDate = moment(quoteData?.pickupTime);
  const toDate = moment(quoteData?.deliveryTime);
  console.log("this is converted pickuptime", fromDate.toISOString());
  console.log("this is converted deliverytime", toDate.toISOString());

  const datas = {
    clientEmailToken: meesageId,
    text: body,
    locationFrom: quoteData?.locationFrom,
    locationTo: quoteData?.locationTo,
    weight: quoteData?.weight,
    pickupTimestamp: fromDate.toISOString(),
    deliveryTimestamp: toDate.toISOString(),
    distance: quoteData?.distance,
    cost: quoteData?.totalCost,
    costPerMile: quoteData?.costPerMile,
    equipment: quoteData?.equipment?.id,
    plugInType: "gmail",
  };

  console.log("sent data for save email", JSON.stringify(datas));
  var accessToken =
    PropertiesService.getUserProperties().getProperty("ACCESS_TOKEN");
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
      "https://stg.speedtoquote.com/api/front-app/save-gmail",
      options
    );

    //var json = respons.getContentText();
    //var data = JSON.parse(json);
    console.log("data returned by save email api");
    return "success";
    //return data;
  } catch (error) {
    console.log("error with save email api 1", error);
    return notify("Error sending email");
  }
}

function saveDraftHttp(event) {
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
  const quoteData = getState();
  var updatedTo = to.substring(to.indexOf("<") + 1, to.lastIndexOf(">"));
  console.log("this is pickuptime", quoteData?.pickupTime);

  eval(
    UrlFetchApp.fetch(
      "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js"
    ).getContentText()
  );

  /*   eval(
    UrlFetchApp.fetch(
      "https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.34/moment-timezone.min.js"
    ).getContentText()
  );

  eval(
    UrlFetchApp.fetch(
      "https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.31/moment-timezone-with-data.js"
    ).getContentText()
  ); */

  //https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.31/moment-timezone-with-data.js

  const fromDate = moment(quoteData?.pickupTime);
  const toDate = moment(quoteData?.deliveryTime);
  console.log("this is converted pickuptime", fromDate.toISOString());
  console.log("this is converted deliverytime", toDate.toISOString());
  const datas = {
    clientEmailToken: meesageId,
    text: body,
    locationFrom: quoteData?.locationFrom,
    locationTo: quoteData?.locationTo,
    weight: quoteData?.weight,
    pickupTimestamp: fromDate.toISOString(),
    deliveryTimestamp: toDate.toISOString(),
    distance: quoteData?.distance,
    cost: quoteData?.totalCost,
    costPerMile: quoteData?.costPerMile,
    equipment: quoteData?.equipment?.id,
    plugInType: "gmail",
  };

  console.log("sent data", JSON.stringify(datas));
  var accessToken =
    PropertiesService.getUserProperties().getProperty("ACCESS_TOKEN");
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
  console.log("options", options);
  try {
    var respons = UrlFetchApp.fetch(
      "https://stg.speedtoquote.com/api/front-app/draftEmail",
      options
    );

    //var json = respons.getContentText();
    //var data = JSON.parse(json);
    //console.log("data returned by save draft api", data);
    return "success";
    //return data;
  } catch (error) {
    console.log("error with save draft api", error);
    return notify("Error saving draft");
  }
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
    PropertiesService.getUserProperties().getProperty("ACCESS_TOKEN");
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
    var nav = CardService.newNavigation().updateCard(newCard);
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
  const state = getState();
  const quoteData = state;
  console.log("current quote data", state);
  eval(
    UrlFetchApp.fetch(
      "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js"
    ).getContentText()
  );

  eval(
    UrlFetchApp.fetch(
      "https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.34/moment-timezone.min.js"
    ).getContentText()
  );

  eval(
    UrlFetchApp.fetch(
      "https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.31/moment-timezone-with-data.js"
    ).getContentText()
  );

  //https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.31/moment-timezone-with-data.js

  var a = moment([2007, 0, 29]);
  var b = moment([2007, 0, 28]);
  var difference = a.diff(b);
  Logger.log(difference);
  const fromDate = moment(quoteData?.pickupTime);
  const toDate = moment(quoteData?.deliveryTime);

  const tzFrom = locationJson.find(
    (item) =>
      `${item.city}, ${item.state} ${item.zipCode}` === quoteData?.locationFrom
  )?.tz;
  const tzTo = locationJson.find(
    (item) =>
      `${item.city}, ${item.state} ${item.zipCode}` === quoteData?.locationTo
  )?.tz;
  console.log(
    "from date",
    fromDate.format("MM/DD/YYYY hh:mm A") +
      " " +
      fromDate.tz(tzFrom).format("z")
  );
  console.log("to date", tzFrom);
  console.log("iso string", fromDate.toISOString());
}

function notify(message) {
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText(message))
    .build();
}

const formatMoneySpecial = (value) =>
  value !== undefined && typeof value === "number"
    ? `${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
    : value;

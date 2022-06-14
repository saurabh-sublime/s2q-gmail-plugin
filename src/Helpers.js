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
    const draftEmail = fillMailTemplate();
    const sendEmailApiResult = sendEmailHttp(event);
    if (sendEmailApiResult === "success") {
      message.reply("incapable of HTML", {
        htmlBody: draftEmail,
        noReply: true,
      });
      return notify("Email sent.");
    } else {
      return notify("Error sending email.");
    }
  } catch (e) {
    return notify("Error sending email.");
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
  /*   var datas = {
    email: event.formInput.email || "sublimedev@yopmail.com",
    password: Utilities.base64Encode(
      event.formInput.password || "Sublimedev@123"
    ),
  }; */
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
    return notify("Error while logging in.");
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

  const fromDate = moment(quoteData?.pickupTime);
  const toDate = moment(quoteData?.deliveryTime);

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

  eval(
    UrlFetchApp.fetch(
      "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js"
    ).getContentText()
  );

  const fromDate = moment(quoteData?.pickupTime);
  const toDate = moment(quoteData?.deliveryTime);

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
    payload: JSON.stringify(datas),
  };
  console.log("options", options);
  try {
    var respons = UrlFetchApp.fetch(
      "https://stg.speedtoquote.com/api/front-app/draftEmail",
      options
    );
    return "success";
  } catch (error) {
    console.log("error with save draft api", error);
    return notify("Error saving draft. Please try again");
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
    let finalData = {};
    console.log("ran1", data?.equipment);
    if (!data?.equipment) {
      console.log("ran2", data?.equipment || 123);
      const [getUser, setUser, deleteUser] = useStorageState("user");
      const frData = {
        equipment: getUser()?.defaultEquipment,
        locationFrom: data?.locationFrom,
        locationTo: data?.locationTo,
      };
      fetchRates(
        data?.locationFrom,
        data?.locationTo,
        getUser()?.defaultEquipment
      );
      PropertiesService.getUserProperties().setProperty("isInitiated", true);
      return recalculateDetails(event, true, frData);
    }
    //isInitiated = true;

    PropertiesService.getUserProperties().setProperty("isInitiated", true);
    console.log("qrt", data?.locationFrom, data?.locationTo, data?.equipment);
    const frData = {
      equipment: data?.equipment,
      locationFrom: data?.locationFrom,
      locationTo: data?.locationTo,
    };
    fetchRates(data?.locationFrom, data?.locationTo, data?.equipment);
    return recalculateDetails(event, true, frData);
    updateStateWithParsedData({
      ...data,
      totalTruckCost: calculateTotalTruckCost(
        data.costPerMile,
        data.fuelPerMile,
        data.distance,
        data.equipment.minimumCost
      ),
    });
    setRatesBackup();
    //recalculateDetails(event);
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
    return notify("Internal error. Please retry");
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

function getUserHttp() {
  /*   var message = getCurrentMessage(event);
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

  eval(
    UrlFetchApp.fetch(
      "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js"
    ).getContentText()
  );

  const fromDate = moment(quoteData?.pickupTime);
  const toDate = moment(quoteData?.deliveryTime);

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
  }; */
  const [getUser, setUser, deleteUser] = useStorageState("user");
  var accessToken =
    PropertiesService.getUserProperties().getProperty("ACCESS_TOKEN");
  var options = {
    method: "get",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    //payload: JSON.stringify(datas),
  };
  console.log("user options", options);
  try {
    var respons = UrlFetchApp.fetch(
      "https://stg.speedtoquote.com/api/front-app/auth/user",
      options
    );
    var json = respons.getContentText();
    var data = JSON.parse(json);
    setUser(data);
    console.log("user data", data);
    return "success";
  } catch (error) {
    console.log("error with save draft api", error);
    return notify("Error fetching user info");
  }
}

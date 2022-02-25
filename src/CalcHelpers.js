//To calculate total cost
const getCalculatedTotalCost = (cost, margin, fuelPerMile = 0, distance) => {
  let fuelCost = Number(fuelPerMile) * distance;
  const totalCost = Number(cost) / (1 - margin / 100);
  const marginProfit = Number(totalCost - cost);
  return { marginProfit, totalCost: totalCost + fuelCost };
};

//To format number
const formatNumber = (value, showDefault) =>
  typeof value === "number" ? value.toFixed(2) : showDefault ? 0 : "";

//To parse float
const getParsedFloat = (number = "") => {
  return parseFloat(number.toString().replace(/,/g, ""));
};

//To recalculate (parseemail api is invoked again)
const recalculateDetails = (event) => {
  console.log("recalculating begins");
  const [getRateType, setRateType, deleteRateType] =
    useStorageState("rateType");
  setRateType("none");
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

  const quoteData = getState();
  var { locationFrom, locationTo, equipment } = quoteData;
  fetchRates(locationFrom, locationTo, equipment);
  if (locationFrom && locationTo && equipment) {
    //getActiveTms();
    //checkTmsOrder(locationFrom, locationTo, equipment);
    //getRates(locationFrom, locationTo, equipment);

    const datas = {
      locationFrom: quoteData?.locationFrom,
      locationTo: quoteData?.locationTo,
      equipmentId: quoteData?.equipment?.id,
      weight: quoteData?.weight,
      from: updatedFrom,
      subject: subject,
      plugInType: "gmail",
      text: body,
      clientEmailToken: meesageId,
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
      payload: JSON.stringify(datas),
    };
    try {
      var respons = UrlFetchApp.fetch(
        "https://stg.speedtoquote.com/api/front-app/rebuild",
        options
      );

      var json = respons.getContentText();
      var parsedData = JSON.parse(json);

      const state = getState();
      state.cost = 300;
      state.cost = getTotalCost(
        parsedData.costPerMile,
        parsedData.distance,
        parsedData.equipment?.minimumCost,
        quoteData
      );
      state.totalCost = Number(parsedData.totalCost);
      state.costPerMile = formatNumber(parsedData.costPerMile);
      state.margin = formatNumber(parsedData.equipment?.margin);
      state.marginProfit = Number(parsedData.marginProfit);
      state.costPerMile = formatNumber(parsedData.costPerMile);
      state.distance = formatNumber(parsedData.distance);
      state.weight = parsedData.weight;
      state.dimension = parsedData.dimension;
      state.transitTime = formatNumber(parsedData.transitTime);
      state.equipment = parsedData.equipment;
      state.mapLocations = parsedData.mapLocations;
      const updatedState = state;
      setState(updatedState);
      var newCard = createSingleQuoteFormCard(event);
      var nav = CardService.newNavigation().updateCard(newCard);
      return CardService.newActionResponseBuilder().setNavigation(nav).build();
    } catch (error) {
      if (error.name == "Exception") {
        console.log("error while recalculating", error);
        return notify("Error while recalculating");
        //logout();
      }
    }
  } else {
    console.log("all required details are not there");
    return notify("Please enter require details");
  }
};

//To get total cost
function getTotalCost(costPerMile, distance, minimumCost, quoteData) {
  var totalCost;
  totalCost = Number(costPerMile) * Number(distance);
  //return totalCost > minimumCost ? totalCost : minimumCost;
  return totalCost;
}

const fetchEquipmentList = () => {
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
  try {
    var respons = UrlFetchApp.fetch(
      "https://stg.speedtoquote.com/api/front-app/equipment",
      options
    );

    var json = respons.getContentText();
    var parsedData = JSON.parse(json);
    const [getEquipmentList, setEquipmentList, deleteEquipmentList] =
      useStorageState("equipmentList");
    if (parsedData) {
      const equpmentList = parsedData?.data?.sort((a, b) =>
        a.name > b.name ? 1 : -1
      );

      setEquipmentList([...equpmentList]);
      console.log("this is equipment list", getEquipmentList());
    }
    return data;
  } catch (error) {
    if (error.name == "Exception") {
      logout();
      console.log("error while fetching equipments", error);
    }
  }
};

const fetchRates = (locationFrom, locationTo, equipment) => {
  console.log("fetching rate begins");
  const [getRates, setRates, deleteRates] = useStorageState("rates");
  const [getTmsRates, setTmsRates, deleteTmsRates] =
    useStorageState("tmsRates");
  setRates(null);
  setTmsRates(null);
  var equipmentAllow = ["Tractor", "Reefer", "Flatbed"];
  if (equipmentAllow.includes(equipment?.name.trim())) {
    console.log("fetching rates");

    const datas = {
      equipmentName: equipment.name,
      locationFrom: locationFrom,
      locationTo: locationTo,
    };
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
    try {
      var respons = UrlFetchApp.fetch(
        "https://stg.speedtoquote.com/api/tms-rate/get-rates",
        options
      );

      var json = respons.getContentText();
      var parsedData = JSON.parse(json);
      console.log("these are rates", parsedData);
      setTmsRates(parsedData?.data?.rateResponses[0].response);
      if (parsedData?.data?.rateResponses[0].response.rate) {
        console.log("these are applied rates");
        setRates(parsedData?.data?.rateResponses[0].response.rate);
      } else {
        setRates(null);
      }
    } catch (error) {
      if (error.name == "Exception") {
        //logout();
        return notify("Error fetching rates");
        console.log("error while fetching rates", error);
      }
    }
  } else {
    setRates(null);
  }
  console.log("fetching rates done");
};
//

function sendTmsOrder(event) {
  const [getIsOrderPosted, setIsOrderPosted, deleteIsOrderPosted] =
    useStorageState("isOrderPosted");
  var message = getCurrentMessage(event);
  var subject = message.getSubject();
  var from = message.getFrom();
  var to = message.getTo();
  var body = message.getPlainBody();
  var messageId = message.getId();
  var fromEmail = message.getFrom();
  var updatedFrom = from.substring(
    from.indexOf("<") + 1,
    from.lastIndexOf(">")
  );
  var updatedTo = to.substring(to.indexOf("<") + 1, to.lastIndexOf(">"));

  const quoteData = getState();
  if (quoteData.equipment.template) {
    const draftEmail = fillMailTemplate();
    if (draftEmail) {
      const datas = {
        locationFrom: quoteData?.locationFrom,
        locationTo: quoteData?.locationTo,
        pickupTimestamp: quoteData?.pickupTimestamp,
        deliveryTimestamp: quoteData?.deliveryTimestamp,
        equipmentId: quoteData?.equipment?.id,
        weight: quoteData?.weight,
        from: updatedFrom,
        subject: subject,
        totalCost: quoteData?.totalCost,
        plugInType: "gmail",
        text: body,
        clientEmailToken: messageId,
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
        payload: JSON.stringify(datas),
      };

      try {
        var respons = UrlFetchApp.fetch(
          "https://stg.speedtoquote.com/api/tms/post-order",
          options
        );

        var json = respons.getContentText();
        var data = JSON.parse(json);
        console.log("results of isOrederPosted", data);
        setIsOrderPosted(true);
        var newCard123 = createSingleQuoteFormCard(event);
        console.log("card built");
        var nav123 = CardService.newNavigation().updateCard(newCard123);
        return CardService.newActionResponseBuilder()
          .setNavigation(nav123)
          .build();
      } catch (e) {
        return notify("Error posting order");
        console.log("error occured while checking tms order", e);
      }
    }
  }
}

function createTmsOrder(event) {
  console.log("creating tms order");
  const [getIsOrderPosted, setIsOrderPosted, deleteIsOrderPosted] =
    useStorageState("isOrderPosted");
  var message = getCurrentMessage(event);
  var subject = message.getSubject();
  var from = message.getFrom();
  var to = message.getTo();
  var body = message.getPlainBody();
  var messageId = message.getId();
  var fromEmail = message.getFrom();
  var updatedFrom = from.substring(
    from.indexOf("<") + 1,
    from.lastIndexOf(">")
  );
  var updatedTo = to.substring(to.indexOf("<") + 1, to.lastIndexOf(">"));

  const quoteData = getState();
  if (quoteData.equipment.template) {
    console.log("this worked");
    const draftEmail = fillMailTemplate();
    if (draftEmail) {
      const datas = {
        locationFrom: quoteData?.locationFrom,
        locationTo: quoteData?.locationTo,
        pickupTimestamp: quoteData?.pickupTimestamp,
        deliveryTimestamp: quoteData?.deliveryTimestamp,
        equipmentId: quoteData?.equipment?.id,
        weight: quoteData?.weight,
        from: updatedFrom,
        subject: subject,
        text: body,
        plugInType: "gmail",
        pluginUserEmail: messageId,
        pluginUserName: updatedTo,
        clientEmailToken: updatedTo,
        // totalCost: quoteData?.totalCost,
      };
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

      try {
        console.log("running create tms order api");
        var respons = UrlFetchApp.fetch(
          "https://stg.speedtoquote.com/api/tms/create-order",
          options
        );

        var json = respons.getContentText();
        var data = JSON.parse(json);
        console.log("results of create tms order", data);
        setIsOrderPosted(true);
        var newCard123 = createSingleQuoteFormCard(event);
        console.log("card built");
        var nav123 = CardService.newNavigation().updateCard(newCard123);
        return CardService.newActionResponseBuilder()
          .setNavigation(nav123)
          .build();
      } catch (e) {
        console.log("Error creating order", e);
        return notify("Error creating order");
      }
    }
  }
}
function checkTmsOrder(event) {
  const [getIsOrderPosted, setIsOrderPosted, deleteIsOrderPosted] =
    useStorageState("isOrderPosted");
  var message = getCurrentMessage(event);
  var messageId = message.getId();
  const state = getState();
  if (state.equipment.id) {
    var datas = {
      locationFrom: state.locationFrom,
      locationTo: state.locationTo,
      equipmentId: state.equipment?.id,
      clientEmailToken: messageId,
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
      payload: JSON.stringify(datas),
    };
    try {
      var respons = UrlFetchApp.fetch(
        "https://stg.speedtoquote.com/api/tms/check-posted-order",
        options
      );

      var json = respons.getContentText();
      var data = JSON.parse(json);
      console.log("results of isOrederPosted", data);
      setIsOrderPosted(data?.isOrderPosted);
    } catch (e) {
      console.log("error occured while checking tms order", e);
      return notify("Error while checking tms order");
    }
  }
}

function getActiveTms(event) {
  const [getActiveTms, setActiveTms, deleteActiveTms] =
    useStorageState("activeTms");
  const [getActiveTmsRate, setActiveTmsRate, deleteActiveTmsRate] =
    useStorageState("activeTmsRate");
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
  try {
    var respons = UrlFetchApp.fetch(
      "https://stg.speedtoquote.com/api/tms/active",
      options
    );

    var json = respons.getContentText();
    var data = JSON.parse(json);
    console.log("active tms is", data);
    setActiveTms(data?.activeTms);
  } catch (e) {
    return notify("Error checking active tms");
    console.log("error occured while checking active tms", e);
  }
  try {
    var respons = UrlFetchApp.fetch(
      "https://stg.speedtoquote.com/api/tms-rate/active",
      options
    );

    var json = respons.getContentText();
    var data = JSON.parse(json);
    console.log("active tms rate is", data);
    setActiveTmsRate(data?.activeRate);
  } catch (e) {
    return notify("Error checking active tms rate");
    console.log("error occured while checking active tms", e);
  }
}

function fillMailTemplate() {
  const quoteData = getState();
  try {
    if (quoteData.equipment.template) {
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
      var a = moment([2007, 0, 29]);
      var b = moment([2007, 0, 28]);
      var difference = a.diff(b);
      Logger.log(difference);
      const fromDate = moment(quoteData?.pickupTime);
      const toDate = moment(quoteData?.deliveryTime);

      const tzFrom = locationJson.find(
        (item) =>
          `${item.city}, ${item.state} ${item.zipCode}` ===
          quoteData?.locationFrom
      )?.tz;
      const tzTo = locationJson.find(
        (item) =>
          `${item.city}, ${item.state} ${item.zipCode}` ===
          quoteData?.locationTo
      )?.tz;

      const filledTemplate = fillTemplate(quoteData.equipment.template, {
        ...quoteData,
        cost: quoteData?.totalCost,
        pickupDateTime: quoteData?.pickupTime
          ? fromDate.format("MM/DD/YYYY hh:mm A") +
            " " +
            fromDate.tz(tzFrom).format("z")
          : undefined,
        deliveryDateTime: quoteData?.deliveryTime
          ? toDate.format("MM/DD/YYYY hh:mm A") +
            " " +
            toDate.tz(tzTo).format("z")
          : undefined,
      });
      const templateHtml = convertToHtml(filledTemplate);
      //const templateHtml = filledTemplate;
      return templateHtml;
      // createDraft(templateHtml);
    }
  } catch (err) {
    console.log(" Internal Error. Please retry.", err);
    return notify("Internal Error. Please retry.");
  }
}

function fillTemplate(mailPattern, mailModel) {
  const formatMoneyWithoutDollar = (value) =>
    value !== undefined && typeof value === "number"
      ? `${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
      : "-";

  const formatTime = (hours) => {
    if (hours > 0) {
      let rhours = Math.floor(hours);
      let minutes = (hours - rhours) * 60;
      let rminutes = Math.round(minutes);
      return (
        (rhours ? rhours + " hrs " : "") +
        (rminutes ? rminutes + `${rminutes === 1 ? " min" : " mins"}` : "")
      );
    } else {
      return "0 Hours";
    }
  };
  const objectMap = {
    // costPerMile: formatMoneyWithoutDollar,
    cost: formatMoneyWithoutDollar,
    transitTime: formatTime,
    totalCost: formatMoneyWithoutDollar,
    // distance: formatNumber
  };
  const keys = [
    ...new Set([...mailPattern.matchAll(/{{(.*?)}}/gm)].map((ar) => ar[1])),
  ];

  for (const key of keys) {
    if (mailModel) {
      const val =
        mailModel[key] !== undefined && mailModel[key] !== null
          ? mailModel[key]
          : "--";
      if (key === "equipment") {
        mailPattern = mailPattern.replace(
          new RegExp(`{{${key}}}`, `gm`),
          `${mailModel.equipment?.name}`
        );
      } else {
        const value = objectMap[key] ? objectMap[key](val) : val;

        mailPattern = mailPattern.replace(
          new RegExp(`{{${key}}}`, `gm`),
          `${value}`
        );
      }
    }
  }
  return mailPattern;
}

function convertToHtml(filledTemplate) {
  var datas = {
    markDown: filledTemplate,
  };
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
  try {
    var respons = UrlFetchApp.fetch(
      "https://stg.speedtoquote.com/api/front-app/convertToHtml",
      options
    );

    var json = respons.getContentText();
    var data = JSON.parse(json);
    console.log("results of convert to html api", data?.html);
    return data.html;
  } catch (e) {
    console.log("error occured while checking tms order", e);
    return notify("Error while converting to html");
  }
}

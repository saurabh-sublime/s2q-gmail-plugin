const getCalculatedTotalCost = (cost, margin, fuelPerMile = 0, distance) => {
  let fuelCost = Number(fuelPerMile) * distance;

  /*     if (!showRate) {
      fuelCost = 0;
    } */

  const totalCost = Number(cost) / (1 - margin / 100);
  const marginProfit = Number(totalCost - cost);

  return { marginProfit, totalCost: totalCost + fuelCost };
};

const formatNumber = (value, showDefault) =>
  typeof value === "number" ? value.toFixed(2) : showDefault ? 0 : "";

const getParsedFloat = (number = "") => {
  return parseFloat(number.toString().replace(/,/g, ""));
};

const recalculateDetails = (event) => {
  console.log("recalculating begins");
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
  //let { locationFromBackup, locationToBackup, equipmentId } = quoteBackup;
  //setLoading(true);
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
    //console.log("sent data", datas);
    var accessToken =
      PropertiesService.getScriptProperties().getProperty("ACCESS_TOKEN");

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
      //console.log("received data", parsedData);
      //console.log("We have to print this");
      const state = getState();
      //state.locationFrom = parsedData.locationFrom;
      //state.locationTo = parsedData.locationTo;
      //state.cost = 1000;
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
      console.log("updated state", updatedState);
      var newCard = createSingleQuoteFormCard(event);
      var nav = CardService.newNavigation().updateCard(newCard);
      //return;
      //var nav = CardService.newNavigation().pushCard(newCard);
      console.log("recalculating done");
      return CardService.newActionResponseBuilder().setNavigation(nav).build();
      //return data;
    } catch (error) {
      if (error.name == "Exception") {
        console.log("error while recalculating", error);
        //logout();
      }
    }
  }
};

function getTotalCost(costPerMile, distance, minimumCost, quoteData) {
  var totalCost;

  totalCost = Number(costPerMile) * Number(distance);

  //onsole.log("the values", totalCost > minimumCost ? totalCost : minimumCost);
  //return totalCost > minimumCost ? totalCost : minimumCost;

  return totalCost;
}

function getTotalCost1(costPerMile, distance, minimumCost) {
  return distance;
}

const fetchEquipmentList = () => {
  var accessToken =
    PropertiesService.getScriptProperties().getProperty("ACCESS_TOKEN");

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
      //logout();
      console.log("error while fetching equipments", error);
    }
  }
};

const fetchRates = (locationFrom, locationTo, equipment) => {
  console.log("fetching rate begins");
  var equipmentAllow = ["Tractor", "Reefer", "Flatbed"];
  if (equipmentAllow.includes(equipment?.name.trim())) {
    console.log("fetching rates");
    const [getTmsRates, setTmsRates, deleteTmsRates] =
      useStorageState("tmsRates");
    const [getRates, setRates, deleteRates] = useStorageState("rates");
    const datas = {
      equipmentName: equipment.name,
      locationFrom: locationFrom,
      locationTo: locationTo,
    };
    var accessToken =
      PropertiesService.getScriptProperties().getProperty("ACCESS_TOKEN");

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
        setRates(parsedData?.data?.rateResponses[0].response.rate);
      } else {
        setRates(null);
      }
    } catch (error) {
      if (error.name == "Exception") {
        //logout();
        console.log("error while fetching rates", error);
      }
    }
  }
  console.log("fetching rates done");
};
//

function createSingleQuoteFormCard(event) {
  var card = CardService.newCardBuilder();
  var imageHeader = CreateImageHeader(CardService.newCardSection());
  card.addSection(imageHeader);
  var message = getCurrentMessage(event);
  var subject = message.getSubject();
  var from = message.getFrom();
  var updatedFrom = from.substring(
    from.indexOf("<") + 1,
    from.lastIndexOf(">")
  );
  var subjectAndSenderSection = CardService.newCardSection();
  subjectAndSenderSection.addWidget(
    CardService.newTextParagraph().setText(
      "<b> <strong>Pick up request: </strong></b>" + subject
    )
  );
  subjectAndSenderSection.addWidget(
    CardService.newTextParagraph().setText(
      "<b> <strong>Sender email: </strong></b>" + updatedFrom
    )
  );
  card.addSection(subjectAndSenderSection);
  var formSection = createInputFormSection(CardService.newCardSection(), event);
  card.addSection(formSection);
  return card.build();
}

function onInputChange(event) {
  var variable = event.parameters.variable;
  var tempState = getState();
  tempState[variable] = event.formInput[variable];
  if (calcFunctions[variable]) {
    updatedTempState = calcFunctions[variable](
      event.formInput[variable],
      tempState
    );
    setState(updatedTempState);
    if (
      variable === "equipmentName" ||
      variable === "locationFrom" ||
      variable === "locationTo"
    ) {
      return recalculateDetails(event);
    }
  }
  //var newCard123 = createSingleQuoteFormCard(event);
  //var nav123 = CardService.newNavigation().updateCard(newCard123);
  //return CardService.newActionResponseBuilder().setNavigation(nav123).build();
}

function rebuild(event) {
  CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation().updateCard(createSingleQuoteFormCard(event))
    )
    .build();
}
function putTextWidget(section, fieldName, title, value, suggestions) {
  var thisTextWidget = CardService.newTextInput()
    .setFieldName(fieldName)
    .setTitle(title)
    .setValue(value || "");
  var onInputChangeAction = CardService.newAction()
    .setFunctionName("onInputChange")
    .setParameters({
      variable: fieldName,
    })
    .setLoadIndicator(CardService.LoadIndicator.SPINNER);

  if (
    fieldName === "equipmentName" ||
    fieldName === "locationFrom" ||
    fieldName === "locationTo"
  ) {
    var onInputChangeAction = CardService.newAction()
      .setFunctionName("onInputChange")
      .setParameters({
        variable: fieldName,
      })
      .setLoadIndicator(CardService.LoadIndicator.SPINNER);
  } else {
    var onInputChangeAction = CardService.newAction()
      .setFunctionName("onInputChange")
      .setParameters({
        variable: fieldName,
      });
  }
  if (suggestions?.length > 0) {
    thisTextWidget.setSuggestions(
      CardService.newSuggestions().addSuggestions(suggestions)
    );
  }
  thisTextWidget.setOnChangeAction(onInputChangeAction);
  section.addWidget(thisTextWidget);
}

function getButtonWidget(buttonName, methodName, type, color) {
  var buttonAction = CardService.newAction()
    .setFunctionName(methodName)
    .setLoadIndicator(CardService.LoadIndicator.SPINNER);
  var button = CardService.newTextButton()
    .setText(buttonName)
    .setOnClickAction(buttonAction);
  if (type === "FILLED") {
    button.setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  }
  if (type === "FILLED" && color) {
    button.setBackgroundColor(color);
  }
  if (type !== "FILLED") {
    button.setBackgroundColor("#f8f8f8");
  }
  return button;
}

var equipmentSuggestions = [
  "Cargo Van",
  "Jeeps",
  "Sprinter Van",
  "Straight Truck",
  "Tractor",
  "Van",
];
const getEquipmentSuggestions = () => {
  const [getEquipmentList, setEquipmentList, deleteEquipmentList] =
    useStorageState("equipmentList");
  var equipmentArrey = getEquipmentList();
  var equipmentList = equipmentArrey.map((i) => i.name);
  console.log("this is equipment list", equipmentList);
  var equipmentObject = {};
  equipmentArrey.map((i) => (equipmentObject[i.name] = i));
  return { equipmentList: equipmentList, equipmentObject: equipmentObject };
};

function createInputFormSection(section, event) {
  const [getIsOrderPosted, setIsOrderPosted, deleteIsOrderPosted] =
    useStorageState("isOrderPosted");
  const isOrderPosted = getIsOrderPosted();
  //const isOrderPosted = true;
  console.log(isOrderPosted);
  var state = getState();
  console.log("rebuilding with", state);
  putTextWidget(
    section,
    "equipmentName",
    "Equipment",
    state?.equipment?.name,
    getEquipmentSuggestions().equipmentList
  );
  putTextWidget(
    section,
    "locationFrom",
    "Pickup",
    state?.locationFrom,
    locationList
  );
  putTextWidget(
    section,
    "locationTo",
    "Delivery",
    state?.locationTo,
    locationList
  );

  var pickupTimeWidget = CardService.newDateTimePicker()
    .setTitle("Pickup time")
    .setFieldName("pickupTime")
    .setValueInMsSinceEpoch(state?.pickupTime)
    .setTimeZoneOffsetInMins(-5 * 60)
    .setOnChangeAction(
      CardService.newAction()
        .setFunctionName("onInputChange")
        .setParameters({
          variable: "pickupTime",
        })
        .setLoadIndicator(CardService.LoadIndicator.SPINNER)
    );
  section.addWidget(pickupTimeWidget);

  var deliveryTimeWidget = CardService.newDateTimePicker()
    .setTitle("Delivery time")
    .setFieldName("deliveryTime")
    .setValueInMsSinceEpoch(state?.deliveryTime)
    .setTimeZoneOffsetInMins(-5 * 60)
    .setOnChangeAction(
      CardService.newAction()
        .setFunctionName("onInputChange")
        .setParameters({
          variable: "deliveryTime",
        })
        .setLoadIndicator(CardService.LoadIndicator.SPINNER)
    );

  section.addWidget(deliveryTimeWidget);
  const [getRates, setRates, deleteRates] = useStorageState("rates");
  if (getRates()) {
    addRateSection(section, getRates());
  }
  putTextWidget(
    section,
    "costPerMile",
    "Cost p/m ($)",
    Number(state?.costPerMile)?.toFixed(2)
  );
  putTextWidget(
    section,
    "fuelPerMile",
    "Fuel Srchrge p/m ($)",
    Number(state?.fuelPerMile)?.toFixed(2)
  );
  putTextWidget(
    section,
    "distance",
    "Distance (Miles)",
    formatMoneySpecial(state?.distance)
  );
  putTextWidget(
    section,
    "speed",
    "Speed (MPH)",
    state?.equipment?.mphTransitTime
  );
  putTextWidget(
    section,
    "transitTime",
    "Transit Time",
    formatTime(Number(state?.transitTime))
  );
  putTextWidget(section, "cost", "Cost ($)", formatMoneySpecial(state?.cost));
  putTextWidget(
    section,
    "totalTruckCost",
    "Total Truck Cost ($)",
    formatMoneySpecial(state?.totalTruckCost)
  );
  putTextWidget(
    section,
    "marginProfit",
    "Margin ($)",
    formatMoneySpecial(state?.marginProfit)
  );
  putTextWidget(
    section,
    "margin",
    "Margin %",
    Number(state?.margin)?.toFixed(2),
    state
  );
  putTextWidget(
    section,
    "totalCost",
    "Quote (All In Rate) ($)",
    formatMoneySpecial(state?.totalCost)
  );

  section.addWidget(
    getButtonWidget("Recalculate", "rebuildCard", "FILLED", "#a2d45e")
  );
  var buttonSet = CardService.newButtonSet()
    .addButton(getButtonWidget("Save Draft", "saveDraft", "FILLED", "#2f3d8a"))
    .addButton(getButtonWidget("Send Email", "sendEmail", "FILLED", "#2f3d8a"));
  section.addWidget(buttonSet);
  section.addWidget(CardService.newDivider());
  const [getActiveTms, setActiveTms, deleteActiveTms] =
    useStorageState("activeTms");
  if (getActiveTms()) {
    var image = CardService.newImage()
      .setAltText("A nice image")
      .setImageUrl(getActiveTmsImage());
    section.addWidget(image);
    var tmsButtonSet = CardService.newButtonSet()
      .addButton(
        getButtonWidget(
          "Create Order",
          isOrderPosted ? "tmsAlreadyPosted" : "createTmsOrder",
          "FILLED",
          isOrderPosted ? "#c2c2c2" : "#2f3d8a"
        )
      )
      .addButton(
        getButtonWidget(
          "Create & Post Order",
          isOrderPosted ? "tmsAlreadyPosted" : "sendTmsOrder",
          "FILLED",
          isOrderPosted ? "#c2c2c2" : "#2f3d8a"
        )
      );

    section.addWidget(tmsButtonSet);
    //section.addWidget(CardService.newDivider());
  }
  /*   section.addWidget(
    getButtonWidget("Console log", "consoleLogValues", "FILLED", "#a2d45e")
  ); */
  return section;
}

function getActiveRateTmsImage(activeTmsRate, rates) {
  const DAT_PER_MILE =
    "https://raw.githubusercontent.com/saurabh-sublime/s2q-gmail-plugin/master/images/dat_costpermile.png";
  const DAT_PER_TRIP =
    "https://raw.githubusercontent.com/saurabh-sublime/s2q-gmail-plugin/master/images/dat_costpertrip.png";

  if (activeTmsRate?.name === "DAT" && rates?.perMile) {
    return DAT_PER_MILE;
  }
  if (activeTmsRate?.name === "DAT" && !rates?.perMile) {
    return DAT_PER_TRIP;
  }
  return "https://raw.githubusercontent.com/saurabh-sublime/s2q-gmail-plugin/master/images/noTmsRate.png";
}

function getActiveTmsImage() {
  const [getActiveTms, setActiveTms, deleteActiveTms] =
    useStorageState("activeTms");
  const activeTms = getActiveTms();
  const FULLCIRCLE =
    "https://raw.githubusercontent.com/saurabh-sublime/s2q-gmail-plugin/master/images/fullCircle.png";
  const MCLEOD =
    "https://raw.githubusercontent.com/saurabh-sublime/s2q-gmail-plugin/master/images/mcleod.png";

  if (activeTms?.name === "FullCircle") {
    return FULLCIRCLE;
  }
  if (activeTms?.name === "McLeod") {
    return MCLEOD;
  }
  return "https://raw.githubusercontent.com/saurabh-sublime/s2q-gmail-plugin/master/images/noTms.png";
}
function addRateSection(section, rates) {
  console.log("these are received rates", rates);
  const [getRateType, setRateType, deleteRateType] =
    useStorageState("rateType");
  const [getActiveTmsRate, setActiveTmsRate, deleteActiveTmsRate] =
    useStorageState("activeTmsRate");
  const activeTmsRate = getActiveTmsRate();

  section.addWidget(CardService.newDivider());
  var image = CardService.newImage()
    .setAltText("A nice image")
    .setImageUrl(getActiveRateTmsImage(activeTmsRate, rates));
  section.addWidget(image);
  var rateType = getRateType();
  var radioGroup = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    //.setTitle("Below option are of available rates")
    .setFieldName("checkbox_field")
    .addItem("Not Selected", "none", rateType == "none" && true)
    .addItem(
      `$${formatMoneySpecial(
        rates?.perMile?.lowUsd || rates?.perTrip?.lowUsd
      )} (Low)`,
      "low",
      rateType == "low" && true
    )
    .addItem(
      `$${formatMoneySpecial(
        rates?.perMile?.rateUsd || rates?.perTrip?.rateUsd
      )} (Rate)`,
      "rate",
      rateType == "rate" && true
    )
    .addItem(
      `$${formatMoneySpecial(
        rates?.perMile?.highUsd || rates?.perTrip?.highUsd
      )} (High)`,
      "high",
      rateType == "high" && true
    )
    .setOnChangeAction(
      CardService.newAction().setFunctionName(
        rates?.perMile ? "handleRateChange" : "doNothing"
      )
      //.setLoadIndicator(CardService.LoadIndicator.SPINNER)
    );
  section.addWidget(radioGroup);
  section.addWidget(
    CardService.newTextParagraph().setText(
      "Fuel Surcharge per mile: <b>$" +
        formatMoneySpecial(
          rates?.perMile
            ? rates.averageFuelSurchargePerMileUsd
            : rates.averageFuelSurchargePerTripUsd
        ) +
        "</b>"
    )
  );
  section.addWidget(CardService.newDivider());
}

function doNothing(event) {
  var newCard123 = createSingleQuoteFormCard(event);
  var nav123 = CardService.newNavigation().updateCard(newCard123);
  return CardService.newActionResponseBuilder().setNavigation(nav123).build();
}

function handleRateChange(event) {
  const [getRateType, setRateType, deleteRateType] =
    useStorageState("rateType");
  setRateType(event.formInput.checkbox_field);
  if (event.formInput.checkbox_field === "none") {
    return applyParsedRates(event);
    //return recalculateDetails(event);
  }
  const [getRates, setRates, deleteRates] = useStorageState("rates");
  let state = getState();
  const rates = getRates();
  const rateIndex = { low: "lowUsd", rate: "rateUsd", high: "highUsd" };
  if (rates.perMile) {
    var {
      margin,
      marginProfitBackup,
      totalCostBackup,
      costBackup,
      distance,
      costPerMileBackUp,
      equipment,
      distance,
    } = state;

    const costPerMile = Number(
      rates.perMile[rateIndex[event.formInput.checkbox_field]]
    );
    const fuelPerMile = Number(rates.averageFuelSurchargePerMileUsd);
    const totalCost = costPerMile * Number(distance);

    const finalCost =
      equipment.minimumCost > totalCost ? equipment.minimumCost : totalCost;
    const { marginProfit, totalCost: updatedTotalCost } =
      getCalculatedTotalCost(finalCost, margin, fuelPerMile, distance);

    state.costPerMile = costPerMile;
    state.fuelPerMile = fuelPerMile;
    state.cost = finalCost;
    state.marginProfit = marginProfit;
    state.totalCost = updatedTotalCost;
    setState(state);
    //var newCard123 = createSingleQuoteFormCard(event);
    //console.log("card built");
    //var nav123 = CardService.newNavigation().updateCard(newCard123);
    //return CardService.newActionResponseBuilder().setNavigation(nav123).build();
  }
}

function CreateImageHeader(section) {
  var image = CardService.newImage()
    .setAltText("S2Q Banner")
    .setImageUrl(
      "https://raw.githubusercontent.com/saurabh-sublime/s2q-gmail-plugin/master/images/s2q_header.png"
    );
  section.addWidget(image);
  return section;
}
function tmsAlreadyPosted() {
  return notify("TMS order has already been posted");
}

function logout() {
  PropertiesService.getUserProperties().deleteProperty("auths");
  PropertiesService.getUserProperties().deleteProperty("ACCESS_TOKEN");
  var newCard = createLoginCard().build();
  var nav = CardService.newNavigation().updateCard(newCard);
  return CardService.newActionResponseBuilder().setNavigation(nav).build();
}

function setLow(event) {
  const [getRateType, setRateType, deleteRateType] =
    useStorageState("rateType");
  setRateType("low");
  var newCard123 = createSingleQuoteFormCard(event);
  console.log("card built");
  var nav123 = CardService.newNavigation().updateCard(newCard123);
  return CardService.newActionResponseBuilder().setNavigation(nav123).build();
}

function setRate(event) {
  const [getRateType, setRateType, deleteRateType] =
    useStorageState("rateType");
  setRateType("rate");
  var newCard123 = createSingleQuoteFormCard(event);
  console.log("card built");
  var nav123 = CardService.newNavigation().updateCard(newCard123);
  return CardService.newActionResponseBuilder().setNavigation(nav123).build();
}

function setHigh(event) {
  const [getRateType, setRateType, deleteRateType] =
    useStorageState("rateType");
  setRateType("high");
  var newCard123 = createSingleQuoteFormCard(event);
  console.log("card built");
  var nav123 = CardService.newNavigation().updateCard(newCard123);
  return CardService.newActionResponseBuilder().setNavigation(nav123).build();
}

function rebuildCard(event) {
  var newCard123 = createSingleQuoteFormCard(event);
  console.log("card built");
  var nav123 = CardService.newNavigation().updateCard(newCard123);
  return CardService.newActionResponseBuilder().setNavigation(nav123).build();
}

const setRatesBackup = () => {
  const [getBuRates, setBuRates, deleteBuRates] = useStorageState("buRates");
  const state = getState();
  setBuRates({
    costPerMile: state.costPerMile,
    fuelPerMile: state.fuelPerMile,
  });
};

const getRatesBackup = () => {
  const [getBuRates, setBuRates, deleteBuRates] = useStorageState("buRates");
  return getBuRates();
};

const deleteRatesBackup = () => {
  const [getBuRates, setBuRates, deleteBuRates] = useStorageState("buRates");
  deleteBuRates();
};

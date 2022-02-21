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
  console.log("it worked until here");
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
    if (variable === "equipmentName") {
      recalculateDetails(event);
    }
  }
  var newCard123 = createSingleQuoteFormCard(event);
  console.log("card built");
  var nav123 = CardService.newNavigation().updateCard(newCard123);
  return CardService.newActionResponseBuilder().setNavigation(nav123).build();
}

function rebuild(event) {
  CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation().pushCard(createSingleQuoteFormCard(event))
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
  if (suggestions?.length > 0) {
    thisTextWidget.setSuggestions(
      CardService.newSuggestions().addSuggestions(suggestions)
    );
  }
  thisTextWidget.setOnChangeAction(onInputChangeAction);
  section.addWidget(thisTextWidget);
}

function getButtonWidget(buttonName, methodName, type, color) {
  var buttonAction = CardService.newAction().setFunctionName(methodName);
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
    .setValueInMsSinceEpoch(Date.now())
    .setTimeZoneOffsetInMins(-5 * 60)
    .setOnChangeAction(
      CardService.newAction().setFunctionName("handleDateTimeChange")
    );
  section.addWidget(pickupTimeWidget);

  var deliveryTimeWidget = CardService.newDateTimePicker()
    .setTitle("Delivery time")
    .setFieldName("deliveryTime")
    .setValueInMsSinceEpoch(Date.now())
    .setTimeZoneOffsetInMins(-5 * 60)
    .setOnChangeAction(
      CardService.newAction().setFunctionName("handleDateTimeChange")
    );
  section.addWidget(deliveryTimeWidget);
  const [getRates, setRates, deleteRates] = useStorageState("rates");
  if (getRates()) {
    putTextWidget(section, "costPerMile", "For TMS Rates", state?.costPerMile);
    addRateSection(section, getRates());
  }
  putTextWidget(section, "costPerMile", "Cost p/m", state?.costPerMile);
  putTextWidget(section, "fuelPerMile", "Fuel Srchrge p/m", state?.fuelPerMile);
  putTextWidget(section, "distance", "Distance (Miles)", state?.distance);
  putTextWidget(
    section,
    "speed",
    "Speed (MPH)",
    state?.equipment?.mphTransitTime
  );
  putTextWidget(section, "transitTime", "Transit Time", state?.transitTime);
  putTextWidget(section, "marginProfit", "Margin", state?.marginProfit);
  putTextWidget(section, "margin", "Margin %", state?.margin, state);
  putTextWidget(section, "cost", "Cost", state?.cost);
  putTextWidget(section, "totalCost", "Total Cost", state?.totalCost);

  section.addWidget(
    getButtonWidget("Recalculate", "recalculateDetails", "FILLED", "#a2d45e")
  );
  var buttonSet = CardService.newButtonSet()
    .addButton(getButtonWidget("Save Draft", "saveDraft", "FILLED", "#2f3d8a"))
    .addButton(getButtonWidget("Send Email", "sendEmail", "FILLED", "#2f3d8a"));
  section.addWidget(buttonSet);
  section.addWidget(CardService.newDivider());
  var image = CardService.newImage()
    .setAltText("A nice image")
    .setImageUrl(
      "https://raw.githubusercontent.com/saurabh-sublime/s2q-gmail-plugin/master/images/mcleod.png"
    );
  section.addWidget(image);
  var tmsButtonSet = CardService.newButtonSet()
    .addButton(
      getButtonWidget(
        "Create Order",
        "createTmsOrder",
        "FILLED",
        isOrderPosted ? "#c2c2c2" : "#2f3d8a"
      )
    )
    .addButton(
      getButtonWidget(
        "Create & Post Order",
        "sendTmsOrder",
        "FILLED",
        isOrderPosted ? "#c2c2c2" : "#2f3d8a"
      )
    );
  section.addWidget(tmsButtonSet);
  section.addWidget(CardService.newDivider());
  return section;
}

function addRateSection(section, rates) {
  console.log("these are received rates", rates);
  const [getRateType, setRateType, deleteRateType] =
    useStorageState("rateType");

  section.addWidget(CardService.newDivider());
  var image = CardService.newImage()
    .setAltText("A nice image")
    .setImageUrl(
      "https://raw.githubusercontent.com/saurabh-sublime/s2q-gmail-plugin/master/images/dat_costpermile.png"
    );
  section.addWidget(image);
  var rateType = getRateType();
  var radioGroup = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    //.setTitle("Below option are of available rates")
    .setFieldName("checkbox_field")
    .addItem("Not Selected", "none", rateType == "none" && true)
    .addItem(`$${rates.perMile.lowUsd} (Low)`, "low", rateType == "low" && true)
    .addItem(
      `$${rates.perMile.rateUsd} (Rate)`,
      "rate",
      rateType == "rate" && true
    )
    .addItem(
      `$${rates.perMile.highUsd} (High)`,
      "high",
      rateType == "high" && true
    )
    .setOnChangeAction(
      CardService.newAction()
        .setFunctionName("handleRateChange")
        .setLoadIndicator(CardService.LoadIndicator.SPINNER)
    );
  section.addWidget(radioGroup);
  section.addWidget(
    CardService.newTextParagraph().setText(
      "Fuel Surcharge per mile: <b>$" +
        rates.averageFuelSurchargePerMileUsd +
        "</b>"
    )
  );
  section.addWidget(CardService.newDivider());
}

function handleRateChange(event) {
  const [getRateType, setRateType, deleteRateType] =
    useStorageState("rateType");
  setRateType(event.formInput.checkbox_field);
  const [getRates, setRates, deleteRates] = useStorageState("rates");
  let state = getState();
  const rates = getRates();
  const rateIndex = { low: "lowUsd", rate: "rateUsd", high: "highUsd" };
  if (rates.perMile) {
    state.costPerMile =
      rates.perMile[rateIndex[event.formInput.checkbox_field]];
    state.fuelPerMile = rates.averageFuelSurchargePerMileUsd;
    setState(state);
    var newCard123 = createSingleQuoteFormCard(event);
    console.log("card built");
    var nav123 = CardService.newNavigation().updateCard(newCard123);
    return CardService.newActionResponseBuilder().setNavigation(nav123).build();
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

function logout() {
  PropertiesService.getScriptProperties().deleteProperty("auths");
  PropertiesService.getScriptProperties().deleteProperty("ACCESS_TOKEN");
  var newCard = createLoginCard().build();
  var nav = CardService.newNavigation().pushCard(newCard);
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

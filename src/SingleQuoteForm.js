function createSingleQuoteFormCard(event) {
  var card = CardService.newCardBuilder();
  var logoutButton = CreateLogoutButton(CardService.newCardSection());
  card.addSection(logoutButton);
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
      "<b> <strong>Pick up request: </strong>" + subject + "</b>"
    )
  );
  subjectAndSenderSection.addWidget(
    CardService.newTextParagraph().setText(
      "<b> <strong>Sender email: </strong>" + updatedFrom + "</b>"
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
  //state[variable] = event.formInput[variable];
  //console.log(getState());
  //console.log("the real state1", getState().locationFrom);
  var tempState = getState();
  tempState[variable] = event.formInput[variable];
  if (calcFunctions[variable]) {
    updatedTempState = calcFunctions[variable](
      event.formInput[variable],
      tempState
    );
    setState(updatedTempState);
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
    });
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

var vx;

/* function inputChanged123(event) {
  var variable = event.parameters.variable;
  vx = "value changed";
  console.log("this", event);
  state[variable] = event.formInput[variable];
  var newCard123 = createSingleQuoteFormCard(event, state);
  var nav123 = CardService.newNavigation().updateCard(newCard123);
  //return;
  //var nav = CardService.newNavigation().pushCard(newCard);
  return CardService.newActionResponseBuilder().setNavigation(nav123).build();
  //payload();
} */

function getLocationSuggestionList() {
  const state = getState();
  const locationFromList = [];
  const locationToList = [];
}
function createInputFormSection(section, event) {
  var state = getState();
  fetchRates(state.locationFrom, state.locationTo, state.equipment);
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
    .setValueInMsSinceEpoch(1514775600)
    .setTimeZoneOffsetInMins(-5 * 60)
    .setOnChangeAction(
      CardService.newAction().setFunctionName("handleDateTimeChange")
    );
  section.addWidget(pickupTimeWidget);

  var deliveryTimeWidget = CardService.newDateTimePicker()
    .setTitle("Delivery time")
    .setFieldName("deliveryTime")
    .setValueInMsSinceEpoch(1514775600)
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
  // for (var i = 0; i < inputNames.length; i++) {
  //   var widget = CardService.newTextInput()
  //     .setFieldName(inputNames[i])
  //     .setTitle(inputNames[i]);
  //   if (opt_prefills && opt_prefills[i]) {
  //     widget.setValue(opt_prefills[i]);
  //   }
  //   section.addWidget(widget);
  // }
  return section;
}

function addRateSection(section, rates) {
  console.log("these are received rates", rates);
  const [getRateType, setRateType, deleteRateType] =
    useStorageState("rateType");

  section.addWidget(CardService.newDivider());
  section.addWidget(CardService.newTextParagraph().setText("<b>TMS Rates</b>"));
  section.addWidget(
    CardService.newTextParagraph().setText("<b>Rate Service:</b>" + "DAT")
  );
  const rateType = getRateType();
  console.log("this is rateType", rateType);
  var buttonSet = CardService.newButtonSet()
    .addButton(
      getButtonWidget(
        "$10 (Low)",
        "setLow",
        rateType == "low" && "FILLED",
        "#2f3d8a",
        "#f8f8f8"
      )
    )
    .addButton(
      getButtonWidget(
        "$20 (Rate)",
        "setRate",
        rateType == "rate" && "FILLED",
        "#2f3d8a"
      )
    )
    .addButton(
      getButtonWidget(
        "$30 (High)",
        "setHigh",
        rateType == "high" && "FILLED",
        "#2f3d8a"
      )
    );
  section.addWidget(buttonSet);
  section.addWidget(
    CardService.newTextParagraph().setText(
      "<b>Fuel Surcharge per mile: </b>" + "123"
    )
  );
  section.addWidget(CardService.newDivider());
}

function CreateLogoutButton(section) {
  var logoutAction = CardService.newAction().setFunctionName("logout");
  var button = CardService.newTextButton()
    .setText("Logout")
    .setOnClickAction(logoutAction);

  section.addWidget(button);
  return section;
}

function logout() {
  PropertiesService.getScriptProperties().deleteProperty("auths");
  PropertiesService.getScriptProperties().deleteProperty("ACCESS_TOKEN");
  var newCard = createLoginCard().build();
  var nav = CardService.newNavigation().pushCard(newCard);
  //return;
  //var nav = CardService.newNavigation().pushCard(newCard);
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

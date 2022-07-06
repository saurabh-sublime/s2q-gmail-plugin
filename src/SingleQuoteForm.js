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

//Function to rebuild the card
function rebuild(event) {
  CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation().updateCard(createSingleQuoteFormCard(event))
    )
    .build();
}

//Function to create the Text Widget
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

//Function to create Button Widget
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

//Function to create plugin form
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
    .setFieldName("pickupTimestamp")
    .setValueInMsSinceEpoch(state?.pickupTime)
    .setTimeZoneOffsetInMins(-5 * 60)
    .setOnChangeAction(
      CardService.newAction()
        .setFunctionName("onInputChange")
        .setParameters({
          variable: "pickupTimestamp",
        })
        .setLoadIndicator(CardService.LoadIndicator.SPINNER)
    );
  section.addWidget(pickupTimeWidget);

  var deliveryTimeWidget = CardService.newDateTimePicker()
    .setTitle("Delivery time")
    .setFieldName("deliveryTimestamp")
    .setValueInMsSinceEpoch(state?.deliveryTime)
    .setTimeZoneOffsetInMins(-5 * 60)
    .setOnChangeAction(
      CardService.newAction()
        .setFunctionName("onInputChange")
        .setParameters({
          variable: "deliveryTimestamp",
        })
        .setLoadIndicator(CardService.LoadIndicator.SPINNER)
    );

  section.addWidget(deliveryTimeWidget);
  const [getRates, setRates, deleteRates] = useStorageState("rates");
  // Rate section being added
  if (getRates()) {
    addRateSection(section, getRates());
    section.addWidget(CardService.newDivider());
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
    "fuelSurchargePercentage",
    "Fuel Srchrge %",

    Number(state?.fuelSurchargePercentage)?.toFixed(2)
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
  putTextWidget(
    section,
    "cost",
    "Truck Cost ($)",
    formatMoneySpecial(state?.cost)
  );
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
  putTextWidget(section, "comment", "Comment", state?.comment);

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

//Function to select Active Rate TMS Image
function getActiveRateTmsImage(activeTmsRate, rates) {
  const DAT_PER_MILE =
    "https://raw.githubusercontent.com/saurabh-sublime/s2q-gmail-plugin/master/images/dat_costpermile.png";
  const DAT_PER_TRIP =
    "https://raw.githubusercontent.com/saurabh-sublime/s2q-gmail-plugin/master/images/dat_costpertrip.png";
  const LL_PER_TRIP =
    "https://raw.githubusercontent.com/saurabh-sublime/s2q-gmail-plugin/master/images/ll_costPerTrip.png";

  if (activeTmsRate?.name === "DAT" && rates?.perMile) {
    return DAT_PER_MILE;
  }
  if (activeTmsRate?.name === "DAT" && !rates?.perMile) {
    return DAT_PER_TRIP;
  }
  if (activeTmsRate?.name === "Logistical Lab" && !rates?.perMile) {
    return LL_PER_TRIP;
  }
  return "https://raw.githubusercontent.com/saurabh-sublime/s2q-gmail-plugin/master/images/noTmsRate.png";
}

//Function to select Active TMS Image
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

//Function to check whether rate is selected based on radio button input
function isRateSelectedFunc(rate, selectedRate, thisRateType) {
  if (
    rate?.rateService === selectedRate?.rate?.rateService &&
    thisRateType === selectedRate?.rateType
  ) {
    console.log(
      "returning  true",
      rate?.rateService,
      selectedRate?.rate?.rateService,
      thisRateType,
      selectedRate?.rateType
    );
    return true;
  }
  console.log(
    "returning  false",
    rate?.rateService,
    selectedRate?.rate?.rateService,
    thisRateType,
    selectedRate?.rateType
  );
  return false;
}

////Function to check whether rate is found
const isRateFound = (rate) => {
  const isRateFound =
    rate?.perMile?.lowUsd ||
    rate?.perTrip?.lowUsd ||
    rate?.perMile?.rateUsd ||
    rate?.perTrip?.rateUsd ||
    rate?.perMile?.highUsd ||
    rate?.perTrip?.highUsd;
  return isRateFound;
};

//Function to create rate section
function addRateSection(section, rates) {
  const [getSelectedRate, setSelectedRate, deleteSelectedRate] =
    useStorageState("selectedRate");
  const selectedRate = getSelectedRate();

  const [getActiveTmsRate, setActiveTmsRate, deleteActiveTmsRate] =
    useStorageState("activeTmsRate");
  const activeTmsRate = getActiveTmsRate();

  section.addWidget(CardService.newDivider());

  var image = CardService.newImage()
    .setAltText("A nice image")
    .setImageUrl(getActiveRateTmsImage(activeTmsRate, rates));
  section.addWidget(image);

  rates.map((rate) => {
    section.addWidget(
      CardService.newTextParagraph().setText(rate?.rateService)
    );
    if (isRateFound(rate)) {
      const addRadioButton1 = (item, rate) => {
        if (rate?.perMile?.lowUsd || rate?.perTrip?.lowUsd) {
          const changedSelectedRate = JSON.stringify({
            rate: rate,
            rateType: "low",
          });
          const isRateSelected =
            isRateSelectedFunc(rate, selectedRate, "low") && true;
          console.log("this", isRateSelected);
          item.addItem(
            `$${formatMoneySpecial(
              rate?.perMile?.lowUsd || rate?.perTrip?.lowUsd
            )} (Low)`,
            changedSelectedRate,
            isRateSelected
          );
        }
        if (rate?.perMile?.rateUsd || rate?.perTrip?.rateUsd) {
          const changedSelectedRate = JSON.stringify({
            rate: rate,
            rateType: "rate",
          });
          const isRateSelected =
            isRateSelectedFunc(rate, selectedRate, "rate") && true;
          console.log("this", isRateSelected);
          item.addItem(
            `$${formatMoneySpecial(
              rate?.perMile?.rateUsd || rate?.perTrip?.rateUsd
            )} (Rate)`,
            changedSelectedRate,
            isRateSelected
          );
        }
        if (rate?.perMile?.highUsd || rate?.perTrip?.highUsd) {
          const changedSelectedRate = JSON.stringify({
            rate: rate,
            rateType: "high",
          });
          const isRateSelected =
            isRateSelectedFunc(rate, selectedRate, "high") && true;
          console.log("this", isRateSelected);
          item.addItem(
            `$${formatMoneySpecial(
              rate?.perMile?.highUsd || rate?.perTrip?.highUsd
            )} (High)`,
            changedSelectedRate,
            isRateSelected
          );
          0;
        }

        const nullRate = JSON.stringify({ rate: null, rateType: "none" });
        const isNullRate = !selectedRate || selectedRate?.rateType === "none";

        console.log("selected rate", selectedRate);
        item.addItem("Not Selected", nullRate, isNullRate);
      };

      var radioGroup = CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.RADIO_BUTTON)
        .setFieldName("checkbox_field");

      addRadioButton1(radioGroup, rate);

      radioGroup.setOnChangeAction(
        CardService.newAction().setFunctionName(
          rate?.perMile ? "handleRateChange" : "handleRateChangePerTrip"
        )
      );

      section.addWidget(radioGroup);
      if (rate?.perMile) {
        section.addWidget(
          CardService.newTextParagraph().setText(
            "Fuel Surcharge per mile: <b>$" +
              formatMoneySpecial(rate?.averageFuelSurchargePerMileUsd + "</b>")
          )
        );
      }
      section.addWidget(CardService.newDivider());
    } else {
      section.addWidget(
        CardService.newTextParagraph().setText("No rate data found")
      );
    }
  });
}

function doNothing(event) {
  var newCard123 = createSingleQuoteFormCard(event);
  var nav123 = CardService.newNavigation().updateCard(newCard123);
  return CardService.newActionResponseBuilder().setNavigation(nav123).build();
}

function handleRateChange(event) {
  const selectedRate = JSON.parse(event?.formInput?.checkbox_field);

  const [getSelectedRate, setSelectedRate, deleteSelectedRate] =
    useStorageState("selectedRate");
  setSelectedRate(selectedRate);

  if (selectedRate?.rateType === "none") {
    return applyParsedRates(event);
  }

  let state = getState();

  const rate = selectedRate?.rate;

  const rateIndex = { low: "lowUsd", rate: "rateUsd", high: "highUsd" };

  if (rate.perMile) {
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

    const costPerMile = Number(rate.perMile[rateIndex[selectedRate.rateType]]);
    const fuelPerMile = Number(rate.averageFuelSurchargePerMileUsd);
    const totalCost = costPerMile * Number(distance);

    const finalCost =
      equipment.minimumCost > totalCost ? equipment.minimumCost : totalCost;
    const { marginProfit, totalCost: updatedTotalCost } =
      getCalculatedTotalCost(finalCost, margin, fuelPerMile, distance);

    state.costPerMile = costPerMile;
    state.fuelPerMile = fuelPerMile;
    state.cost = finalCost;
    state.marginProfit = marginProfit;
    state.totalTruckCost = calculateTotalTruckCost(
      costPerMile,
      fuelPerMile,
      distance,
      equipment?.minimumCost
    );
    state.totalCost = updatedTotalCost;
    setState(state);
  }
}

function handleRateChangePerTrip(event) {
  const selectedRate = JSON.parse(event?.formInput?.checkbox_field);

  const [getSelectedRate, setSelectedRate, deleteSelectedRate] =
    useStorageState("selectedRate");
  setSelectedRate(selectedRate);

  if (selectedRate?.rateType === "none") {
    return applyParsedRates(event);
  }

  const [getRates, setRates, deleteRates] = useStorageState("rates");

  let state = getState();

  const rate = selectedRate.rate;

  const rateIndex = { low: "lowUsd", rate: "rateUsd", high: "highUsd" };

  var {
    margin,
    marginProfitBackup,
    totalCostBackup,
    costBackup,
    fuelPerMile,
    distance,
    costPerMileBackUp,
    equipment,
    distance,
  } = state;

  const totalCost = Number(rate.perTrip[rateIndex[selectedRate.rateType]]);

  const finalCost =
    equipment.minimumCost > totalCost ? equipment.minimumCost : totalCost;

  const { marginProfit, totalCost: updatedTotalCost } = getCalculatedTotalCost(
    finalCost,
    margin,
    0,
    distance
  );

  state.cost = finalCost;
  state.totalTruckCost = finalCost;
  state.fuelPerMile = 0;
  state.fuelSurchargePercentage = 0;
  state.marginProfit = marginProfit;
  state.totalCost = updatedTotalCost;
  setState(state);
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

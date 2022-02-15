/* function createSingleQuoteFormCard(event, state) {
  var card = CardService.newCardBuilder();
  //card.setHeader(CardService.newCardHeader().setTitle("Login"));
  var logoutButton = CreateLogoutButton(CardService.newCardSection());
  card.addSection(logoutButton);
  var message = getCurrentMessage(event);
  var subject = message.getSubject();
  var fromEmail = message.getFrom();

  var subjectAndSenderSection = CardService.newCardSection();
  subjectAndSenderSection.addWidget(
    CardService.newTextParagraph().setText(
      "<b> <strong>Pick up request: </strong>" + subject + "</b>"
    )
  );
  subjectAndSenderSection.addWidget(
    CardService.newTextParagraph().setText(
      "<b> <strong>Sender email: </strong>" + fromEmail + "</b>"
    )
  );
  card.addSection(subjectAndSenderSection);

  var formSection = createInputFormSection(
    CardService.newCardSection(),
    event,
    state
  );
  card.addSection(formSection);
  //create button for reply to message

  return card.build();
}

function addSuggestions(array) {
  var suggestions = CardService.newSuggestions();
  array.map(function (item) {
    suggestions.addSuggestion(item);
  });
  return suggestions;
}

function putTextWidget(section, fieldName, title, value, suggestions) {
  var thisTextWidget = CardService.newTextInput()
    .setFieldName(fieldName)
    .setTitle(title)
    .setValue(value);
  section.addWidget(thisTextWidget);
}

function putButtonWidget(section, buttonName, methodName) {
  var buttonAction = CardService.newAction().setFunctionName(methodName);
  var button = CardService.newTextButton()
    .setText(buttonName)
    .setOnClickAction(buttonAction);
  section.addWidget(button);
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

var vx;
function inputChanged123(event) {
  var variable = event.parameters.variable;
  vx = "value changed";
  console.log("this", event);
  state[variable] = event.formInput[variable];
  //payload();
}

function createInputFormSection(section, event, state) {
  parseEmail(event);
  vx = "123";

  var equipmentWidget = CardService.newTextInput()
    .setFieldName("equipment")
    .setSuggestions(addSuggestions(equipmentSuggestions))
    .setTitle("Equipment")
    .setValue(state?.equipment?.name);

  section.addWidget(equipmentWidget);

  var pickupWidget = CardService.newTextInput()
    .setFieldName("locationFrom")
    .setTitle("Pickup")
    .setValue(state.locationFrom);
  var inputChangedAction123 = CardService.newAction()
    .setFunctionName("inputChanged123")
    .setParameters({
      variable: "locationFrom",
    });
  pickupWidget.setOnChangeAction(inputChangedAction123);
  section.addWidget(pickupWidget);

  var deliveryWidget = CardService.newTextInput()
    .setFieldName("delivery")
    .setTitle("Delivery")
    .setValue(vx);
  section.addWidget(deliveryWidget);
  var pickupTimeWidget = CardService.newDateTimePicker()
    .setTitle("Pickup time")
    .setFieldName("pickupTime")
    // Set default value as Jan 1, 2018, 3:00 AM UTC. Either a number or string is acceptable.
    .setValueInMsSinceEpoch(1514775600)
    // EDT time is 5 hours behind UTC.
    .setTimeZoneOffsetInMins(-5 * 60)
    .setOnChangeAction(
      CardService.newAction().setFunctionName("handleDateTimeChange")
    );

  section.addWidget(pickupTimeWidget);
  var deliveryTimeWidget = CardService.newDateTimePicker()
    .setTitle("Delivery time")
    .setFieldName("deliveryTime")
    // Set default value as Jan 1, 2018, 3:00 AM UTC. Either a number or string is acceptable.
    .setValueInMsSinceEpoch(1514775600)
    // EDT time is 5 hours behind UTC.
    .setTimeZoneOffsetInMins(-5 * 60)
    .setOnChangeAction(
      CardService.newAction().setFunctionName("handleDateTimeChange")
    );

  section.addWidget(deliveryTimeWidget);

  putTextWidget(section, "costPerMile", "Cost p/m", "");
  putTextWidget(section, "fuelSurchargePerMile", "Fuel Srchrge p/m", "");
  putTextWidget(section, "distance", "Distance (Miles)", "");
  putTextWidget(section, "speed", "Speed (MPH)", "");
  putTextWidget(section, "transitTime", "Transit Time", "");
  putTextWidget(section, "margin", "Margin", "");
  putTextWidget(section, "marginPercentage", "Margin %", "");
  putTextWidget(section, "cost", "Cost", "");
  putTextWidget(section, "totalCost", "Total Cost", "");

  section.addWidget(
    getButtonWidget("Recalculate", "recalculate", "FILLED", "#a2d45e")
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

function recalculate(event) {
  console.log("recalculating");
  console.log(event);
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
 */

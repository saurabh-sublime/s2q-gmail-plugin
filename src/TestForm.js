function createTestFormCard(event, initialData) {
  var card = CardService.newCardBuilder();
  //card.setHeader(CardService.newCardHeader().setTitle("Login"));
  var logoutButton = CreateLogoutButton(CardService.newCardSection());
  card.addSection(logoutButton);
  var formSection = createTestFormSection(
    CardService.newCardSection(),
    event,
    initialData
  );
  card.addSection(formSection);
  //create button for reply to message

  return card.build();
}

function inputChanged12345(event) {
  var revisedData = {
    pickup: event.formInput.pickup,
    delivery: event.formInput.pickup,
  };
  var newCard123 = createTestFormCard(event, revisedData);
  var nav123 = CardService.newNavigation().updateCard(newCard123);
  //return;
  //var nav = CardService.newNavigation().pushCard(newCard);
  return CardService.newActionResponseBuilder().setNavigation(nav123).build();
}

function createTestFormSection(section, event, initialData) {
  var pickupWidget = CardService.newTextInput()
    .setFieldName("pickup")
    .setTitle("Pickup")
    .setValue(initialData.pickup);
  var inputChangedAction12345 =
    CardService.newAction().setFunctionName("inputChanged12345");
  pickupWidget.setOnChangeAction(inputChangedAction12345);
  section.addWidget(pickupWidget);

  var deliveryWidget = CardService.newTextInput()
    .setFieldName("delivery")
    .setTitle("Delivery")
    .setValue(initialData.delivery);
  section.addWidget(deliveryWidget);
  return section;
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

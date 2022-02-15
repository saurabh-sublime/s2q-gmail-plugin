function createLoginCard() {
  var card = CardService.newCardBuilder();
  //card.setHeader(CardService.newCardHeader().setTitle("Login"));
  var formSection = createLoginFormSection(CardService.newCardSection());
  card.addSection(formSection);
  var loginButton = CreateLoginButton(CardService.newCardSection());
  card.addSection(loginButton);
  return card;
}

function createLoginFormSection(section) {
  var emailWidget = CardService.newTextInput()
    .setFieldName("email")
    .setTitle("Email")
    .setValue("");
  var inputChangedAction =
    CardService.newAction().setFunctionName("inputChanged");
  emailWidget.setOnChangeAction(inputChangedAction);
  section.addWidget(emailWidget);

  var passwordWidget = CardService.newTextInput()
    .setFieldName("password")
    .setTitle("Password")
    .setValue("");
  section.addWidget(passwordWidget);

  return section;
}

function CreateLoginButton(section) {
  var loginAction = CardService.newAction().setFunctionName("login");
  var button = CardService.newTextButton()
    .setText("login")
    .setOnClickAction(loginAction);
  section.addWidget(button);
  return section;
}

function inputChanged(e) {
  email = "entered email";
  Logger.log("logging in");
}

function login(event) {
  var userProperties = PropertiesService.getUserProperties();
  var authData = loginWithHttp(event);
  //console.log(loggedInData);
  userProperties.setProperty("ACCESS_TOKEN", authData.accessToken);
  PropertiesService.getScriptProperties().setProperty(
    "ACCESS_TOKEN",
    authData?.accessToken
  );
  PropertiesService.getScriptProperties().setProperty(
    "REFRESH_TOKEN",
    authData?.refreshToken
  );
  fetchEquipmentList();
  parseEmail(event);

  var message = getCurrentMessage1(event);
  var subject = message.getSubject();
  var from = message.getFrom();
  var body = message.getPlainBody();
  var messageId = message.getId();
  //var newCard = createInputFormCard();
  //var nav = CardService.newNavigation().pushCard(newCard);
  //createInputFormCard()
  var newCard = createSingleQuoteFormCard(event);
  var nav = CardService.newNavigation().updateCard(newCard);
  //return;
  //var nav = CardService.newNavigation().pushCard(newCard);
  return CardService.newActionResponseBuilder().setNavigation(nav).build();
}

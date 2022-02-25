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

function login(event) {
  var userProperties = PropertiesService.getUserProperties();
  try {
    var authData = loginWithHttp(event);
    //userProperties.setProperty("ACCESS_TOKEN", authData.accessToken);
    PropertiesService.getUserProperties().setProperty(
      "ACCESS_TOKEN",
      authData?.accessToken
    );
    console.log("this is auth data", authData);
    PropertiesService.getUserProperties().setProperty(
      "REFRESH_TOKEN",
      authData?.refreshToken
    );
    getActiveTms();
    fetchEquipmentList();
    parseEmail(event);
    checkTmsOrder(event);
    var newCard = createSingleQuoteFormCard(event);
    var nav = CardService.newNavigation().updateCard(newCard);
    return CardService.newActionResponseBuilder().setNavigation(nav).build();
  } catch (e) {
    console.log("Error while logging in", e);
    return notify("Error while logging in");
  }
}

function refreshTokens1(event) {
  try {
    var authData = refreshTokenswithHttp(event);
    //userProperties.setProperty("ACCESS_TOKEN", authData.accessToken);
    PropertiesService.getUserProperties().setProperty(
      "ACCESS_TOKEN",
      authData?.accessToken
    );
    PropertiesService.getUserProperties().setProperty(
      "REFRESH_TOKEN",
      authData?.refreshToken
    );
    getActiveTms();
    fetchEquipmentList();
    parseEmail(event);
    fetchRates(state.locationFrom, state.locationTo, state.equipment);
    checkTmsOrder(event);
    card = createSingleQuoteFormCard(event);
    return card;
    var newCard = createSingleQuoteFormCard(event);
    var nav = CardService.newNavigation().updateCard(newCard);
    return CardService.newActionResponseBuilder().setNavigation(nav).build();
  } catch (e) {
    return notify("Error while refreshing token");
  }
}

//refreshTokenswithHttp

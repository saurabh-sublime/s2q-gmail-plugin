function createSettingsCard() {
  var card = CardService.newCardBuilder();
  var imageHeader = CreateImageHeader(CardService.newCardSection());
  var authButton = CreateAuthButton(CardService.newCardSection());
  var cancelButton = CreateCancelButton(CardService.newCardSection());
  card.addSection(imageHeader);
  card.addSection(authButton);
  card.addSection(cancelButton);
  return card.build();
}

function CreateAuthButton(section) {
  var accessToken =
    PropertiesService.getUserProperties().getProperty("ACCESS_TOKEN");
  if (accessToken) {
    section.addWidget(getButtonWidget("Logout", "logout", "FILLED", "#2f3d8a"));
  } else {
    section.addWidget(getButtonWidget("Login", "logout", "FILLED", "#2f3d8a"));
  }
  return section;
}

function CreateCancelButton(section) {
  section.addWidget(getButtonWidget("Cancel", "null", "FILLED", "#a2d45e"));
  return section;
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

// Settings Card for Login/Logout Button
function settings() {
  var newCard = createSettingsCard().build();
  var nav = CardService.newNavigation().updateCard(newCard);
  return CardService.newActionResponseBuilder().setNavigation(nav).build();
}

function navigateToLogin(event) {}

/* {
  "label": "S2Q Website",
  "openLink": "https://stg.speedtoquote.com/"
}, */

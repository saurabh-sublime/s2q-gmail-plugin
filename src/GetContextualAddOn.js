/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Returns the contextual add-on data that should be rendered for
 * the current e-mail thread. This function satisfies the requirements of
 * an 'onTriggerFunction' and is specified in the add-on's manifest.
 *
 * @param {Object} event Event containing the message ID and other context.
 * @returns {Card[]}
 */

//"primaryColor": "#41f470",
//"secondaryColor": "#94f441"
var state = {
  locationFrom: "",
  locationTo: "",
  cost: 0,
  totalCost: 0,
  marginProfit: 0,
  margin: 0,
  costPerMile: 0,
  costPerMileBackUp: "",
  fuelPerMile: 0,
  fuelPerMileBackup: 0,
  distance: "",
  distanceBackup: "",
  weight: 0,
  dimension: "",
  transitTime: "",
  speed: 0,
  equipmentName: "",
  equipment: {
    id: "",
    name: "",
    template: "",
    mphTransitTime: "",
    mphTransitTimeBackup: "",
    minimumCost: "",
  },
};
var isInitiated;
function setState(state) {
  PropertiesService.getUserProperties().setProperty(
    "STATE1",
    JSON.stringify(state)
  );
}

function getState() {
  var state = PropertiesService.getUserProperties().getProperty("STATE1");
  return JSON.parse(state);
}

function getContextualAddOn(event) {
  console.log("this is the new code");
  state.costPerMile = "changed";
  setState(state);
  deleteRootProperty();
  setRootProperty({});
  PropertiesService.getUserProperties().deleteProperty("isInitiated");
  isInitiated = false;
  var userProperties = PropertiesService.getUserProperties();
  var units = userProperties.getProperty("AUTH_DATA");
  var units1 = PropertiesService.getScriptProperties().getProperty("auths");
  var accessToken =
    PropertiesService.getScriptProperties().getProperty("ACCESS_TOKEN");
  var message = getCurrentMessage(event);
  var subject = message.getSubject();
  var from = message.getFrom();
  var body = message.getPlainBody();
  var meesageId = message.getId();
  var fromEmail = message.getFrom();
  // var id=message.get
  if (!PropertiesService.getUserProperties().getProperty("isInitiated")) {
    parseEmail(event);
    fetchEquipmentList();
    console.log("parsing again");
  }
  var card;
  //console.log("this", units1?.access?.token);
  if (accessToken) {
    card = createSingleQuoteFormCard(event);
    return card;
  } else {
    card = createLoginCard(from, subject, body, meesageId);
    return [card.build()];
  }
}

/**
 * Retrieves the current message given an action event object.
 * @param {Event} event Action event object
 * @return {Message}
 */
function getCurrentMessage(event) {
  if (event?.gmail) {
    var accessToken = event.gmail?.accessToken;
    var messageId = event.gmail?.messageId;
    GmailApp.setCurrentMessageAccessToken(accessToken);
    return GmailApp.getMessageById(messageId);
  }
}

function getCurrentMessage1(event) {
  var accessToken = event.gmail?.accessToken;
  var messageId = event.gmail?.messageId;
  GmailApp.setCurrentMessageAccessToken(accessToken);
  return GmailApp.getMessageById(messageId);
}

function updateStateWithParsedData(parsedData) {
  var state = getState();
  for (var i in state) {
    if (parsedData[i]) {
      state[i] = parsedData[i];
    }
  }
  setState(state);
}

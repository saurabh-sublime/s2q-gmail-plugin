
/**
 * Creates the main card users see with form inputs to log expenses.
 * Form can be prefilled with values.
 *
 * @param {String[]} opt_prefills Default values for each input field.
 * @param {String} opt_status Optional status displayed at top of card.
 * @returns {Card}
 */



function createExpensesCard(from,subject,body,messageId, opt_status,) {
  var card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader().setTitle('Email Details'));

  if (opt_status) {
    if (opt_status.indexOf('Error: ') == 0) {
      opt_status = '<font color=\'#FF0000\'>' + opt_status + '</font>';
    } else {
      opt_status = '<font color=\'#228B22\'>' + opt_status + '</font>';
    }
    var statusSection = CardService.newCardSection();
    statusSection.addWidget(CardService.newTextParagraph()
      .setText('<b>' + opt_status + '</b>'));
    console.warn('error', opt_prefills)
    card.addSection(statusSection);
  }

  var formSection = createFormSection(CardService.newCardSection(),from,subject,body,messageId);

  
  card.addSection(formSection);

  //create button for reply to message 
  var replyButton = CreateReplayButton(CardService.newCardSection());
  //create button for the create draft email
  var createDraft = CreateDraftButton(CardService.newCardSection());

  //test the api call
  var testApi=CreateTestApiButton(CardService.newCardSection());

  card.addSection(replyButton);
  card.addSection(createDraft);
  card.addSection(testApi);

  return card;
}

function CreateTestApiButton(section){
  
  var apiCallAction = CardService.newAction().setFunctionName('sendApiRequest');

  var button = CardService.newTextButton().setText('Test API').setOnClickAction(apiCallAction);

  section.addWidget(button);
  return section;
}

/**
 * Creates form section to be displayed on card.
 *
 * @param {CardSection} section The card section to which form items are added.
 * @param {String[]} inputNames Names of titles for each input field.
 * @param {String[]} opt_prefills Default values for each input field.
 * @returns {CardSection}
 */
function createFormSection(section, from,subject,body,messageId) {
  var fromWidget=CardService.newTextInput().setFieldName('from').setTitle('From').setValue(from);
  section.addWidget(fromWidget);

  var subjectWidget=CardService.newTextInput().setFieldName('subject').setTitle('Subject').setValue(subject);
  section.addWidget(subjectWidget);

  var bodyWidget=CardService.newTextInput().setFieldName('body').setTitle('Body').setValue(body);
  section.addWidget(bodyWidget);

  var messageIdWidget=CardService.newTextInput().setFieldName('MessageId').setTitle('MessageId').setValue(messageId);
  section.addWidget(messageIdWidget)
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


//create replay button
function CreateReplayButton(section) {
  var replayAction = CardService.newAction().setFunctionName('sendReplay');

  var button = CardService.newTextButton().setText('Replay').setOnClickAction(replayAction);

  section.addWidget(button);
  return section;
}

//create draft 
function CreateDraftButton(section) {
  var replayAction = CardService.newAction().setFunctionName('createDraft');

  var button = CardService.newTextButton().setText('Save Draft').setOnClickAction(replayAction);

  section.addWidget(button);
  return section;
}
//test for the notification
function CreateButtonSection(section) {
  var action1 = CardService.newAction().setFunctionName('notificationCallback');
  var action2 = CardService.newAction().setFunctionName('notificationCallback');

  var widget1 = CardService.newTextButton().setText('Create notification').setOnClickAction(action1);
  var widget2 = CardService.newTextButton().setText('Create notification').setOnClickAction(action2);

  section.addWidget(widget1)
  section.addWidget(widget2)
  return section;
}

function notificationCallback() {
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification()
      .setText("Some info to display to user"))
    .build();
}

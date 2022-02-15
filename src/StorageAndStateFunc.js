function useStorageState(propertyName) {
  function getProperty() {
    const state = getRootProperty();
    const value = state[propertyName];
    return value;
  }

  function setProperty(value) {
    const state = getRootProperty();
    state[propertyName] = value;
    setRootProperty(state);
  }

  function deleteProperty() {
    const state = getRootProperty();
    state[propertyName] = null;
    setRootProperty(state);
  }
  return [getProperty, setProperty, deleteProperty];
}

function setRootProperty(data) {
  PropertiesService.getUserProperties().setProperty(
    "ROOT_PROPERTY",
    JSON.stringify(data)
  );
}

function getRootProperty() {
  var state =
    PropertiesService.getUserProperties().getProperty("ROOT_PROPERTY");
  return JSON.parse(state);
}

function deleteRootProperty() {
  PropertiesService.getUserProperties().deleteProperty("ROOT_PROPERTY");
}

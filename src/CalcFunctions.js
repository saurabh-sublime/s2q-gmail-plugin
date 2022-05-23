//Calc Functions
var calcFunctions = {
  equipmentName: onEquipmentChange,
  locationFrom: onLocationFromChange,
  locationTo: onLocationToChange,
  costPerMile: onCostPerMileChange,
  fuelPerMile: onFuelPerMileChange,
  distance: onDistanceChange,
  speed: onSpeedChange,
  margin: onMarginChange,
  marginProfit: onMarginProfitChange,
  cost: onCostChange,
  totalCost: onTotalCostChange,
  pickupTime: onPickupTimeChange,
  deliveryTime: onDeliveryTimeChange,
};

//On Equipment Change
function onEquipmentChange(value, state) {
  var equipmentObject = getEquipmentSuggestions().equipmentObject;
  state.equipment = equipmentObject[value];
  return state;
}

//On pickup location change
function onLocationFromChange(value, state) {
  state.locationFrom = value;
  return state;
}

//On delivery location change
function onLocationToChange(value, state) {
  state.locationTo = value;
  return state;
}

function applyParsedRates() {
  const parsedRates = getRatesBackup();
  const state = getState();
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

  const costPerMile = Number(Number(parsedRates.costPerMile).toFixed(2));
  const fuelPerMile = Number(Number(parsedRates.fuelPerMile).toFixed(2));
  const totalCost = Number(costPerMile) * Number(distance);

  const finalCost =
    equipment.minimumCost > totalCost ? equipment.minimumCost : totalCost;
  const { marginProfit, totalCost: updatedTotalCost } = getCalculatedTotalCost(
    finalCost,
    margin,
    fuelPerMile,
    distance
  );

  state.costPerMile = costPerMile;
  state.fuelPerMile = fuelPerMile;
  state.cost = finalCost;
  state.marginProfit = marginProfit;
  state.totalCost = updatedTotalCost;
  setState(state);
}

//On cost per mile change
function onCostPerMileChange(value, state) {
  var {
    margin,
    marginProfitBackup,
    totalCostBackup,
    costBackup,
    distance,
    fuelPerMile,
    costPerMileBackUp,
    equipment,
    distance,
  } = state;

  const formattedValue = Number(Number(value).toFixed(2));
  const totalCost = Number(formattedValue) * Number(distance);

  const finalCost =
    equipment.minimumCost > totalCost ? equipment.minimumCost : totalCost;
  const { marginProfit, totalCost: updatedTotalCost } = getCalculatedTotalCost(
    finalCost,
    margin,
    fuelPerMile,
    distance
  );

  state.costPerMile = formatNumber(formattedValue);
  state.cost = finalCost;
  state.marginProfit = marginProfit;
  state.totalCost = updatedTotalCost;
  return state;
}

//On fuel per mile change
function onFuelPerMileChange(value, state) {
  const {
    distance,
    costPerMile,
    fuelPerMile,
    fuelPerMileBackup,
    totalCostBackup,
    equipment,
    margin,
  } = state;

  const formattedValue = Number(Number(value).toFixed(2));
  const totalCost = Number(distance) * Number(costPerMile);
  const finalCost =
    equipment.minimumCost > totalCost ? equipment.minimumCost : totalCost;
  const { totalCost: updatedTotalCost } = getCalculatedTotalCost(
    finalCost,
    margin,
    formattedValue,
    distance
  );

  state.fuelPerMile = formatNumber(formattedValue);
  state.totalCost = updatedTotalCost;

  return state;
}

//On distance change
function onDistanceChange(value, state) {
  const {
    costPerMile,
    distance,
    cost,
    costBackup,
    fuelPerMile,
    distanceBackup,
    equipment,
    margin,
  } = state;
  const formattedValue = Number(Number(value).toFixed(2));
  const totalCost = Number(formattedValue) * Number(costPerMile);
  const finalCost =
    equipment.minimumCost > totalCost ? equipment.minimumCost : totalCost;
  const { marginProfit, totalCost: updatedTotalCost } = getCalculatedTotalCost(
    finalCost,
    margin,
    fuelPerMile,
    formatNumber(formattedValue)
  );

  const updatedTime = equipment?.mphTransitTime
    ? Number(formattedValue) / Number(equipment?.mphTransitTime)
    : Number(0);

  state.distance = formatNumber(formattedValue);
  state.cost = finalCost;
  state.marginProfit = marginProfit;
  state.totalCost = updatedTotalCost;
  state.transitTime = formatNumber(updatedTime);
  return state;
}

//On speed change
function onSpeedChange(value, state) {
  const { distance, equipment } = state;
  const formattedValue = Number(Number(value));
  const updatedTime = formattedValue
    ? Number(distance) / Number(formattedValue)
    : Number(0);
  state.equipment.mphTransitTime = formattedValue;
  state.transitTime = formatNumber(updatedTime);
  return state;
}

//On margin profit change
function onMarginProfitChange(value, state) {
  const { marginProfit, cost, marginProfitBackup, distance, fuelPerMile } =
    state;
  let formattedValue = getParsedFloat(value);

  if (isNaN(formattedValue)) {
    formattedValue = marginProfitBackup;
  }

  const updatedTotalCost = Number(cost) + Number(formattedValue);
  const margin = (formattedValue * 100) / updatedTotalCost;
  state.margin = formatNumber(margin);
  state.marginProfit = Number(formattedValue);
  state.totalCost = updatedTotalCost + distance * fuelPerMile;
  return state;
}

//On margin change
function onMarginChange(value, state) {
  const {
    cost,
    marginBackup,
    marginProfitBackup,
    distance,
    fuelPerMile,
    margin,
  } = state;
  let formattedValue = Number(value);
  if (isNaN(formattedValue) || formattedValue > 99.99) {
    formattedValue = Number(99.99);
  }

  const totalCost = Number(cost) / (1 - formattedValue / 100);
  const marginProfit = totalCost - cost;
  state.margin = formatNumber(formattedValue);
  state.marginProfit = marginProfit;
  state.totalCost = totalCost + distance * fuelPerMile;
  return state;
}

//On cost change
function onCostChange(value, state) {
  const {
    margin,
    cost,
    costBackup,
    marginProfitBackup,
    fuelPerMile,
    totalCostBackup,
    distance,
  } = state;

  let formattedValue = getParsedFloat(value);

  if (isNaN(formattedValue)) {
    formattedValue = costBackup;
  }

  const { totalCost, marginProfit } = getCalculatedTotalCost(
    formattedValue,
    margin,
    fuelPerMile,
    distance
  );

  state.marginProfit = marginProfit;
  state.totalCost = totalCost;
  state.cost = formattedValue;
  return state;
}

//On total cost change
function onTotalCostChange(value, state) {
  let totalCost = getParsedFloat(value);
  state.totalCost = totalCost;
  return state;
}

function onPickupTimeChange(value, state) {
  state.pickupTime = value.msSinceEpoch;
  return state;
}

function onDeliveryTimeChange(value, state) {
  state.deliveryTime = value.msSinceEpoch;
  return state;
}

//Calc Functions
var calcFunctions = {
  equipmentName: onEquipmentChange,
  locationFrom: onLocationFromChange,
  locationTo: onLocationToChange,
  costPerMile: onCostPerMileChange,
  fuelPerMile: onFuelPerMileChange,
  fuelSurchargePercentage: onFuelSurchargeChange,
  distance: onDistanceChange,
  speed: onSpeedChange,
  margin: onMarginChange,
  marginProfit: onMarginProfitChange,
  cost: onCostChange,
  totalTruckCost: onTotalTruckCostChange,
  totalCost: onTotalCostChange,
  pickupTimestamp: onPickupTimeChange,
  deliveryTimestamp: onDeliveryTimeChange,
  comment: onCommentChange,
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
  const totalTruckCost =
    (Number(costPerMile) + Number(fuelPerMile)) * Number(distance);

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
  state.totalTruckCost = totalTruckCost;
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
    costPerMileBackUp,
    equipment,
    distance,
  } = state;

  const formattedValue = Number(Number(value).toFixed(2));
  const cost = Number(formattedValue) * Number(distance);
  const fuelPerMile = (
    (formattedValue * fuelSurchargePercentage) /
    100
  ).toFixed(2);

  const finalCost = equipment.minimumCost > cost ? equipment.minimumCost : cost;
  const { marginProfit, totalCost: updatedTotalCost } = getCalculatedTotalCost(
    finalCost,
    margin,
    fuelPerMile,
    distance
  );

  state.costPerMile = formatNumber(formattedValue);
  state.fuelPerMile = fuelPerMile;
  state.cost = finalCost;
  state.marginProfit = marginProfit;
  state.totalTruckCost = calculateTotalTruckCost(
    formattedValue,
    fuelPerMile,
    distance,
    equipment.minimumCost
  );
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
    cost,
    equipment,
    margin,
  } = state;

  const formattedValue = Number(Number(value).toFixed(2));
  const totalTruckCost = (cost + formattedValue * distance).toFixed(2);

  const fuelSurchargePercentage = (
    ((totalTruckCost - cost) / cost) *
    100
  ).toFixed(2);
  const { totalCost: updatedTotalCost } = getCalculatedTotalCost(
    cost,
    margin,
    formattedValue,
    distance
  );

  state.fuelPerMile = formatNumber(formattedValue);
  state.fuelSurchargePercentage = formatNumber(fuelSurchargePercentage);
  state.totalTruckCost = totalTruckCost;
  state.totalCost = updatedTotalCost;

  return state;
}

//On fuel per mile change
function onFuelSurchargeChange(value, state) {
  const {
    distance,
    costPerMile,
    fuelPerMileBackup,
    totalCostBackup,
    cost,
    equipment,
    margin,
  } = state;

  const formattedValue = Number(Number(value).toFixed(2));
  const totalTruckCost = (cost + (cost * formattedValue) / 100).toFixed(2);
  const fuelPerMile = ((totalTruckCost - cost) / distance).toFixed(2);
  const { totalCost: updatedTotalCost } = getCalculatedTotalCost(
    cost,
    margin,
    fuelPerMile,
    distance
  );

  state.fuelSurchargePercentage = formatNumber(formattedValue);
  state.fuelPerMile = fuelPerMile;
  state.totalTruckCost = totalTruckCost;
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
  state.totalTruckCost = calculateTotalTruckCost(
    costPerMile,
    fuelPerMile,
    formattedValue,
    equipment.minimumCost
  );
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
  const {
    marginProfit,
    cost,
    totalTruckCost,
    marginProfitBackup,
    distance,
    fuelPerMile,
  } = state;
  let formattedValue = getParsedFloat(value);

  if (isNaN(formattedValue)) {
    formattedValue = marginProfitBackup;
  }

  const updatedTotalCost = Number(totalTruckCost) + Number(formattedValue);
  const margin = (formattedValue * 100) / updatedTotalCost;
  state.margin = formatNumber(margin);
  state.marginProfit = Number(formattedValue);
  state.totalCost = updatedTotalCost;
  return state;
}

//On margin change
function onMarginChange(value, state) {
  const {
    cost,
    totalTruckCost,
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

  const totalCost = Number(totalTruckCost) / (1 - formattedValue / 100);
  const marginProfit = totalCost - totalTruckCost;
  state.margin = formatNumber(formattedValue);
  state.marginProfit = marginProfit;
  state.totalCost = totalCost;
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
  state.totalTruckCost = formattedValue + fuelPerMile * distance;
  return state;
}

//On total cost change
function onTotalCostChange(value, state) {
  let totalCost = getParsedFloat(value);
  state.totalCost = totalCost;
  return state;
}

function onCommentChange(value, state) {
  state.comment = value;
  return state;
}

function onTotalTruckCostChange(value, state) {
  const {
    marginProfit,
    cost,
    costBackup,
    marginProfitBackup,
    fuelPerMile,
    totalCostBackup,
    distance,
  } = state;
  let formattedValue = getParsedFloat(value);
  state.totalTruckCost = formattedValue;
  state.totalCost = formattedValue + marginProfit;
  return state;
}

function onPickupTimeChange(value, state) {
  console.log("pickup date", value.msSinceEpoch);
  state.pickupTimestamp = value.msSinceEpoch;
  return state;
}

function onDeliveryTimeChange(value, state) {
  state.deliveryTimestamp = value.msSinceEpoch;
  return state;
}

const calculateTotalTruckCost = (
  costPerMile,
  fuelPerMile,
  distance,
  minimumCost
) => {
  const totalTruckCost =
    Number(distance) * (Number(costPerMile) + Number(fuelPerMile || 0));
  return totalTruckCost > Number(minimumCost)
    ? totalTruckCost
    : Number(minimumCost);
};

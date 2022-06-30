const formatTmsRates = (res, tmsRateName) => {
  //console.log("qrt", res?.data?.data);
  let allRates = [];
  if (tmsRateName === "DAT") {
    const rates = res.data.rateResponses[0].response.rate;
    console.log("DAT rates", rates);
    return [{ ...rates, rateService: "DAT" }];
  }
  //Logistical Labs
  if (tmsRateName === "Logistical Lab") {
    const data = res?.data?.sub_rates;
    if (data[0]?.rate_source_name === "Aggregated rates") {
      const tempData = {
        rateService: "Logistical Labs",
        url: null,
        perMile: null,
        averageFuelSurchargePerMileUsd: null,
        perTrip: {
          rateUsd: data[0]?.linehaul_rate,
          highUsd: null,
          lowUsd: null,
        },
        averageFuelSurchargePerTripUsd: null,
      };
      allRates.push(tempData);
    }

    //Other components
    const components = data[0]?.components;
    if (components?.length > 0) {
      for (let i = 0; i < components.length; i++) {
        //Historical
        if (components[i]?.rate_source_component_name === "Historical") {
          const tempData1 = {
            rateService: "My Rates",
            perMile: null,
            averageFuelSurchargePerMileUsd: null,
            perTrip: {
              rateUsd: components[i]?.flat_without_fuel_surcharge,
              highUsd: null,
              lowUsd: null,
            },
            averageFuelSurchargePerTripUsd: null,
          };
          allRates.push(tempData1);
        }

        //Truckstop
        if (
          components[i]?.rate_source_component_name === "TruckStop Paid Rates"
        ) {
          const listOfRates = [];
          listOfRates.push(components[i]?.flat);
          components[i]?.points?.map((item) => {
            listOfRates.push(item.flat);
          });
          listOfRates.sort((a, b) => a - b);
          console.log("sorted rates", listOfRates);
          let low, rate, high;
          if (listOfRates === 1) {
            rate = listOfRates[0];
          }
          if (listOfRates?.length > 1) {
            low = listOfRates[0];
            high = listOfRates[listOfRates?.length - 1];
            rate = median(listOfRates);
          }

          const tempData2 = {
            rateService: "TruckStop",
            url: null,
            perMile: null,
            averageFuelSurchargePerMileUsd: null,
            perTrip: {
              rateUsd: rate,
              highUsd: high,
              lowUsd: low,
            },
            averageFuelSurchargePerTripUsd: null,
          };
          allRates.push(tempData2);
        }

        //DAT Spot Rates
        if (components[i]?.rate_source_component_name === "DAT Spot Rates") {
          const tempData = {
            rateService: "DAT",
            url: null,
            perMile: null,
            averageFuelSurchargePerMileUsd: null,
            perTrip: {
              rateUsd: components[i].flat,
              highUsd: components[i].max_flat,
              lowUsd: components[i].min_flat,
            },
            averageFuelSurchargePerTripUsd: null,
          };
          allRates.push(tempData);
        }
      }
    }

    return allRates;
  }
};

function median(values) {
  if (values.length === 0) throw new Error("No inputs");

  values.sort(function (a, b) {
    return a - b;
  });

  var half = Math.floor(values.length / 2);

  if (values.length % 2) return values[half];

  return (values[half - 1] + values[half]) / 2.0;
}

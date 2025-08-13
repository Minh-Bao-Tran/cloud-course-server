const dayjs = require("dayjs");

function addDecimalTime(currentDate, amount, unit) {
  const whole = Math.floor(amount);
  const fractional = amount - whole;

  const date = dayjs(currentDate);
  let result = date.add(whole, unit);

  // Handle fractional part by converting to smaller unit
  if (fractional > 0) {
    const subUnitMap = {
      hour: "minute",
      minute: "second",
      second: "millisecond",
    };

    const subUnit = subUnitMap[unit];
    if (subUnit) {
      const conversion = {
        hour: 60,
        minute: 60,
        second: 1000,
      };
      result = result.add(fractional * conversion[unit], subUnit);
    }
  }

  return result;
}




module.exports = { addDecimalTime: addDecimalTime };

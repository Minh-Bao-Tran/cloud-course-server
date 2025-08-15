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

function compareTime(date1, date2) {
  //return true if date2 is greater than date 1

  const firstDate = dayjs(date1);
  const secondDate = dayjs(date2);

  const result = firstDate.diff(secondDate);

  if (result < 0) {
    return false
  }
  return true
}

module.exports = { addDecimalTime: addDecimalTime, compareTime: compareTime };

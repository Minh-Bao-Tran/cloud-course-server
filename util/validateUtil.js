function validateUserData(userData) {
  if (
    !(
      userData.userName &&
      userData.password &&
      userData.confirmedPassword &&
      userData.email &&
      userData.mobile &&
      userData.agreedToTermAndCondition
    )
  ) {
    // One of the mandatory fields is missing
    return { valid: false, message: "Data is not valid" };
  }

  if (!userData.agreedToTermAndCondition) {
    // term and condition is not agreed to
    return { valid: false, message: "Please agree to term and condition" };
  }

  if (userData.password != userData.confirmedPassword) {
    // Password is not confirmed
    return { valid: false, message: "Password is not confirmed" };
  }

  if (!userData.email.includes("@") || !userData.email.includes(".")) {
    //Email is not valid
    return { valid: false, message: "Email is not valid" };
    alse;
  }
  const regex = /[^a-zA-Z0-9_]/;
  if (regex.test(userData.userName)) {
    return {
      valid: false,
      message: "Username should not contains a special character",
    };
  }

  const mobile = Number(userData.mobile);
  if (
    !Number.isInteger(mobile) ||
    userData.mobile.length > 11 ||
    userData.mobile.length < 8
  ) {
    //Mobile Number is not valid
    return { valid: false, message: "Mobile number is not valid" };
  }

  return { valid: true };
}

function trimUserData(userData) {
  const trimmedUserData = { ...userData };
  trimmedUserData.userName = userData.userName.trim();
  trimmedUserData.password = userData.password.trim();
  trimmedUserData.confirmedPassword = userData.confirmedPassword.trim();
  trimmedUserData.email = userData.email.trim();
  trimmedUserData.mobile = userData.mobile.trim();

  return trimmedUserData;
}

function validateAircraftData(aircraftData) {
  if (
    !(
      aircraftData.aircraftType &&
      aircraftData.aircraftRegistration &&
      aircraftData.aircraftBuildDate &&
      aircraftData.aircraftModel
    )
  ) {
    // One of the mandatory fields is missing
    return { valid: false, message: "Data is missing" };
  }

  if (aircraftData.aircraftRegistration.length != 6) {
    //Registration is not valid
    return { valid: false, message: "Aircraft Registration is not valid" };
  }

  const dateCheck = new Date(aircraftData.aircraftBuildDate);
  if (isNaN(dateCheck.valueOf())) {
    //Date is not valid
    return { valid: false, message: "Date is not valid" };
  }
  return { valid: true };
}

function validateRouteData(routeData) {
  if (
    !(
      routeData.departingAirport &&
      routeData.arrivingAirport &&
      routeData.hasOwnProperty("waypoints") &&
      routeData.departingDate &&
      routeData.arrivingDate &&
      routeData.aircraftId 
    )
  ) {
    // One of the mandatory fields is missing
    return { valid: false, message: "Data is missing" };
  }

  const dateCheckDepart = new Date(routeData.departingDate);
  const dateCheckArrive = new Date(routeData.arrivingDate);

  if (isNaN(dateCheckDepart.valueOf()) || isNaN(dateCheckArrive.valueOf())) {
    //Date is not valid
    return { valid: false, message: "Date is not valid" };
  }

  return { valid: true };
}

module.exports = {
  validateUserData: validateUserData,
  trimUserData: trimUserData,
  validateAircraftData: validateAircraftData,
  validateRouteData: validateRouteData,
};

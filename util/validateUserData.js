function validateUserData(userData) {
  if (
    !(
      userData.userName &&
      userData.password &&
      userData.confirmedPassword &&
      userData.email &&
      userData.mobile
    )
  ) {
    // One of the mandatory fields is missing
    return { valid: false, message: "Data is not valid" };
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

  if (
    !Number.isInteger(userData.mobile) ||
    userData.mobile.length > 11 ||
    userData.mobile.length < 8
  ) {
    //Mobile Number is not valid
    return { valid: false, message: "Mobile number is not valid" };
  }

  return { valid: true };
}

module.exports = {
  validateUserData: validateUserData,
};

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

  const mobile = Number(userData.mobile);
  if (
    !Number.isInteger(mobile) ||
    userData.mobile.length > 11 ||
    userData.mobile.length < 8
  ) {
    //Mobile Number is not valid
    console.log();
    return { valid: false, message: "Mobile number is not valid" };
  }

  return { valid: true };
}

module.exports = {
  validateUserData: validateUserData,
};

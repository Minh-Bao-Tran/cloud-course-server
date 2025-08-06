class Aircraft {
  constructor(
    aircraftType,
    aircraftRegistration,
    aircraftBuildDate,
    aircraftModel,
    userId = null
  ) {
    this.aircraftType = aircraftType;
    this.aircraftRegistration = aircraftRegistration;
    this.aircraftBuildDate = aircraftBuildDate;
    this.aircraftModel = aircraftModel;
    this.userId = userId;
  }
}

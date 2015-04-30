// CUP CLASS
// a cup contains a specific drink chosen by the customer using the wizard
// the customer can interact with the cup : drink, refill or choose something else
// also, a timer (located in the controller) will decrease the temperature of the cup contents
// @Parameter : reference to singleton that provides string values
function cup(Constants) {

	console.log("cup is being initialized");

	// the reference to the instance cannot be called directly from within the functions/methods
    this.constantsInstance = Constants;

	// definition of the drink being served :
    this.recommendedTemperature = this.constantsInstance.get("temperature_cold");
    this.cupType = this.constantsInstance.get("cupform_default");
    this.drinkName = null;
    this.drinkId = null;

    // temporary definition of the drink that may get served :
    // in order to be able to cancel an order being processed,
    // the retrieval of characteristics needs to be copied to a temporary location
    // so that the current drink served is not overwritten before the order is confirmed by the customer
    // (there is only one cup, so only one drink may get served at a time)
    this.temporaryRecommendedTemperature = this.constantsInstance.get("temperature_cold");
    this.temporaryCupType = this.constantsInstance.get("cupform_default");
    this.temporaryDrinkName = null;
    this.temporaryDrinkId = null;

    // does the customer have a drink to go back to
    this.served = false;
    // how much liquid the cup still contains in percentage
    this.amount = 0;
    // how warm the content of the cup is
    this.temperature = this.constantsInstance.get("temperature_cold");

    // cleanup resources before leaving
    var self = this;
    $(window).unload(function () {
    	if (self.exists) {
    		self.clearDrink();
    	}
    });
}

cup.prototype.populateDrink = function(drinkId, drinkName, recommendedTemperature, recommendedCupType) {
	this.temporaryRecommendedTemperature = this.temperature = recommendedTemperature;
	this.temporaryCupType = recommendedCupType;
	this.temporaryDrinkName = drinkName;
	this.temporaryDrinkId = drinkId;
}

// Copy temporary characteristics to current cup.
cup.prototype.serveDrink = function() {
	if(this.temporaryDrinkName) {
		this.recommendedTemperature = this.temporaryRecommendedTemperature;
		this.cupType = this.temporaryCupType;
		this.drinkName = this.temporaryDrinkName;
		this.drinkId = this.temporaryDrinkId;

		this.amount = 100;
		this.served = true;
	}
}

// Transfer cookie characteristics to current cup.
cup.prototype.restoreDrink = function(drinkId, drinkName, recommendedTemperature, cupType, amountLeft, temperature) {
	this.recommendedTemperature = recommendedTemperature;
	this.cupType = cupType;
	this.drinkName = drinkName;
	this.drinkId = drinkId;
	this.amount = amountLeft;
	this.temperature = temperature;

	this.served = true;
}

// Decrease the temperature unless it is cold.
cup.prototype.decreaseTemperature = function(Constants) {
	switch(this.temperature) {
		case this.constantsInstance.get("temperature_hot"):
		this.temperature = this.constantsInstance.get("temperature_warm");
		break;
		case this.constantsInstance.get("temperature_warm"):
		this.temperature = this.constantsInstance.get("temperature_cold");
		break;
	}
}

// Decrease amount of liquid left.
// Make sure an empty cup is labeled as cold.
cup.prototype.takeSip = function(Constants) {
	if(this.amount > 0) {
		this.amount -= this.constantsInstance.get("sip_amount");
		// an emptly cup is always cold
		if(this.amount <= 0) {
			this.temperature = this.constantsInstance.get("temperature_cold");
		}
	}
}

// Restore original amount and temperature, according to the drink description
cup.prototype.refill = function() {
	if(this.served) {
		this.amount = 100;
		this.temperature = this.recommendedTemperature;
	}
}

// Clean up resources : reset to default values
cup.prototype.clearDrink = function(Constants) {
	if(this.exists) {
		this.amount = 0;
		this.drinkName = null;
		this.drinkId = null;
		this.recommendedTemperature = this.constantsInstance.get("temperature_cold");
		this.temperature = this.constantsInstance.get("temperature_cold");
		this.cupType = this.constantsInstance.get("cupform_default");
		this.served = false;
	}
}
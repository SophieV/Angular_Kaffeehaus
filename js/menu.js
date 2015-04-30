// MENU CLASS
// it is the collection of the DRINK items available to the customer
// it provides all the interaction with the drinks - the only direct reference to a specific drink is made to retrieve its model data
// @Parameter : reference to singleton that provides string values
function menu(Constants) {
    // check whether some values have been populated
    this.initialized = false;
    // on the first call, there is benefit of the doubt so that the window opens
    this.loadedLive = true;
    // list of the drinks that can be ordered through our app
    // Note : the initial idea was to have key-value pairs, the key being the ID of the drink.
    // This implementation was removed because the length property of the array does not work properly (it basically returns last index value + 1/not a count)
    // and undesirable side effects on the UI (empty entry).
	this.drinks = null;
}

// Populate the list with static values.
// Scenario : the data could not be retrieved from the database (error or offline).
menu.prototype.populateWithMockValues = function() {
	 this.drinks = [
    new drink('1', 'Latte', 'hot milk with a touch of coffee', Constants.getKey("hot"), 'large', ["milk","sugar"], 0, 0, 0),
    new drink('2', 'Cappuccino', 'delicious milk foam', Constants.getKey("hot"), 'medium', ["milk"], 4, 1, 3),
    new drink('3', 'Expresso', 'the best of coffee', Constants.getKey("hot"), 'large', [], 0, 0, 0),
    new drink('4', 'Iced Coffee', 'sweetened filter coffee served with ice', Constants.getKey("cold"), 'large', ["sugar"], 0, 0, 0)
    ];
    this.initialized = true;
    this.loadedLive = false;
}

// Populate the list with dynamic content from the database.
// Scenario : the list of drinks is made available through a REST web service implemented using the Slim framework/PHP/MySQL.
// Note : the values need to be explicitely parsed and encapsulated in DRINK objects in order to use
// the prototype functions/methods later on.
menu.prototype.populateWithRealValues = function(jsonData) {
	this.drinks = [];
	var len = jsonData.length;
    for (var i=0; i<len; ++i)
    {
    	// Parse the JSON values retrieved
    	this.drinks[i] = new drink(
            jsonData[i].id,
            jsonData[i].name,
            jsonData[i].description,
            jsonData[i].recommendedTemperature,
            jsonData[i].recommendedCupForm,
            jsonData[i].ingredients,
            jsonData[i].countServed,
            jsonData[i].countGotCold,
            jsonData[i].countWasDrank);
    }
    this.initialized = true;
    this.loadedLive = true;
}

// Call the method for increasing the count of servings on the specified drink.
menu.prototype.increaseWasServed = function(drinkId) {
	var len = this.drinks.length;
    for (var i=0; i<len; ++i)
    {
    	if(this.drinks[i].id == drinkId) {
    		this.drinks[i].increaseWasServed();
    	}
    }
}

// Call the method for increasing the count of drinks that went cold before being drank on the specified drink.
menu.prototype.increaseGotCold = function(drinkId) {
		var len = this.drinks.length;
    for (var i=0; i<len; ++i)
    {
    	if(this.drinks[i].id == drinkId) {
    		this.drinks[i].increaseGotCold();
    	}
    }
}

// Call the method for increasing the count of drinks that were drank on time on the specified drink.
menu.prototype.increaseWasFinished = function(drinkId) {
		var len = this.drinks.length;
    for (var i=0; i<len; ++i)
    {
    	if(this.drinks[i].id == drinkId) {
    		this.drinks[i].increaseWasFinished();
    	}
    }
}
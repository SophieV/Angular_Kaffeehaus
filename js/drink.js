// DRINK CLASS
// a drink has a unique identifier (DB), a name, a text description,
// an initial temperature, a recommended cup form to use,
// and is composed of 0...* ingredients
function drink(id, name, description, recommendedTemperature, recommendedCupForm, ingredients, countServed, countGotCold, countWasFinished) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.recommendedTemperature = recommendedTemperature;
    this.recommendedCupForm = recommendedCupForm;
    this.ingredients = ingredients;
    this.countServed = countServed;
    this.countGotCold = countGotCold;
    this.countWasFinished = countWasFinished;
}

// Increase current was served counter
drink.prototype.increaseWasServed = function() {
	this.countServed++;
}

// Increase current got cold counter
drink.prototype.increaseGotCold = function() {
	this.countGotCold++;
}

// Increase current drank counter
drink.prototype.increaseWasFinished = function() {
	this.countWasFinished++;
}
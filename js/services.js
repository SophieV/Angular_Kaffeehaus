// DATASHARING class
angular.module('CoffeeApp.services', [])
// service that allows to have a single point of change if the reference values from the database change
//---------------------------------------------------------------------------------------------------------------------------------------------
.factory('Constants', function() {
  var constants = {
    // various temperatures available
    temperature_cold : "cold",
    temperature_hot : "hot",
    temperature_warm : "warm",
    // various cup types available
    cupform_default : "medium",
    // current drinking sip in percentage
    sip_amount : 50,
    // frequency of the timer tick
    timer_tick : 5000,
    temperatureDecreasedEventName : "PublishSubscribeService.temperatureDecreased",
    cupServeEventName : "serveDrink"
  }

  return {
    get: function(key) {
      return constants[key];
    },
    all: function() {
      return constants;
    }
  };
})
//---------------------------------------------------------------------------------------------------------------------------------------------
.factory('UpdateDrinkServedProvider', function($resource) {
  return $resource('http://www.e-olympos.com/api/drinksserved/:id', { id: '@id' }, {
    update: {
      method: 'PUT' // this method issues a PUT request
    }
  });
})
//---------------------------------------------------------------------------------------------------------------------------------------------
.factory('UpdateDrinkFinishedProvider', function($resource) {
  return $resource('http://www.e-olympos.com/api/drinksfinished/:id', { id: '@id' }, {
    update: {
      method: 'PUT' // this method issues a PUT request
    }
  });
})
//---------------------------------------------------------------------------------------------------------------------------------------------
.factory('UpdateDrinkColdProvider', function($resource) {
  return $resource('http://www.e-olympos.com/api/drinkscold/:id', { id: '@id' }, {
    update: {
      method: 'PUT' // this method issues a PUT request
    }
  });
})
//---------------------------------------------------------------------------------------------------------------------------------------------
// Singleton that provides instances of the menu of the drinks and the (unique) cup of the customer
// This service is needed to transfer data from the menu to the cup
.factory('DataModelService', function (Constants, $rootScope,$cookieStore) {

    var coffeeMenu = new menu();
    var coffeeCup = new cup(Constants);

    function notifyChangeOfModelToUpperLayer (data) {
        $rootScope.$emit(Constants.get("temperatureDecreasedEventName"), data)
    }

    return {
        menu : coffeeMenu,
        cup : coffeeCup,
        adjustTemperature: function()
        {
          if(coffeeCup.served)
          {
            oldTemperature = coffeeCup.temperature;
            coffeeCup.decreaseTemperature();

            // if the cup is loaded from cookies and already cold, we do not want the event to fire
            // and trigger double counts of got cold
            if(coffeeCup.temperature != oldTemperature)
            {
              this.saveCupToCookies();
              notifyChangeOfModelToUpperLayer(coffeeCup.temperature);
            }
            oldTemperature = null;
          }
        },
        saveCupToCookies: function() {
          $cookieStore.put('cup_cookiesSet', '1');
          $cookieStore.put('cup_drinkId', coffeeCup.drinkId);
          $cookieStore.put('cup_drinkName', coffeeCup.drinkName);
          $cookieStore.put('cup_cupType', coffeeCup.cupType);
          $cookieStore.put('cup_recommendedTemperature', coffeeCup.recommendedTemperature);
          $cookieStore.put('cup_amountLeft', coffeeCup.amount);
          $cookieStore.put('cup_temperature', coffeeCup.temperature);
          console.log("cookies updated");
        },
        restoreCupFromCookies: function() {
          coffeeCup.restoreDrink($cookieStore.get('cup_drinkId'),
                            $cookieStore.get('cup_drinkName'),
                            $cookieStore.get('cup_recommendedTemperature'),
                            $cookieStore.get('cup_cupType'),
                            $cookieStore.get('cup_amountLeft'),
                            $cookieStore.get('cup_temperature'));
        }
      }
    })
//---------------------------------------------------------------------------------------------------------------------------------------------
.service('CoffeeTimer', function(DataModelService, $rootScope, Constants) {
  // keep track of running timer
  timerId = -1;
  // flag do nothing first time
  timerFirstTickHappened = false;

  // the timer will reset itself even if the drink was finished - the cup gets cold
  this.triggerTemperatureControl = function() {
    if(DataModelService.cup.served)
    {
      DataModelService.adjustTemperature();

      if (DataModelService.cup.temperature == Constants.get("temperature_cold")) {
        // once the drink is cold, the timer can be stopped
        this.resetTimerInterval();
      }
    }
  }

  this.createTimerInterval = function() {
    // start timer :
    // the timer runs all the time but only triggers an action when a cup is served and is not cold yet.
    if(timerId <= 0)
    {
      var self = this;
      // setInterval runs several times whereas setTimeout only once
      // call to $scope.$apply will force the view to take the changes to the data model into account and refresh the UI according to the rules
      timerId = setInterval(function() {
        if(timerFirstTickHappened) {
          self.triggerTemperatureControl();
        } else {
          timerFirstTickHappened = true;
        }
      }, Constants.get("timer_tick"));
      console.log('timer was started');
    }
  }

  this.resetTimerInterval = function() {
    if(timerId >= 0) {
      window.clearInterval(timerId);
      timerId = -1;
      timerFirstTickHappened = false;
      console.log('timer was stopped.');
    }
  }
});
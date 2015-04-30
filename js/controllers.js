// bridge of interactions between data model and views
angular.module('CoffeeApp.controllers', [])
//---------------------------------------------------------------------------------------------------------------------------------------------
.controller('WizardController', function($scope, $rootScope,
                                          DataModelService,
                                          Constants,
                                          $http) {
    // init no choice selected by user - so that next step button is disabled
  $scope.userDrinkChoice = {};

  // init default name for the customer to display a non-empty greeting
  $scope.customer = { 'name' : 'Visitor'};

  // if not assigned to the scope, there is no binding/refresh on the UI
  $scope.menu = DataModelService.menu;
  $scope.cup = DataModelService.cup;

  // let the cup controller know that it is time to serve the drink in the cup
  $scope.serveDrink = function() {
    $rootScope.$emit(Constants.get("cupServeEventName"), 'Drink being served');
  }

  // Retrieve drinks available from web service.
  $scope.loadMenu = function() {
     $http.jsonp(
       'http://www.e-olympos.com/api/drinks?callback=JSON_CALLBACK')
    .success(function(data){
      // cannot load directly to the data : $scope.menu.drinks = data;
      // because otherwise the prototype functions will not be available
      $scope.menu.populateWithRealValues(data);
    })
    .error(function(data){
      // in case of error, display the static data instead
      $scope.menu.populateWithMockValues();
    });
  };

  // call to populate the menu has been moved from the wizard-start view to here, when the wizard controller is initialized.
  // this allows for the browser page to be reloaded and the menu will still display.
  $scope.loadMenu();
})
//---------------------------------------------------------------------------------------------------------------------------------------------
.controller('CupController', function($scope, $rootScope, 
                                      $cookieStore,
                                      $state, 
                                      DataModelService, 
                                      UpdateDrinkServedProvider, UpdateDrinkFinishedProvider, UpdateDrinkColdProvider,
                                      Constants, 
                                      CoffeeTimer, 
                                      $http) {
  console.log("cup controller is being initialized");

  $scope.cup = DataModelService.cup;
  $scope.menu = DataModelService.menu;
  $scope.constants = Constants;

  // flag value that makes sure that the indicator that keeps track of drinks that were drank on time is accurate
  $scope.drinkWasNotDrankBeforeItGotCold = false;

  // Validate the current drink of the user and set its initial state.
  // Track indicator by increasing the count of served cups for that particular drink.
  $rootScope.$on(Constants.get("cupServeEventName"), function (event, data) {
    console.log(data);
    $scope.serveDrink();
  });

  // The changes to the Data Model were triggered by the tick of the clock.
  // Make it visible to the user.
  $rootScope.$on(Constants.get("temperatureDecreasedEventName"), function (event, data) {
    console.log(data);

    // if the cup got cold and the content is not empty
    if (data == Constants.get("temperature_cold") && $scope.cup.amount > 0)
    {
      // a drink which was always cold cannot get cold
      $scope.drinkGotColdFromHot = ($scope.cup.temperature == Constants.get("temperature_cold")
                                            && $scope.cup.recommendedTemperature != Constants.get("temperature_cold"));

      if ($scope.drinkGotColdFromHot)
      {
        UpdateDrinkColdProvider.update({id:$scope.cup.drinkId})
        .$promise
        .then(
          //success
          function( value ) {
          // mirror/make similar changes on the client side
          $scope.menu.increaseGotCold($scope.menu.drinkId);
          console.log('Drink got cold before it was finished.');
        },
          //error
          function( error ) {
          // handle errors
          console.log(error);
          }
        )
      }
    }

    $scope.$apply();
  });

  $scope.serveDrink = function() {
    $scope.cup.serveDrink();
    $scope.handleServing();
    DataModelService.saveCupToCookies();
  };

  // Very similar to serve drink.
  $scope.getRefill = function() {
    $scope.cup.refill();
    $scope.handleServing();
    DataModelService.saveCupToCookies();
  };

  // PREVIOUS VERSION FOR INFO ONLY
  // $http.jsonp('http://www.e-olympos.com/api/drinksserved/' + $scope.cup.drinkId + '?callback=JSON_CALLBACK')
  // .success(function(data){
  //   // mirror/make similar changes on the client side
  //   $scope.menu.increaseWasServed($scope.cup.drinkId);
  // }).error(function(data){
  //   // handle errors
  //   console.log(data);
  // })
  // common behavior of serve and refill
  $scope.handleServing = function() {
    UpdateDrinkServedProvider.update({id:$scope.cup.drinkId})
    .$promise
    .then(
      //success
      function( value ){
      // mirror/make similar changes on the client side
      $scope.menu.increaseWasServed($scope.cup.drinkId);},
      //error
      function( error ){
      // handle errors
      console.log(error);
      })

      $scope.triggerTimer();
  };

  $scope.triggerTimer = function() {
    // reset timer in case the customer just changed his mind before the previous drink got cold
    CoffeeTimer.resetTimerInterval();
    // start temperature decreasing timer
    CoffeeTimer.createTimerInterval();
  }

  $scope.takeSip = function() {
    if($scope.cup.amount > 0) {
      // a drink which was always cold cannot get cold
      $scope.drinkGotColdFromHot = ($scope.cup.temperature == Constants.get("temperature_cold")
                                  && $scope.cup.recommendedTemperature != Constants.get("temperature_cold"));

      $scope.cup.takeSip();
      DataModelService.saveCupToCookies();

      // check whether customer got to drink its drink before it got cold
      if($scope.cup.amount <= 0 && !$scope.drinkGotColdFromHot)
      {
        UpdateDrinkFinishedProvider.update({id:$scope.cup.drinkId})
        .$promise
        .then(
          //success
          function( value ){
          // mirror/make similar changes on the client side
          $scope.menu.increaseWasFinished($scope.cup.drinkId);
          console.log('Drink was finished on time.');
        },
          //error
          function( error ){
          // handle errors
          console.log(error);
          }
        )
      }
    }
  };

  // the initialization from cookies needs to be located after the definition of the prototype functions it's using
  if($cookieStore.get('cup_cookiesSet') == '1')
  {
    console.log("from browser cookies");
    DataModelService.restoreCupFromCookies();
    $scope.triggerTimer();
  }
});
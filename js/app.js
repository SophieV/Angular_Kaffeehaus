// UI routes are defined here

// name CoffeeApp  matches the content of the ng-app attribute on the index page
angular.module('CoffeeApp', ['ui.router', 'ngResource', 'ngCookies', 'CoffeeApp.controllers', 'CoffeeApp.services'])
.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider, DataModelService) {

// defines the default page shown
 $urlRouterProvider.otherwise('/drinking');
    // specific UI templates are displayed according to the states defined
    // UI views interact/trigger each other by defining new states on actions such as button click
    $stateProvider
      // invites the customer to get started with ordering a drink
      .state('welcome', {
        url: '/welcome',
        views: {
          'wizard-container': {
            //template: '<p>There is no wizard running.</p>'
          },
          'cup-container':{
            templateUrl: 'views/welcome.htm'
          }}
      })
      // high-level container of the multi-step wizard
      .state('wizard', {
        abstract: true,
        url: '/wizard',
        views: {
          'wizard-container': {
            // the main container of the popup is defined here
            // the name of the view tells the routing where to injected the UI views defined below
            template: '<div class="uk-alert uk-alert-large" data-uk-alert><a href="" class="uk-alert-close uk-close" ui-sref="drinking"></a><div ui-view="wizard-children"></div></div>'
          },
          'cup-container':{
            // logically it would make sense to display the info that the cup is being prepared here. However, we want to show the cup ready
            // in the background when the last step is being processed.
            template: '<div ui-view="cup-children"></div>'
          }}
      })
      // optional entering of customer name
      .state('wizard.start', {
        url: '/start',
        views: {
          'wizard-children': {
            templateUrl: 'views/wizard-start.htm'
          },
          'cup-children': {
            templateUrl: 'views/cup-preparing.htm'
          }
        }
      })
      // customer chooses a drink to fill the cup
      .state('wizard.ordering', {
        url: '/ordering',
        views: {
          'wizard-children': {
            templateUrl: 'views/wizard-ordering.htm'
          },
          'cup-children':{
            templateUrl: 'views/cup-preparing.htm'
          }
        },
        // TODO: there is currently the bug - probably due to the fact that no persistence is implemented yet
        // that a reload of the ordering page will return empty.
        onEnter: function($state, DataModelService){
          // if window is reloaded and everything is reinitialized show start instead of empty menu
          if((!DataModelService.menu.loadedLive && DataModelService.menu.initialized))
          {
            // this will allow retriggering the loadMenu() call from the button click
            $state.transitionTo('wizard.start');
          }
        }
      })
      // info displayed to customer - process completed
      .state('wizard.finish', {
        url: '/complete',
        views: {
          'wizard-children': {
            templateUrl: 'views/wizard-finish.htm'
          },
          'cup-children':{
            templateUrl: 'views/cup-drinking.htm'
          }
        }
      })
      // main display and interaction with the cup - drink, refill and order something else
      // also, the view of the cup will reflect the fact that it gets cold with time
      .state('drinking', {
        url: '/drinking',
        views: {
          'cup-container':{
            templateUrl: 'views/cup-drinking.htm'
          }
        },
        // all the closing buttons of the multi-step wizard redirect to this state because of a side-effect of using reusable UI components
        // (having twice the same component breaks the layout, even if one is always hidden when the other is displayed)
        // if the customer has never selected a drink before, there is no "drinking" state to go back to, and he/she should be redirected
        // to the default page.
        onEnter: function($state, DataModelService){
          if(!DataModelService.cup.served)
          {
            $state.transitionTo('welcome');
          }
        }
      })
  }]);
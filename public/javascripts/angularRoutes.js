app.config(['$stateProvider','$urlRouterProvider','$locationProvider',function($stateProvider, $urlRouterProvider,$locationProvider) {
    $stateProvider
      //linking page
      .state('home', {
        url: '/',
        views:{
          'body':{templateUrl: 'partials/home.html', controller: 'MainCtrl'}
        },
         resolve: {
          linkPromise: ['links', function(links){
            return links.getAll();
          }]
         }
      })
      //add a new link / see current user's links
      .state('link',{
        url:'/link',
        views:{
          
          'body':{templateUrl: 'partials/link.html', controller: 'LinkCtrl'}
        }, 
         resolve: {
          linkPromise: ['links','auth', function(links,auth){
            return links.getUserLinks(auth.currentUserID());
          }]
         }
         
      })
     
      .state('register', {
        url: '/register',
        views:{
          
          'body':{templateUrl: 'partials/register.html', controller: 'AuthCtrl'}
        },
        onEnter: ['$state', 'auth', function($state, auth){
          if(auth.isLoggedIn()){
            $state.go('home');
          }
        }]
      })
      
      .state('login', {
        url: '/login',
        views:{
          
          'body':{templateUrl: 'partials/login.html', controller: 'AuthCtrl'}
        },
        onEnter: ['$state', 'auth', function($state, auth){
          if(auth.isLoggedIn()){
            $state.go('home');
          }
        }]
      })
      
      .state('users',{
        url:'/users/:user',
        views:{
          'body':{templateUrl:'partials/users.html',controller:'UserCtrl'}
        },
         resolve: {
          profilePromise: ['links','$stateParams', function(links,$stateParams){
            console.log($stateParams)
            return links.getUserLinks($stateParams.user);
          }]
         }
      })
      
      .state('profile',{
        url:'/profile/:user',
        views:{
          'body':{templateUrl:'partials/profile.html',controller:'UserCtrl'}
        },
         resolve: {
          profilePromise: ['links','auth', function(links,auth){
            //console.log($stateParams)
            return links.getUserFavorites(auth.currentUserID());
          }]
         }
      })
      $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
      });
    $urlRouterProvider.otherwise('');
}]);


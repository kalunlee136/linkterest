var app = angular.module('flapperNews', ['ui.router']);

app.controller('MainCtrl', ['$scope','links', 'auth', function($scope,links,auth){
     $scope.links = links.links; //returns all linkterest links
     $scope.favorites = links.favorites;
     
     $scope.isLoggedIn = auth.isLoggedIn;
    
     $scope.upvote = function(index){
        if($scope.isLoggedIn()){
          console.log($scope.links[index])
          links.upvote(index);
        }
      }
     
     $scope.saveFavorite = function(index){
       if($scope.isLoggedIn()){
         console.log($scope.links[index])
         links.saveFavorite(index)
       }
     }
     
      //sets up the pinterest-like grid display
      var grid = document.querySelector('.grid');
      var msnry;
      
      imagesLoaded( grid, function() {
        // init Isotope after all images have loaded
        msnry = new Masonry( grid, {
          itemSelector: '.grid-item',
          percentPosition: true,
          columnWidth: '.grid-item'
        });
      });

   
    
}]);

app.controller('LinkCtrl',['$scope','$state','links','auth',function($scope,$state,links,auth){
  $scope.links = links.links; // list of all Linkterest links
  $scope.userlinks = links.userLinks; //list of all the logged-in user's links
  
  $scope.isLoggedIn = auth.isLoggedIn;
  
  //handle creation of  new link for linkster. takes a title and url link
  $scope.addLink = function(){
    $scope.links.push({title:$scope.title,url:$scope.url,upvotes:0,user:auth.currentUser()});
    
    links.create({title:$scope.title,url:$scope.url,user:auth.currentUser(),user_id:auth.currentUserID()});
    
    $state.transitionTo('home');
  };
  
  //gets all of  the logged-in user's links
  $scope.getUserLinks = function(user_id){
    console.log('getuserlinks: '+user_id);
    links.getUserLinks(user_id);
  }
  
  $scope.delete = function(index){
    if($scope.isLoggedIn()){
      console.log($scope.links[index])
      links.deleteLink(index);
    }
  }
  
   //sets up the pinterest-like grid display
      var grid = document.querySelector('.grid');
      var msnry;
      
      imagesLoaded( grid, function() {
        // init Isotope after all images have loaded
        msnry = new Masonry( grid, {
          itemSelector: '.grid-item',
          percentPosition: true,
          columnWidth: '.grid-item'
        });
      });


}]);

app.controller('AuthCtrl', ['$scope','$state','auth', function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
  
}]);

app.controller('NavCtrl', ['$scope','auth',function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.currentUserID = auth.currentUserID;
  $scope.logOut = auth.logOut;
}]);

app.controller('UserCtrl',['$scope','links', 'auth','$stateParams', function($scope,links,auth,$stateParams){
  $scope.links = links.userLinks;
  $scope.favorites = links.favorites;
  
  $scope.isLoggedIn = auth.isLoggedIn;
  
  $scope.currentUser = auth.currentUser();
  
  $scope.getUserLinks = function(user_id){
    console.log('getuserlinks: '+user_id);
    links.getUserLinks(user_id);
  }
  
  $scope.getUserFavorites = function(user_id){
    links.getUserFavorites(user_id);
  }
  
  $scope.delete = function(index){
    if($scope.isLoggedIn()){
      console.log($scope.links[index])
      links.deleteLink(index);
    }
  }
  
   //sets up the pinterest-like grid display
    
}]);

app.factory('links',['$http', 'auth', '$state', function($http, auth,$state){
  var factory = {
    links:[],
    userLinks:[],
    favorites:[],
  };
  
  factory.getAll = function(){
    return $http.get('/links').then(function(res){
      console.log(res.data);
      angular.copy(res.data, factory.links);

    })
  }
  
  factory.create = function(body){
    return $http.post('/links', body, {headers: {Authorization: 'Bearer '+auth.getToken()}} ).then(function(res){
      console.log(res.data.data);
      factory.links.push(res.data.data)
    })
  }
  factory.deleteLink = function(index){
    var link_id = factory.userLinks[index]._id; //returns the _id of a specific link
    
    return $http.delete('/users/links/'+link_id,{gz:1},{headers:{Authorization:'Bearer '+auth.getToken()}} ).then(function(res){
      factory.userLinks.splice(index,1);
      console.log('deleted');
      console.log('http.delete')
      console.log(res)
    })
  }
  factory.upvote = function(index){
    var link_id = factory.links[index]._id; //returns the _id of a specific link
    
    return $http.put('/links/'+link_id+'/upvote',null,{headers:{Authorization: 'Bearer '+auth.getToken()}} ).then(function(res){
      factory.links[index].upvotes += 1;
      console.log('upvoted');
    })
  }
  
  factory.saveFavorite = function(index){
    var link_id = factory.links[index]._id; //returns the _id of a specific link
    
    return $http.put('/links/'+link_id+'/favorite',null,{headers:{Authorization: 'Bearer '+auth.getToken()}} ).then(function(res){
      //factory.links[index].upvotes += 1;
      console.log('saveFavorite');
      console.log(res);
      angular.copy(res.favorites,factory.favorites);
      factory.links[index].favorites += 1;
    })
  }
  
  factory.getUserLinks = function(user_id){
    console.log('getUserLinks'+user_id);
    return $http.get('/links/'+user_id,{headers:{Authorization:'Bearer '+auth.getToken()}} ).then(function(res){
      console.log('getUserLinks');
      console.log(res.data);
      angular.copy(res.data, factory.userLinks)
    })
  };
  
  factory.getUserFavorites = function(user_id){
    console.log('getuserfavorites'+user_id);
    return $http.get('/links/'+user_id+'/favorite',{headers:{Authorization:'Bearer '+auth.getToken()}} ).then(function(res){
      console.log('getUserFavorites');
      console.log(res)
      angular.copy(res.data.favorites,factory.favorites);
    })
  }

  return factory;
  
}]);

app.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
    }
  }
});

app.factory('auth', ['$http', '$window', function($http, $window){
   var auth = {};
   
   auth.saveToken = function (token){
     $window.localStorage['flapper-news-token'] = token;
   };
  
   auth.getToken = function (){
     return $window.localStorage['flapper-news-token'];
   }
   
   auth.isLoggedIn = function(){
     var token = auth.getToken();
     
     if(token){
       var payload = JSON.parse($window.atob(token.split('.')[1]));
       return payload.exp > Date.now() / 1000;
     } else {
       return false;
     }
   };
   
   auth.currentUserID = function(){
     if(auth.isLoggedIn()){
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));
      
      return payload._id;
     }
   };
   
   auth.currentUser = function(){
      if(auth.isLoggedIn()){
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));
    
        return payload.username;
      }
    };
   
   auth.register = function(user){
      return $http.post('/register', user).success(function(data){
        auth.saveToken(data.token);
      });
    };
   
   auth.logIn = function(user){
      return $http.post('/login', user).success(function(data){
        auth.saveToken(data.token);
      });
    };
   
   auth.logOut = function(){
      $window.localStorage.removeItem('flapper-news-token');
    };

   return auth;
}])
app.controller('PostsCtrl', ['$scope','links', 'auth', function($scope,links, auth){
    
    //$scope.post = post // this gets a single post,
                       // whereas posts gets the factory
                       
    $scope.links = links.links; //returns all linkterest links
    
    console.log($scope.links);
    
    $scope.isLoggedIn = auth.isLoggedIn;
    
   
    /*$scope.addComment = function(){
      if($scope.body === '') { return; }
        posts.addComment(post._id, {
          body: $scope.body,
          author: 'user'
        })
        
        .success(function(comment) {
          $scope.post.comments.push(comment);
        })
        
        .error(function(err,data){
          console.log(err);
        });
        
        $scope.body = '';
    };
   
    $scope.incrementUpvotes = function(comment) {
      posts.upvoteComment(post, comment)
    };
    */
}]);
app.factory('posts', ['$http', 'auth', function($http, auth){
  var factory = {
     posts:[
      {title: 'post 1', upvotes: 5}
    ]
  };
  
  factory.getAll = function() {
    return $http.get('/posts').success(function(data){
      angular.copy(data, factory.posts);
    })
    .error(function(err,data){console.log(err)});
  };
  
  factory.create = function(post) {
    return $http.post('/posts', post, {headers: {Authorization: 'Bearer '+auth.getToken()}}).success(function(data){
      factory.posts.push(data);
    })
    .error(function(err,data){console.log(err)});
  };
  
  factory.upvote = function(post) {
    return $http.put('/posts/' + post._id + '/upvote',null,{headers: {Authorization: 'Bearer '+auth.getToken()}})
      .success(function(data){
        post.upvotes += 1;
      });
  };
  
  factory.get = function(id) {
    return $http.get('/posts/' + id).then(function(res){
      return res.data;
    });
  };
  
  factory.addComment = function(id, comment) {
    return $http.post('/posts/' + id + '/comments', comment, {headers: {Authorization: 'Bearer '+auth.getToken()}});
  };
  
  factory.upvoteComment = function(post, comment) {
    return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote',null, {headers: {Authorization: 'Bearer '+auth.getToken()}})
      .success(function(data){
        comment.upvotes += 1;
      });
  };

  return factory;
}]);

var tweets = 'https://twitter-pi.herokuapp.com/tweets';
var logedIn = false;
var loginStatus;
var statusPath;
var profilePage;
var userObject;
var username;


var UsersCollection = Backbone.Collection.extend({
    url: 'https://twitter-pi.herokuapp.com/users?include=tweets'
});

var LoginCollection = Backbone.Collection.extend({
  url: "https://twitter-pi.herokuapp.com/oauth/token"
});

var TweetCollection = Backbone.Collection.extend({
  url: "https://twitter-pi.herokuapp.com/tweets"
});

var HeaderView = Backbone.View.extend({
  template: _.template($("#header").html()),

  className: "header",

  render: function(){
    if(logedIn === false){
      loginStatus = "Login";
      statusPath = "#login";
    }
    else{
      loginStatus = username;
      statusPath = "#home";
    }

    this.$el.html(this.template());
    return this;
  }
});


var HomepageView = Backbone.View.extend({
  template: _.template($("#homepage").html()),

  render: function(){
    this.$el.html(this.template());
    return this;
  }
});

var LoginView = Backbone.View.extend({
  template: _.template($("#login").html()),

  events: {
    "click .loginSubmit" : "handleLoginSubmit",
    "keypress .password" : "handleEnter"
  },

  handleLogin: function(){
    var $this = this;
    username = this.$(".username").val();
    this.password = this.$(".password").val();

    userObject = this.collection.toJSON()[0].data.filter(function(user){
        return (user.attributes.email === username);
    });

    console.log(userObject);

    if(userObject.length === 0){
      alert("D'oh!");
    }
    else{
      if($this.password.trim()){
        var loginCollection = new LoginCollection();
        loginCollection.create({
            "grant_type": "password",
            "username": username,
            "password": $this.password
        },
        {success: function(data){
          token = data.attributes.access_token;
          addToken();
          logedIn = true;
          router.navigate("home",
          {trigger: true});},
         error: function(){alert("Invalid password. Doh!");}});
      }
    else {
      alert("get a password!");
    }
  }

  },

  handleLoginSubmit: function(){
    this.handleLogin();
  },

  handleEnter: function(event){
    if(event.keyCode === 13)
      this.handleLogin();
    else
      return;
  },

  render: function(){
    var users = this.collection.toJSON();
    this.$el.html(this.template());
    return this;
  }
});

var RegisterView = Backbone.View.extend({
  template: _.template($("#register").html()),

  events: {
      "click .registername" : "collectRegistration"
  },

  render: function(){
    this.$el.html(this.template());
    return this;
  },

  collectRegistration: function(){
    var email = $('.email').val();
    var password = $('.password').val();
    var passtest = $('.passwordconfirm').val();
    if( password != passtest ){
      alert("D'oh! You're password is whack");
      $('.password').val('');
      $('.passwordconfirm').val('');
    }
    else {
        var registrationCollection = new UsersCollection();
        registrationCollection.create({ "user" :{
            "email": email,
            "password": password,
            "avatar": null
          }});
        router.navigate("login", {trigger: true});
  }
}
});


var HomeView = Backbone.View.extend({
  template: _.template($("#home").html()),

    tagName: "li",

  events: {"click .tweet" : "post"},

  render: function(){
    var users = this.collection.toJSON();
    this.$el.html(this.template({users: this.collection.toJSON()}));
    return this;
  },

  post: function(){
    var tweetCollection = new TweetCollection();
    tweetCollection.create({"tweet": {
      "body": "yolo!"
}});
  }
});

var UsersView = Backbone.View.extend({
  template: _.template($("#users").html()),

  initialize: function(options){
    // this.listenTo(this.collection, 'fetch', this.render);
    this.pageId = options.pageId;
  },

  render: function(){
    this.$el.html(this.template({
      page: this.pageId + 1,
      users: this.collection.toJSON()
    }));
    return this;
  }
});

var UserProfileView = Backbone.View.extend({
  template: _.template($("#userProfile").html()),

  render: function(){
    this.$el.html(this.template());
    return this;
  }
});


var Router = Backbone.Router.extend({



  routes: {
    "": "homepage",
    "login": "login",
    "register": "register",
    "home": "dashboard",
    "users": "users",
    "users/:pageId": "users",
    "users/profile/:userId": "userProfile"
  },

  homepage: function(){
    $("main").html("");

    var collection = new UsersCollection();
    console.log(collection.toJSON());

    var header = new HeaderView({collection: collection});
    var homepage = new HomepageView();
    collection.fetch({
      success: function(){
        $("main").append(header.render().$el);
        $("main").append(homepage.render().$el);
      },
      error: function(){
        $("main").append("Doh!");
      }
    });
  },

  login: function(){
    $("main").html("");

    var collection = new UsersCollection();

    var header = new HeaderView({collection: collection});
    var login = new LoginView({collection: collection});
    collection.fetch({
      success: function(){
        $("main").append(header.render().$el);
        $("main").append(login.render().$el);
      },
      error: function(){
        $("main").append("Doh!");
      }
    });

    // collection.create({"user":{
    //   "email": "yolo@swag.com",
    //   "password": "doh",
    //   "avatar": null
    // }});
  },

  register: function(){
    $("main").html("");

    var header = new HeaderView();
    $("main").append(header.render().$el);

    var register = new RegisterView();
    $("main").append(register.render().$el);
  },

  dashboard: function(){
    $("main").html("");

    var collection = new UsersCollection();

    var header = new HeaderView();
    var home = new HomeView({collection: collection});

    collection.fetch({
      success: function(){
        $("main").append(header.render().$el);
        $("main").append(home.render().$el);
      },
      error: function(){
        $("main").append("Doh!");
      }
    });
  },



  users: function(pageId){
    $("main").html("");


    var header = new HeaderView();
    $("main").append(header.render().$el);

    var collection = new UsersCollection();
    var users = new UsersView({
      pageId: Number(pageId),
      collection: collection
    });

    collection.fetch({
      success: function(){
        $("main").append(users.render().$el);
      }
    });
  },

  userProfile: function(){
    var userId = this.id;
    var userProfile = new UserProfileView();
    $("main").html(userProfile.render().$el);
  }
});


var router = new Router();

Backbone.history.start();

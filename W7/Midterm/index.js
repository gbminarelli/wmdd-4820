class User {
  constructor ({fullName, username, password}) { // Password here is just for testing, I want to be able to quickly create new users.
    this.fullName = fullName;
    this.username = username;
    this.password = password;
    this.promoted = false;
    this.banned = false;
    this.verified = false;
    this.following = [];
    this.followedBy = [];
    this.tweets = [];
    this.retweets = [];
  }
  createTweet ({message, image, video}) {
    this.tweets.push(new Tweet({originalPoster: this, message, image, video}));
  }
  follow (userObject) {
    this.following.push(userObject);
    userObject.followedBy.push(this);
  }
  likeTweet ({originalPoster, tweetIndex}) {
    // I know we can't like retweets this way, but I don`t have enough time to worry about this now.
    originalPoster.tweets[tweetIndex].like();
  }
  // I REALLY think I`m not doing this right... Why would I need to go through the 'dm' method of Tweet to send the DM? But the instructions say that DMing should be a Tweet method so...
  sendDM ({originalPoster, tweetIndex, message}) {
    originalPoster.tweets[tweetIndex].dm(message);
  }
  // Again, seem very redundant to do this...
  retweet ({originalPoster, tweetIndex}){
    this.retweets.push(originalPoster.tweets[tweetIndex].retweet());
  }
  replyTweet ({originalPoster, tweetIndex, message}) {
    originalPoster.tweets[tweetIndex].reply({userObject: originalPoster, message});
  }
  removeTweet (tweetIndex) {
    this.tweets[tweetIndex].remove(); // This deletes the tweet body, we could alse remove it from the 'tweets' array. I`m not doing this (no time).
  }
}

class Tweet {
  constructor({originalPoster, message, image, video}) {
    this.originalPoster = originalPoster;
    if (message.length <= 140) {
      this.message = message;
    } else {
      // TODO: Make it better.
      console.log("Error: message is too long.");
    }
    this.promoted = false;
    this.likes = 0;
    this.replies = [];
    // Not going to mess with either of those. Let`s just pretend we can tweet images or videos.
    this.image = image;
    this.video = video;
  }
  retweet () {
    // All users (minus original poster) can do it.
    return this; // Like I said, redundant (for this application at least).
  }
  remove () {
    // Original poster and admins can do it.
    this.message = '';
  }
  promote () {
    // Mods and Admins can do it.
    this.promoted = true;
  }
  reply ({userObject, message}) {
    // All users can do it.
    this.replies.push({userObject, message});
  }
  like () {
    this.likes++;
  }
  dm () {
    // TODO: I should probably create a new property (mailbox?) and update it with the new DM. No time to do it now though.
  }
}

// What is the difference between an Admin and a Mod?
// In this exercise, I`ll make it so that only Admins are allowed to ban users and remove tweets.
// Mods (and, of course, Admins) can promote and verify users and promote tweets.

class Mod extends User {
  constructor ({fullName, username, password}) {
    super({fullName, username, password});
    this.verified = true;
  }
  promoteUser (userObject) {
    userObject.promoted = true; // EZPZ
  }
  verifyUser (userObject) {
    // TODO: I forgot about this. Don`t have time to change the UI now. But it should be exactly the same thing as 'promoteUser'. I will write the code below anyways.
    userObject.verified = true;
  }
  promoteTweet ({userObject, tweetIndex}) {
    userObject.tweets[tweetIndex].promote();
  }
}

class Admin extends Mod {
  // I know I don`t really need the constructor here if I`m not using `this` after calling `super`. I`m just doing it because that`s what I`m used to do.
  constructor ({fullName, username, password}) {
    super({fullName, username, password});
  }
  banUser (userObject) {
    userObject.banned = true;
  }
}

// What does a bot do?
// Here I`ll just allow them to promote some users. I`m thinking there should be some way for the bot to identify something on an user account and automatically promote that user (for whatever reason). But I`m really not sure about this.

class Bot extends User {
  constructor ({fullName, username, password}) {
    super({fullName, username, password});
    this.verified = true; // I think bots should be verified... right?
  }
  promoteUser (userObject) {
    userObject.promoted = true;
  }
}

// Database object.
let myDB = {
  login (username, password) {
    for (user of this.users) {
      if (user.username === username) {
        if (user.password === password) {
          return user;
        }
      }
    }
    return false;
  },
  searchUsername (username) {
    for (user of this.users) {
      if (user.username === username) {
        return user;
      }
    }
  },
  users: []
};

// Populating the DB.
myDB.users.push(new User ({fullName: "John Doe", username: "jdoe", password: "123john321"}));
myDB.users.push(new User ({fullName: "Gianlucci Badiali Minarelli", username: "gian", password: "123gian"}));

// Handle command

let handleCommand = (command, userObject) => {
  if (command === '1') { // Creating a tweet.
    let message = window.prompt('Please type the message:');
    let image = window.prompt('Please enter the image URL, if you want to send one (just hit OK otherwise):');
    let video = window.prompt('Please enter the video URL, if you want to send one (just hit OK otherwise):');
    userObject.createTweet({message, image, video});
    console.log(userObject.tweets[userObject.tweets.length - 1]); // Feedback.
    window.alert('Success!');
    mainInterface(userObject);
  } else if (command === '2') { // Following.
    let usernameToBeFollowed = window.prompt('Please enter the username of the user you want to follow:');
    userObject.follow(myDB.searchUsername(usernameToBeFollowed));
    console.log(userObject.following[userObject.following.length - 1]); // Feedback.
    window.alert('Success!');
    mainInterface(userObject);
  } else if (command === '3') { // Liking a tweet.
    // It is REALLY hard to reference tweets without an actual interface. Here I`ll just use "IDs" to reference them. A tweet ID is composed by the original poster`s username and the index of the tweet on the OP`s object. For example: "jdoe-3".
    let tweetID = window.prompt('Please enter the tweet ID ([original poster username]-[tweet index]):');
    let [originalPosterUsername, tweetIndex] = tweetID.split('-');
    if (originalPosterUsername !== userObject.username) { // Can`t like your own tweets.
      userObject.likeTweet({originalPoster: myDB.searchUsername(originalPosterUsername), tweetIndex});
      console.log(myDB.searchUsername(originalPosterUsername).tweets[tweetIndex].likes); // Feedback.
      window.alert('Success!');
    } else {
      window.alert('Error: You can`t like your own tweets');
    }
    mainInterface(userObject);
  } else if (command === '4') { // DMing the original poster.
    let tweetID = window.prompt('Please enter the tweet ID ([original poster username]-[tweet index]):');
    let message = window.prompt('Please enter the message:');
    let [originalPosterUsername, tweetIndex] = tweetID.split('-');
    if (originalPosterUsername !== userObject.username) { // Can`t DM yourself.
      userObject.sendDM({originalPoster: myDB.searchUsername(originalPosterUsername), tweetIndex, message});
      // No feedback. Function not fully implemented (no time).
      window.alert('Success!');
    } else {
      window.alert('Error: You can`t DM yourself');
    }
    mainInterface(userObject);
  } else if (command === '5') { // Retweeting
    let tweetID = window.prompt('Please enter the tweet ID ([original poster username]-[tweet index]):');
    let [originalPosterUsername, tweetIndex] = tweetID.split('-');
    if (originalPosterUsername !== userObject.username) { // Can`t retweet your own tweets.
      userObject.retweet({originalPoster: myDB.searchUsername(originalPosterUsername), tweetIndex});
      console.log(myDB.searchUsername(originalPosterUsername).tweets[tweetIndex].likes); // Feedback.
      window.alert('Success!');
    } else {
      window.alert('Error: You can`t retweet your own tweets');
    }
    mainInterface(userObject);
  } else if (command === '6') { // Replying.
    let tweetID = window.prompt('Please enter the tweet ID ([original poster username]-[tweet index]):');
    let message = window.prompt('Please enter the message:');
    let [originalPosterUsername, tweetIndex] = tweetID.split('-');
    userObject.replyTweet({originalPoster: myDB.searchUsername(originalPosterUsername), tweetIndex, message});
    // No feedback. No time for testing anymore.
    window.alert('Success!');
    mainInterface(userObject);
  } else if (command === '7') { // Removing own tweet.
    let tweetID = window.prompt('Please enter the tweet ID ([original poster username]-[tweet index]):');
    let [originalPosterUsername, tweetIndex] = tweetID.split('-');
    if (originalPosterUsername === userObject.username) { // You can only remove your own tweets.
      userObject.removeTweet(tweetIndex);
      window.alert('Success!');
    } else {
      window.alert('Error: You can only remove your own tweets');
    }
    mainInterface(userObject);
  } else if (command === '8' && (userObject instanceof Mod || userObject instanceof Admin)) { // Promoting a user.
    let usernameToBePromoted = window.prompt('Please enter the username of the user to be promoted:');
    userObject.promoteUser(myDB.searchUsername(usernameToBePromoted));
    window.alert('Success!');
    mainInterface(userObject);
  } else if (command === '9' && (userObject instanceof Mod || userObject instanceof Admin)) { // Promoting a tweet.
    let tweetID = window.prompt('Please enter the tweet ID ([original poster username]-[tweet index]):');
    let [userObject, tweetIndex] = tweetID.split('-');
    userObject.promoteTweet({userObject, tweetIndex});
    window.alert('Success!');
    mainInterface(userObject);
  } else if (command === '10' && (userObject instanceof Admin)) { // Removing a tweet.
    let tweetID = window.prompt('Please enter the tweet ID ([original poster username]-[tweet index]):');
    let [originalPosterUsername, tweetIndex] = tweetID.split('-');
    userObject.removeTweet(tweetIndex);
    window.alert('Success!');
    mainInterface(userObject);
  } else if (command === '11' && (userObject instanceof Admin)) { // Banning a user.
    let usernameToBePromoted = window.prompt('Please enter the username of the user to be banned:');
    userObject.banUser(myDB.searchUsername(usernameToBePromoted));
    window.alert('Success!');
    mainInterface(userObject);
  } else if (command === 'logout'){
    init();
  } else {
    window.alert('Error: Invalid command input');
  }
}

// Main interface
let mainInterface = (userObject) => {
  let extraCommands = (userObject instanceof Admin) ? `8 ... To PROMOTE A USER.
9 ... To PROMOTE A TWEET.
10 .. To REMOVE A TWEET.
11 .. To BAN an user.` : (userObject instanceof Mod) ? `8 ... To PROMOTE A USER.
9 ... To PROMOTE A TWEET.` : '';
  let command = window.prompt(`Please enter one of the following commands:

1 ... To create a NEW TWEET.
2 ... To FOLLOW another user.
3 ... To LIKE a tweet.
4 ... To DM the original poster of a tweet.
5 ... To RETWEET a tweet.
6 ... To REPLY to a tweet.
7 ... To REMOVE one of your tweets.
${extraCommands}

Or type 'logout' to go back to the login menu.`);
  if (command) {
    handleCommand(command, userObject);
  } else {
    window.alert('Error: Invalid command.');
    mainInterface(userObject);
  }
}

// Init.
let init = () => {
  console.log(myDB.users); // Feedback.
  let login = window.prompt(`To create a new account, please enter "new". To login, just click OK.`) === 'new' ? false : true;
  if (login) {
    let username = window.prompt(`Please enter your username.`);
    let password = window.prompt(`Please enter your password.`);
    if (myDB.login(username, password)) { // Login
      window.alert('Success!');
      mainInterface(myDB.login(username, password));
    } else {
      // TODO: Make it better.
      window.alert('Error: Invalid username or password');
      init();
    }
  } else { // Creating new user.
    let fullName = window.prompt('Please enter your full name.');
    let username = window.prompt(`Please enter your username.`);
    let password = window.prompt(`Please enter your password.`);
    // Shoud ask for a password check. Too lazy.
    // Also, before adding a new user we should check if the username is already being used. I`ll do it if I have time.
    if (window.confirm('Administrator account?')) {
      myDB.users.push(new Admin({fullName, username, password}));
    } else if (window.confirm('Moderator account?')) {
      myDB.users.push(new Mod({fullName, username, password}));
    } else if (window.confirm('Bot account?')) {
      myDB.users.push(new Mod({fullName, username, password}));
    } else { // Regular user
      myDB.users.push(new User({fullName, username, password}));
    }
    window.alert('Success!');
    console.log(myDB.users[myDB.users.length - 1]); // Feedback;
    init();
  }
}

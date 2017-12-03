import * as firebase from "firebase-admin";
import * as Promise from "promise";
var axios = require("axios");

const apiHost = "http://bright-pi"
    , homeFBRoot = "/bright_home"
    , fbCertPath = "./igor-automation-fb-creds.json";

firebase.initializeApp({
  credential: firebase.credential.cert(fbCertPath),
  databaseURL: "https://igor-automation.firebaseio.com"
});

function jsonToFormData(obj : object) : string {
  var data : string = "";
  Object.keys(obj).forEach((key : string, i : number) => {
    data += key + "=" + obj[key] + "&";
  });
  return data;
}

function controlDoorCB(path : firebase.database.Reference, newVal : boolean) : () => void {
  return () => { path.set(newVal) };
}

function listenToGarageDoor(homeRef : firebase.database.Reference, val : number) {
  var doorPath : firebase.database.Reference = homeRef.child("/garage_doors/" + val);

  doorPath.on("value", (snapshot : firebase.database.DataSnapshot | null) => {
    if (!snapshot || !snapshot.val().trigger) {
      return;
    }
  
    console.log("Triggering door " + val);
    // make call to trigger door
    axios.post(apiHost + "/garage-doors/control",
      jsonToFormData({
        door: val,
        force: snapshot.val().force
      })
    ).then(() => {
      doorPath.set({trigger: false, force: false});
    });
  });
}

var home = firebase.database().ref(homeFBRoot);

listenToGarageDoor(home, 0);
listenToGarageDoor(home, 1);

console.log("initialized");

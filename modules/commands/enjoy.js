module.exports.config = {
  name: "enjoy",
  version: "1.0.2",
  permission: 0,
  prefix: true,
  premium:false,
  category:"group",
  credits: "RAZA",
  description: "Tag 10 times continuously",
  usages: "Tharakpan",
  cooldowns: 5,
  dependencies: { }
}

module.exports.run = async function({ api, args, Users, event}) {
const { threadID, messageID, senderID, mentions } = event;
var mention = Object.keys(mentions)[0];
if (!mention) return api.sendMessage("Please tag someone!", threadID, messageID);

setTimeout(() =>
api.sendMessage({
 body:"Oye BaBe CoMe HeRe 😗" + mentions[mention].replace("@", "") ,
 mentions: [{
  tag: mentions[mention].replace("@", ""),
  id: mention
 }]
}, threadID, messageID), 3000)
setTimeout(() =>
api.sendMessage("Main Uh K0o BtaTai TraRak Kya HoTi  🥵🫂", threadID), 6000)

setTimeout(() =>
api.sendMessage("ChaLo Ab Main STarT kRrTi Hun ", threadID), 9000)

var a = Math.floor(Math.random() * 3);
if ( a==0 ) {
setTimeout(() =>
api.sendMessage({
 body:"Yeh DeKho BaBe Umumuaahhhhh 😘 ❤️" + mentions[mention].replace("@", "") ,
 mentions: [{
  tag: mentions[mention].replace("@", ""),
  id: mention
 }]
}, threadID), 15000)
setTimeout(() =>
api.sendMessage({
 body:"LiPPi PRr Umumuaahhhhh  😘 💋" + mentions[mention].replace("@", "") ,
 mentions: [{
  tag: mentions[mention].replace("@", ""),
  id: mention
 }]
}, threadID), 20000)
setTimeout(() =>
api.sendMessage({
 body:"JaNu Z0or Sy Hug 🤗🫂" + mentions[mention].replace("@", "") ,
 mentions: [{
  tag: mentions[mention].replace("@", ""),
  id: mention
 }]
}, threadID), 25000)
setTimeout(() =>
api.sendMessage({
 body: "Neck Prr BiTe Umumuaahhhhh 😘🙈🙈🙈"+ mentions[mention].replace("@", "") ,
 mentions: [{
  tag: mentions[mention].replace("@", ""),
  id: mention
 }]
}, threadID), 30000)
setTimeout(() =>
api.sendMessage({
 body: "Lips 👄 Prr BiTe Aah umumuaahhhhh 😘💋"+ mentions[mention].replace("@", "") ,
 mentions: [{
  tag: mentions[mention].replace("@", ""),
  id: mention
 }]
}, threadID), 35000)
setTimeout(() =>
api.sendMessage({
 body: "Umumuaahhhhh Umumuaahhhhh 😘"+ mentions[mention].replace("@", "") ,
 mentions: [{
  tag: mentions[mention].replace("@", ""),
  id: mention
 }]
}, threadID), 40000)
setTimeout(() =>
api.sendMessage({
 body:"JaNu KYa Huwa Hosh kRro Abhi T0o Start KiYa 😘😘😘" + mentions[mention].replace("@", "") ,
 mentions: [{
  tag: mentions[mention].replace("@", ""),
  id: mention
 }]
}, threadID), 45000)
setTimeout(() =>
api.sendMessage({
 body: " JaNu SuNo Naww Ab Kaha Bag Rhy 🤪☹️🙈"+ mentions[mention].replace("@", "") ,
 mentions: [{
  tag: mentions[mention].replace("@", ""),
  id: mention
 }]
}, threadID), 50000)
setTimeout(() =>
api.sendMessage({
 body: "Tum T0o Meko Pyal kRty Na 💋😘"+ mentions[mention].replace("@", "") ,
 mentions: [{
  tag: mentions[mention].replace("@", ""),
  id: mention
 }]
}, threadID), 55000)
setTimeout(() =>
api.sendMessage({
 body:"SHarMao MaT Blo Ilu Ilu 😘🤪🙉" + mentions[mention].replace("@", "") ,
 mentions: [{
  tag: mentions[mention].replace("@", ""),
  id: mention
 }]
}, threadID), 60000)
}
if (a==1) {
setTimeout(() =>
api.sendMessage({
 body:"Hawn JaNu 1 PaPpi Is GaL Pr 1 PaPpi Is Gal Prr umumuaahhhhh umumuaahhhhh 😘😘 " + mentions[mention].replace("@", "") ,
 mentions: [{
  tag: mentions[mention].replace("@", ""),
  id: mention
 }]
}, threadID), 15000)
setTimeout(() =>
api.sendMessage({
 body:"JaNu ShaRam Aa Rhi KYa 🤪 " + mentions[mention].replace("@", "") ,
 mentions: [{
  tag: mentions[mention].replace("@", ""),
  id: mention
 }]
}, threadID), 20000)
}
if (a==2) {
setTimeout(() =>
api.sendMessage({
 body:"Tharaki JaNu 😜😜😜" + mentions[mention].replace("@", "") ,
 mentions: [{
  tag: mentions[mention].replace("@", ""),
  id: mention
 }]
}, threadID), 15000)
}
};
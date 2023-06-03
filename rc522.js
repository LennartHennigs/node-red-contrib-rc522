module.exports = function(RED) {
  function rc522Node(config) {
    RED.nodes.createNode(this, config);
    this.blockedFor = config.blockedFor;
    var node = this;

    const Mfrc522 = require("../mfrc522-rpi/index");
    const SoftSPI = require("../rpi-softspi/index");
    const softSPI = new SoftSPI({
      clock:  23,
      mosi:   19,
      miso:   21,
      client: 24
    });
    const mfrc522 = new Mfrc522(softSPI).setResetPin(22);

    let last_uid = "";
    let last_time = 0;
    const refreshRate = 0.5;

    setInterval(function() {
      const timestamp = Date.now();
      const nextTime = last_time + node.blockedFor * 1000;
      if (timestamp > nextTime) {
        node.status({});
      }
      mfrc522.reset();
      let cardFindResponse = mfrc522.findCard();
      if (cardFindResponse.status) {
        const bitSize = cardFindResponse.bitSize;
        let cardUidResponse = mfrc522.getUid();
        if (cardUidResponse.status) {
          let uid = cardUidResponse.data.map(val => val.toString(16).padStart(2, '0')).join(':').toUpperCase();

          if  (uid !== last_uid || timestamp > nextTime) {
            node.status({
              fill: "green",
              shape: "dot",
              text: uid
            });
            last_time = timestamp;
            last_uid = uid;
            node.send({"payload": {
              "uid": uid,
              "timestamp": timestamp,
              "bitSize": bitSize
            }});

            node.log(`New Card detected, CardType: ${bitSize}`);
            node.log(`UID: ${uid}`);
          }
        } else {
          node.log("Card read error!");
        }
      }
    }, refreshRate * 1000);
  }
  RED.nodes.registerType("rc522",rc522Node);
}

module.exports = function(RED) {

  function rc522Node(config) {
    RED.nodes.createNode(this, config);
    this.blockedFor = config.blockedFor;
    var node = this;

    const Mfrc522 = require("../mfrc522-rpi/index");
    const SoftSPI = require("../rpi-softspi/index");
    const softSPI = new SoftSPI({
      clock:  23, // pin number of SCLK
      mosi:   19, // pin number of MOSI
      miso:   21, // pin number of MISO
      client: 24  // pin number of CS
    });
    const mfrc522 = new Mfrc522(softSPI).setResetPin(22);

    let last_uid = "";
    let last_time = 0;
    const refreshRate = 0.5;

    setInterval(function() {
      const timestamp = Date.now();
      if (timestamp > (last_time + node.blockedFor * 1000)) {
        node.status({});
      }
      mfrc522.reset();
      let response = mfrc522.findCard();
      if (response.status) {
        const bitSize = response.bitSize;
        response = mfrc522.getUid();
        if (response.status) {
          const uid_array = response.data;
          const uid =
            uid_array[0].toString(16) +
            uid_array[1].toString(16) +
            uid_array[2].toString(16) +
            uid_array[3].toString(16);
            if  (uid != last_uid || timestamp > (last_time + node.blockedFor * 1000)) {
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
//                 "uid_array": uid_array,
                 "bitSize": bitSize
               }});

  node.log("New Card detected, CardType: " + bitSize);
  node.log("UID: " + uid);

          }
        } else {
         node.log("Card read error!");
         return;
        }
      } else {
        return;
      }
    }, refreshRate * 1000);
  }
  RED.nodes.registerType("rc522",rc522Node);
}

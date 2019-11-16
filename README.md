# node-red-contrib-rc522

A [Node-Red][1] node that allows you to read NFC tags with an RC522 card reader. You need to connect to RC522 card reader to the following pins:

SDA		24 (BCM 8)
SCK		23 (BCM 11)
MOSI	19 (BCM 10)
MISO	21 (BCM 9)
IRQ		-
GND 	20 
RST 	22 (BCM 25)
VCC		17 (3v3 PWR)

See [pinout.xyz][2] to identify the proper pins.

[1]:	https://nodered.org
[2]:	https://pinout.xyz/
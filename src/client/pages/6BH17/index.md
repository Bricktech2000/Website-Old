MiniML 1.0
//Copyright Emilien Breton

Preface
-------

Recently, I wanted to try FPV drone simulators, but my radio wouldn't connect to my computer. Then, I stumbled upon {a video:: https://www.youtube.com/watch?v=TRnu2_TI9Vk} that showed how to take an [iBUS] receiver and an /arduino/ to make a simulator adapter. As I already had all the necessary components, I went right to building it.

Below is a video from my {YouTube Channel:: https://www.youtube.com/channel/UCGj6pfxZ0XYJU29XNwXPPxg/featured} of me building and setting up the adapter:
# demo
	<div class="iframe-container"><iframe width="560" height="315" src="https:\/\/www.youtube.com\/embed\/W75Hf516KTA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><\/div>

And here's how the finished adapter looks:
# img
	{{thumbnail.jpg}}


How to build it
---------------

Here's a full tutorial on how to build this adapter!

First, the parts list. You will need the following:
	* A FlySky Transmitter that supports [iBUS]
	* Any /arduino/ board (using the /Arduino Nano/)
	* Any [iBUS] receiver (using the /FS i6B/) with a servo adapter
	* 3 /Male to Female/ Jumper cables (using one red, one blue and one white)
	* A /USB to mini USB/ cable, to connect the /Arduino Nano/ to a PC

Making the connections is really easy. You need to connect the following things together:
	""Receiver *red* wire > *red* Jumper cable > [5V] pin on the Arduino""
	""Receiver *black* wire > *blue* Jumper cable > [GND] pin on the Arduino""
	""Receiver *yellow* wire > *white* Jumper cable > [TX1] pin on the Arduino""
	""Arduino [USB] port > /USB to mini USB/ cable > [USB] port on a PC""

Then, upload the [Examples > Clear EEPROM] code onto the arduino using the {Arduino IDE:: https://www.arduino.cc/en/Main/Donate}.
After that, if not done already, bind the [iBUS] receiver to your /FlySky/ transmitter in order to secure the connection.
Finally, download the latest {vJoySerialFeeder Software:: https://github.com/Cleric-K/vJoySerialFeeder/releases} for your operating system.
Once you have set up /vJoySerialFeeder/ with the [iBUS] protocol, your adapter will work flawlessly!

Conclusion
----------

This adapter is an awesome /hack/ because it allows anyone to use their FlySky [iBUS] transmitter to try out drone simulators without having to buy an annoying USB cable to connect it to a PC. It was a simple but effective project that is simply really useful!

import gpio_player as gpio
import sys

new_state = 0

if(len(sys.argv) >= 2):
	if(sys.argv[1] == "1"):
		new_state = 1

gpio.set_state(new_state)
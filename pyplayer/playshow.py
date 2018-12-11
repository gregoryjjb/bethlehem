import sys
import gpio_player as gpio

if(len(sys.argv) < 3):
	sys.exit()

SONG_PATH = sys.argv[1]
SHOW_PATH = sys.argv[2]

print(sys.argv[1])

gpio.play_show(SONG_PATH, SHOW_PATH)

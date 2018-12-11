import time
import json
from pygame import mixer
try:
    import RPi.GPIO as GPIO
except:
    print('No RPi module found, using placeholder')
    import rpi_placeholder as GPIO

ON = GPIO.HIGH
OFF = GPIO.LOW
mode = GPIO.BCM
pins = [5,17,18,27,22,23,24,25]  #4, 17, 27, 22, 5, 6, 13, 26]

try:
    # Load JSON config
    with open('../data/config.json') as f:
        print('Config file found, loading')
        config = json.load(f)
        # Pin numbers
        pins = config['gpioPinNumbers']
        # Inverted output
        if config['invertPinOutput']:
            ON = GPIO.LOW
            OFF = GPIO.HIGH
        # BCM/Board
        if config['useBoardPinNumbering']:
            mode = GPIO.BOARD
except:
    print('No config file found, using defaults')

print('Pins: ' + str(pins))
print('On/off: ' + str(GPIO.HIGH) + '/' + str(GPIO.LOW))
print('Mode: ' + str(mode))

GPIO.setwarnings(False) # REMOVE IF YOU HAVE TO TROUBLESHOOT
GPIO.setmode(GPIO.BCM)

for pin in pins:
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, OFF)

#led = LED(4)

def execute_pinout(states):
    int_states = [int(numeric_string) for numeric_string in states]
    #print(str(int_states))
    max_range = min(len(pins), len(states))
    for i in range(0, max_range):
        if int_states[i] == 0:
            GPIO.output(pins[i], OFF)
        else:
            GPIO.output(pins[i], ON)

def set_state(onoff):
    print("Setting all channels to " + str(onoff))
    new_states = [int(onoff) for element in pins]
    execute_pinout(new_states)

def play_show(audio_path, show_path):
    # Open show file
    event_raw = []
    with open (show_path, 'r') as show:
        event_raw = [line.rstrip() for line in show]
    
    next_frame = 0
    
    # Play music
    mixer.pre_init(44100, -16, 2, 2048)
    mixer.init()
    mixer.music.load(audio_path)
    
    mixer.music.play()
    
    START_TIME = time.time()
    RUN_TIME = 0.0
    
    while True:
        PREV_TIME = RUN_TIME
        RUN_TIME = time.time() - START_TIME
        DELTA_TIME = RUN_TIME - PREV_TIME
        
        frame = event_raw[next_frame]
        elements = frame.split(',')
        next_time = float(elements[0])
        
        event_string = ""
        
        for i in range(1, len(elements)):
            event_string = event_string + str(elements[i])
        
        if RUN_TIME >= next_time:
            elements.pop(0)
            execute_pinout(elements)
            next_frame += 1
            if next_frame == len(event_raw):
                break
    
    mixer.music.fadeout(1000)
    time.sleep(1)
    execute_pinout([1,1,1,1,1,1,1,1])

import json
import requests
import sys
import win32api
import threading

# read user input
dateToFindList = sys.argv
dateToFindList.pop(0)
datesFound = []


def is_same_day(day):
    return day["availability"] and day["availability"]["available"] > 0


def set_interval(func, sec):
    def func_wrapper():
        set_interval(func, sec)
        func()
    t = threading.Timer(sec, func_wrapper)
    t.start()
    return t


def check_availability():
    # call out to the mountain reservation system
    bachelor_url = "https://api.parkwhiz.com/v4/venues/478498/events/?fields=%3Adefault%2Csite_url%2Cavailability%2Cvenue%3Atimezone&q=%20starting_after%3A2020-12-13T00%3A00%3A00-08%3A00&sort=start_time&zoom=pw%3Avenue"
    r = requests.get(bachelor_url)
    parsed_response = r.json()

    for day in parsed_response:
        for date in dateToFindList:
            if date in day["name"]:
                if is_same_day(day):
                    datesFound.append(day)

    numFound = len(datesFound)
    if numFound > 0:
        for d in datesFound:
            content = "Spots left: " + str(d["availability"]["available"])
            print(content)
            win32api.MessageBox(0, content, d["name"])
    else:
        message = ", ".join(dateToFindList) + " not found"
        print(message)


set_interval(check_availability, 15)

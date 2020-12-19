"use strict";
// REMINDER
// run `npx babel --watch src --out-dir . --presets react-app/prod`
// in the directory to get updates locally (idk what i did to require that)

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var check_availability_url = "https://api.parkwhiz.com/v4/venues/478498/events/?fields=%3Adefault%2Csite_url%2Cavailability%2Cvenue%3Atimezone&q=%20starting_after%3A2020-12-13T00%3A00%3A00-08%3A00&sort=start_time&zoom=pw%3Avenue";

var make_reservation_url = "https://www.mtbachelor.com/plan-your-trip/getting-here/parking-reservations";
var _localStorageSkiDaysKey = "daysIWantToSki";

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.intervalKey = undefined;

    _this.handleDateChange = function (e) {
      var copy = [].concat(_toConsumableArray(_this.state.daysToSki));
      copy.push(transformDate(e.target.value));
      _this.updateDaysToSki(copy);
    };

    _this.handleRemoveDay = function (day) {
      var copy = [].concat(_toConsumableArray(_this.state.daysToSki));
      var removed = copy.filter(function (d) {
        return d != day;
      });
      _this.updateDaysToSki(removed);
    };

    _this.updateDaysToSki = function (days) {
      clearInterval(_this.intervalKey); // clear polling function
      _this.setState({ daysToSki: days });
      localStorage.setItem(_localStorageSkiDaysKey, JSON.stringify(days));
      _this.intervalKey = _this.pollOnInterval(days); // start polling again
    };

    _this.pollOnInterval = function (days) {
      if (days && days.length) {
        return setInterval(function () {
          return _this.pollIt(days);
        }, 15 * 1000);
      }
      return undefined;
    };

    _this.pollIt = function (daysIWantToSki) {
      fetch(check_availability_url).then(function (response) {
        if (response.ok) return response.json();
      }).then(function (days) {
        console.log("Checking for " + daysIWantToSki.join(", "));
        days.forEach(function (day) {
          var matchingDays = daysIWantToSki.filter(function (d) {
            return day.name.includes(d) && doesDayHaveParking(day);
          });
          if (matchingDays.length) {
            matchingDays.forEach(function (dizzle) {
              notify_day_available(dizzle);
              _this.handleRemoveDay(dizzle);
            });
          }
        });
      });
    };

    var localStorageDays = JSON.parse(localStorage.getItem(_localStorageSkiDaysKey)) || [];
    _this.state = { daysToSki: localStorageDays };
    _this.intervalKey = _this.pollOnInterval(_this.state.daysToSki);
    return _this;
  }

  _createClass(App, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      return React.createElement(
        AppWrapper,
        null,
        React.createElement(
          "div",
          { style: { display: "flex" } },
          this.state.daysToSki.map(function (day) {
            return React.createElement(DateToSki, {
              handleClick: _this2.handleRemoveDay,
              day: day,
              key: day
            });
          })
        ),
        React.createElement(
          Row,
          null,
          React.createElement(Step, { text: "Step 1: Enable Notifications (use Firefox)" }),
          React.createElement(NotificationsButton, null)
        ),
        React.createElement(
          Row,
          null,
          React.createElement(Step, { text: "Step 2: Select Your Days" }),
          React.createElement(Calendar, { onChange: this.handleDateChange })
        ),
        React.createElement(
          Row,
          null,
          React.createElement(Step, { text: "Step 3: Make reservation when your operating system notifies you!" })
        ),
        React.createElement(
          Row,
          null,
          React.createElement(Step, { text: "Step 5: Test it out. Find a day that has openings, and make sure it works!" })
        ),
        React.createElement(
          Row,
          null,
          React.createElement(Step, { text: "Step 4: Hang out, and pray to Ullr for snow!" })
        )
      );
    }
  }]);

  return App;
}(React.Component);

function Row(props) {
  return React.createElement(
    "div",
    {
      style: { display: "flex", flexDirection: "row", marginBottom: "10px" }
    },
    props.children
  );
}

function Step(props) {
  return React.createElement(
    "div",
    { style: { fontSize: "20px", marginRight: "20px" } },
    props.text
  );
}
function Calendar(props) {
  return React.createElement("input", { type: "date", onChange: props.onChange });
}

function NotificationsButton() {
  return React.createElement(
    "button",
    { onClick: handleEnableNotificationButton },
    "Enable"
  );
}

function AppWrapper(props) {
  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        maxWidth: "75%"
      }
    },
    props.children
  );
}

function DateToSki(props) {
  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        padding: "3px",
        height: 30,
        border: "1px solid grey",
        borderRadius: "4px",
        marginRight: "10px"
      }
    },
    props.day,
    React.createElement(
      "span",
      {
        onClick: function onClick() {
          return props.handleClick(props.day);
        },
        style: { cursor: "pointer", marginLeft: "5px" },
        title: "Actually, nah. Don't wannt ski this day"
      },
      "X"
    )
  );
}

function MakeReservationLink() {
  return React.createElement(
    "a",
    { href: make_reservation_url, target: "_blank" },
    "Bachelor Reservation Page"
  );
}

function doesDayHaveParking(day) {
  return day.availability && day.availability.available > 0;
}

function transformDate(rawDate) {
  var yearMonthDay = rawDate.split("-");
  var month = yearMonthDay[1];
  var day = yearMonthDay[2];
  return monthDateToWord(parseInt(month)) + " " + parseInt(day);
}

function monthDateToWord(int) {
  switch (int) {
    case 1:
      return "Jan";
    case 2:
      return "Feb";
    case 3:
      return "Mar";
    case 4:
      return "Apr";
    case 5:
      return "May";
    case 6:
      return "Jun";
    case 7:
      return "Jul";
    case 8:
      return "Aug";
    case 8:
      return "Sept";
    case 10:
      return "Oct";
    case 11:
      return "Nov";
    case 12:
      return "Dec";
  }
}
var domContainer = document.querySelector("#app_container");
ReactDOM.render(React.createElement(App, null), domContainer);

function notify_day_available(day) {
  if (Notification.permission === "granted") {
    // show notification here
    var message = "Parking is available for " + day + "!!!";
    console.log(message);
    var my_notification = new Notification(message, {
      body: "Quick, click HERE to make the reservation!",
      icon: "https://bit.ly/2DYqRrh"
    });
    my_notification.onclick = bachelor_notification;
  }
}

function bachelor_notification(event) {
  event.preventDefault(); // prevent the browser from focusing the Notification's tab
  window.open(make_reservation_url, "_blank");
}

function handleEnableNotificationButton() {
  var title = "Notifications are enabled!";
  var message = "Watch for this alert here if your day opens up. Click this notification to be taken to the Bachelor reservation page. Try it now!";
  if (!window.Notification) {
    console.log("Browser does not support notifications.");
  } else {
    // check if permission is already granted
    if (Notification.permission === "granted") {
      // show notification here
      var theNotification = new Notification(title, {
        body: message,
        icon: "https://bit.ly/2DYqRrh"
      });
      theNotification.onclick = bachelor_notification;
    } else {
      // request permission from user
      Notification.requestPermission().then(function (p) {
        if (p === "granted") {
          // show notification here
          var notify = new Notification(title, {
            body: message,
            icon: "https://bit.ly/2DYqRrh"
          });
          notify.onclick = bachelor_notification;
        } else {
          console.log("User blocked notifications.");
        }
      }).catch(function (err) {
        console.error(err);
      });
    }
  }
}
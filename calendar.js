"use strict";
// REMINDER
// run `npx babel --watch src --out-dir . --presets react-app/prod`
// in the directory to get updates locally (idk what i did to require that)

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var mount_bachelor = {
  availability_url: "https://api.parkwhiz.com/v4/venues/478498/events/?fields=%3Adefault%2Csite_url%2Cavailability%2Cvenue%3Atimezone&q=%20starting_after%3A2020-12-13T00%3A00%3A00-08%3A00&sort=start_time&zoom=pw%3Avenue",
  make_reservation_url: "https://www.mtbachelor.com/plan-your-trip/getting-here/parking-reservations"
};

var copper_mountain = {
  availability_url: "https://api.parkwhiz.com/v4/venues/448854/events/?fields=%3Adefault%2Csite_url%2Cavailability%2Cvenue%3Atimezone&q=%20starting_after%3A2020-12-21T00%3A00%3A00-07%3A00&sort=start_time&zoom=pw%3Avenue",
  make_reservation_url: "https://www.coppercolorado.com/plan-your-trip/getting-here/parking"
};

var alta_mountain = {
  availability_url: "https://api.parkwhiz.com/v4/venues/478424/events/?fields=%3Adefault%2Csite_url%2Cavailability%2Cvenue%3Atimezone&q=%20starting_after%3A2020-12-21T00%3A00%3A00-07%3A00&sort=start_time&zoom=pw%3Avenue",
  make_reservation_url: "https://www.snowbird.com/parking/"
};

var SKI_RESORTS = {
  alta: alta_mountain,
  bachelor: mount_bachelor,
  copper: copper_mountain
};

var defaultResort = Object.keys(SKI_RESORTS)[0];

var _localStorageSkiDaysKey = "daysIWantToSki";
var _localStorageResortKey = "ski_resort";

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.intervalKey = undefined;

    _this.handleDateChange = function (e) {
      var copy = [].concat(_toConsumableArray(_this.state.daysToSki));
      var day = transformDate(e.target.value);
      if (copy.indexOf(day) === -1) {
        copy.push(transformDate(e.target.value));
        _this.updateDaysToSki(copy);
      } else {
        console.log("Day already being searched");
      }
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
        }, 10 * 1000);
      }
      return undefined;
    };

    _this.pollIt = function (daysIWantToSki) {
      var _SKI_RESORTS$_this$st = SKI_RESORTS[_this.state.skiResort],
          availability_url = _SKI_RESORTS$_this$st.availability_url,
          make_reservation_url = _SKI_RESORTS$_this$st.make_reservation_url;

      fetch(availability_url).then(function (response) {
        if (response.ok) return response.json();
      }).then(function (days) {
        console.log("Checking for " + daysIWantToSki.join(", "));
        days.forEach(function (dayInfo) {
          daysIWantToSki.filter(function (d) {
            return dayInfo.name.includes(d + " ");
          }) // dont match on "Mar 22" when "Mar 2" was picked
          .filter(function (d) {
            return doesDayHaveParking(dayInfo);
          }).forEach(function (d) {
            return notify_day_available(d, make_reservation_url);
          });
        });
      });
    };

    _this.handleResortChange = function (e) {
      var resort = e.target.value;
      _this.setState({ skiResort: resort });
      localStorage.setItem(_localStorageResortKey, resort);
    };

    var localStorageDays = JSON.parse(localStorage.getItem(_localStorageSkiDaysKey)) || [];
    var skiResort = localStorage.getItem(_localStorageResortKey) || defaultResort;
    _this.state = { daysToSki: localStorageDays, skiResort: skiResort };
    _this.intervalKey = _this.pollOnInterval(_this.state.daysToSki);
    return _this;
  }

  _createClass(App, [{
    key: "render",
    value: function render() {
      var make_reservation_url = SKI_RESORTS[this.state.skiResort].make_reservation_url;


      return React.createElement(
        AppWrapper,
        null,
        React.createElement(SelectedDays, {
          onRemove: this.handleRemoveDay,
          selectedDays: this.state.daysToSki
        }),
        React.createElement(Step, { text: "Step 1: Use Firefox" }),
        React.createElement(
          Step,
          { text: "Step 2: Select your hill" },
          React.createElement(Dropdown, {
            values: Object.keys(SKI_RESORTS),
            onChange: this.handleResortChange,
            selectedValue: this.state.skiResort,
            renderLabel: dispalySkiResortLabel
          })
        ),
        React.createElement(
          Step,
          { text: "Step 3: Enable notifications" },
          React.createElement(NotificationsButton, { link: make_reservation_url })
        ),
        React.createElement(
          Step,
          { text: "Step 4: Select your days" },
          React.createElement(Calendar, { onChange: this.handleDateChange })
        ),
        React.createElement(Step, { text: "Step 5: Test it out. Find a day that has openings, and make sure it works!" }),
        React.createElement(Step, { text: "Step 6: Hang out, and pray to the almighty Ullr" })
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
    Row,
    null,
    React.createElement(
      "div",
      { style: { fontSize: "21px", marginRight: "20px" } },
      props.text
    ),
    props.children
  );
}
function Calendar(props) {
  return React.createElement("input", { type: "date", onChange: props.onChange });
}

function NotificationsButton(props) {
  return React.createElement(
    "button",
    { onClick: function onClick() {
        return handleEnableNotificationButton(props.link);
      } },
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
        maxWidth: "75%",
        marginTop: "10%"
      },
      className: "center"
    },
    props.children
  );
}

function SelectedDays(props) {
  return React.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap" } },
    props.selectedDays.map(function (day) {
      return React.createElement(DateToSki, { handleClick: props.onRemove, day: day, key: day });
    })
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
        title: "Actually, nah. Not tryna ski this day"
      },
      "X"
    )
  );
}

function Dropdown(props) {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "select",
      {
        id: "mountainSelect",
        name: "mountains",
        onChange: props.onChange,
        value: props.selectedValue
      },
      props.values.map(function (val) {
        return React.createElement(
          "option",
          { value: val, key: val },
          props.renderLabel(val)
        );
      })
    )
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

function notify_day_available(day, makeReservationLink) {
  if (Notification.permission === "granted") {
    var title = "Parking is available for " + day + "!!!";
    var message = "Quick, click here to make the reservation!";

    // show notification here
    var my_notification = new Notification(title, { body: message });
    my_notification.onclick = function (e) {
      return onAlertClick(e, makeReservationLink);
    };
  }
}

function onAlertClick(event, makeReservationLink) {
  event.preventDefault(); // prevent the browser from focusing the Notification's tab
  window.open(makeReservationLink, "_blank");
}

function dispalySkiResortLabel(resort) {
  switch (resort) {
    case "alta":
      return "Alta Snowbird";
    case "bachelor":
      return "Mount Bachelor";
    case "copper":
      return "Copper Mountain";
  }
}

function handleEnableNotificationButton(makeReservationLink) {
  var title = "Notifications are enabled!";
  var message = "Watch for this alert here if your day opens up. Click this notification to be taken to the reservation page. Try it now!";
  if (!window.Notification) {
    console.log("Browser does not support notifications.");
  } else {
    // check if permission is already granted
    if (Notification.permission === "granted") {
      // show notification here
      var theNotification = new Notification(title, { body: message });
      theNotification.onclick = function (e) {
        return onAlertClick(e, makeReservationLink);
      };
    } else {
      // request permission from user
      Notification.requestPermission().then(function (p) {
        if (p === "granted") {
          // show notification here
          var notify = new Notification(title, { body: message });
          notify.onclick = function (e) {
            return onAlertClick(e, makeReservationLink);
          };
        } else {
          console.log("User blocked notifications.");
        }
      }).catch(function (err) {
        console.error(err);
      });
    }
  }
}
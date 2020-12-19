"use strict";
// REMINDER
// run `npx babel --watch src --out-dir . --presets react-app/prod`
// in the directory to get updates locally (idk what i did to require that)

const check_availability_url =
  "https://api.parkwhiz.com/v4/venues/478498/events/?fields=%3Adefault%2Csite_url%2Cavailability%2Cvenue%3Atimezone&q=%20starting_after%3A2020-12-13T00%3A00%3A00-08%3A00&sort=start_time&zoom=pw%3Avenue";

const make_reservation_url =
  "https://www.mtbachelor.com/plan-your-trip/getting-here/parking-reservations";
const _localStorageSkiDaysKey = "daysIWantToSki";

class App extends React.Component {
  intervalKey = undefined;

  constructor(props) {
    super(props);
    var localStorageDays =
      JSON.parse(localStorage.getItem(_localStorageSkiDaysKey)) || [];
    this.state = { daysToSki: localStorageDays };
    this.intervalKey = this.pollOnInterval(this.state.daysToSki);
  }

  handleDateChange = (e) => {
    var copy = [...this.state.daysToSki];
    copy.push(transformDate(e.target.value));
    this.updateDaysToSki(copy);
  };

  handleRemoveDay = (day) => {
    var copy = [...this.state.daysToSki];
    var removed = copy.filter((d) => d != day);
    this.updateDaysToSki(removed);
  };

  updateDaysToSki = (days) => {
    clearInterval(this.intervalKey); // clear polling function
    this.setState({ daysToSki: days });
    localStorage.setItem(_localStorageSkiDaysKey, JSON.stringify(days));
    this.intervalKey = this.pollOnInterval(days); // start polling again
  };

  pollOnInterval = (days) => {
    if (days && days.length) {
      return setInterval(() => this.pollIt(days), 15 * 1000);
    }
    return undefined;
  };

  pollIt = (daysIWantToSki) => {
    fetch(check_availability_url)
      .then((response) => {
        if (response.ok) return response.json();
      })
      .then((days) => {
        console.log(`Checking for ${daysIWantToSki.join(", ")}`);
        days.forEach((day) => {
          var matchingDays = daysIWantToSki.filter(
            (d) => day.name.includes(d) && doesDayHaveParking(day)
          );
          if (matchingDays.length) {
            matchingDays.forEach((dizzle) => {
              notify_day_available(dizzle);
              this.handleRemoveDay(dizzle);
            });
          }
        });
      });
  };

  render() {
    return (
      <AppWrapper>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {this.state.daysToSki.map((day) => {
            return (
              <DateToSki
                handleClick={this.handleRemoveDay}
                day={day}
                key={day}
              />
            );
          })}
        </div>
        <Row>
          <Step text="Step 1: Use Firefox" />
        </Row>
        <Row>
          <Step text="Step 2: Enable Notifications" />
          <NotificationsButton />
        </Row>
        <Row>
          <Step text="Step 3: Select Your Days" />
          <Calendar onChange={this.handleDateChange} />
        </Row>
        <Row>
          <Step text="Step 4: Make reservation when your operating system notifies you!" />
        </Row>
        <Row>
          <Step text="Step 5: Test it out. Find a day that has openings, and make sure it works!" />
        </Row>
        <Row>
          <Step text="Step 6: Hang out, and pray to Ullr for snow!" />
        </Row>
      </AppWrapper>
    );
  }
}
function Row(props) {
  return (
    <div
      style={{ display: "flex", flexDirection: "row", marginBottom: "10px" }}
    >
      {props.children}
    </div>
  );
}

function Step(props) {
  return (
    <div style={{ fontSize: "20px", marginRight: "20px" }}>{props.text}</div>
  );
}
function Calendar(props) {
  return <input type="date" onChange={props.onChange} />;
}

function NotificationsButton() {
  return <button onClick={handleEnableNotificationButton}>Enable</button>;
}

function AppWrapper(props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        maxWidth: "75%",
      }}
    >
      {props.children}
    </div>
  );
}

function DateToSki(props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "3px",
        height: 30,
        border: "1px solid grey",
        borderRadius: "4px",
        marginRight: "10px",
      }}
    >
      {props.day}
      <span
        onClick={() => props.handleClick(props.day)}
        style={{ cursor: "pointer", marginLeft: "5px" }}
        title="Actually, nah. Don't wannt ski this day"
      >
        X
      </span>
    </div>
  );
}

function MakeReservationLink() {
  return (
    <a href={make_reservation_url} target="_blank">
      Bachelor Reservation Page
    </a>
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
let domContainer = document.querySelector("#app_container");
ReactDOM.render(<App />, domContainer);

function notify_day_available(day) {
  if (Notification.permission === "granted") {
    // show notification here
    var message = `Parking is available for ${day}!!!`;
    console.log(message);
    var my_notification = new Notification(message, {
      body: `Quick, click here to make the reservation!`,
      icon: "https://bit.ly/2DYqRrh",
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
  var message =
    "Watch for this alert here if your day opens up. Click this notification to be taken to the Bachelor reservation page. Try it now!";
  if (!window.Notification) {
    console.log("Browser does not support notifications.");
  } else {
    // check if permission is already granted
    if (Notification.permission === "granted") {
      // show notification here
      var theNotification = new Notification(title, {
        body: message,
        icon: "https://bit.ly/2DYqRrh",
      });
      theNotification.onclick = bachelor_notification;
    } else {
      // request permission from user
      Notification.requestPermission()
        .then(function (p) {
          if (p === "granted") {
            // show notification here
            var notify = new Notification(title, {
              body: message,
              icon: "https://bit.ly/2DYqRrh",
            });
            notify.onclick = bachelor_notification;
          } else {
            console.log("User blocked notifications.");
          }
        })
        .catch(function (err) {
          console.error(err);
        });
    }
  }
}

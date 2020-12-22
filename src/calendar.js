"use strict";
// REMINDER
// run `npx babel --watch src --out-dir . --presets react-app/prod`
// in the directory to get updates locally (idk what i did to require that)

const mount_bachelor = {
  availability_url:
    "https://api.parkwhiz.com/v4/venues/478498/events/?fields=%3Adefault%2Csite_url%2Cavailability%2Cvenue%3Atimezone&q=%20starting_after%3A2020-12-13T00%3A00%3A00-08%3A00&sort=start_time&zoom=pw%3Avenue",
  make_reservation_url:
    "https://www.mtbachelor.com/plan-your-trip/getting-here/parking-reservations",
};

const copper_mountain = {
  availability_url:
    "https://api.parkwhiz.com/v4/venues/448854/events/?fields=%3Adefault%2Csite_url%2Cavailability%2Cvenue%3Atimezone&q=%20starting_after%3A2020-12-21T00%3A00%3A00-07%3A00&sort=start_time&zoom=pw%3Avenue",
  make_reservation_url:
    "https://www.coppercolorado.com/plan-your-trip/getting-here/parking",
};

const alta_mountain = {
  availability_url:
    "https://api.parkwhiz.com/v4/venues/478424/events/?fields=%3Adefault%2Csite_url%2Cavailability%2Cvenue%3Atimezone&q=%20starting_after%3A2020-12-21T00%3A00%3A00-07%3A00&sort=start_time&zoom=pw%3Avenue",
  make_reservation_url: "https://www.snowbird.com/parking/",
};

const SKI_RESORTS = {
  alta: alta_mountain,
  bachelor: mount_bachelor,
  copper: copper_mountain,
};

const defaultResort = Object.keys(SKI_RESORTS)[0];

const _localStorageSkiDaysKey = "daysIWantToSki";
const _localStorageResortKey = "ski_resort";

class App extends React.Component {
  intervalKey = undefined;

  constructor(props) {
    super(props);
    var localStorageDays =
      JSON.parse(localStorage.getItem(_localStorageSkiDaysKey)) || [];
    var skiResort =
      localStorage.getItem(_localStorageResortKey) || defaultResort;
    this.state = { daysToSki: localStorageDays, skiResort };
    this.intervalKey = this.pollOnInterval(this.state.daysToSki);
  }

  handleDateChange = (e) => {
    var copy = [...this.state.daysToSki];
    var day = transformDate(e.target.value);
    if (copy.indexOf(day) === -1) {
      copy.push(transformDate(e.target.value));
      this.updateDaysToSki(copy);
    } else {
      console.log("Day already being searched");
    }
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
      return setInterval(() => this.pollIt(days), 10 * 1000);
    }
    return undefined;
  };

  pollIt = (daysIWantToSki) => {
    var { availability_url, make_reservation_url } = SKI_RESORTS[
      this.state.skiResort
    ];
    fetch(availability_url)
      .then((response) => {
        if (response.ok) return response.json();
      })
      .then((days) => {
        console.log(`Checking for ${daysIWantToSki.join(", ")}`);
        days.forEach((dayInfo) => {
          daysIWantToSki
            .filter((d) => dayInfo.name.includes(d + " ")) // dont match on "Mar 22" when "Mar 2" was picked
            .filter((d) => doesDayHaveParking(dayInfo))
            .forEach((d) => notify_day_available(d, make_reservation_url));
        });
      });
  };

  handleResortChange = (e) => {
    var resort = e.target.value;
    this.setState({ skiResort: resort });
    localStorage.setItem(_localStorageResortKey, resort);
  };

  render() {
    var { make_reservation_url } = SKI_RESORTS[this.state.skiResort];

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
        <Step text="Step 1: Use Firefox" />
        <Step text="Step 2: Select your hill">
          <Dropdown
            values={Object.keys(SKI_RESORTS)}
            onChange={this.handleResortChange}
            selectedValue={this.state.skiResort}
            renderLabel={dispalySkiResortLabel}
          />
        </Step>
        <Step text="Step 3: Enable notifications">
          <NotificationsButton link={make_reservation_url} />
        </Step>
        <Step text="Step 4: Select your days">
          <Calendar onChange={this.handleDateChange} />
        </Step>
        <Step text="Step 5: Test it out. Find a day that has openings, and make sure it works!" />
        <Step text="Step 6: Hang out, and pray to the almighty Ullr" />
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
    <Row>
      <div style={{ fontSize: "21px", marginRight: "20px" }}>{props.text}</div>
      {props.children}
    </Row>
  );
}
function Calendar(props) {
  return <input type="date" onChange={props.onChange} />;
}

function NotificationsButton(props) {
  return (
    <button onClick={() => handleEnableNotificationButton(props.link)}>
      Enable
    </button>
  );
}

function AppWrapper(props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        maxWidth: "75%",
        marginTop: "10%",
      }}
      className={"center"}
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
        title="Actually, nah. Not tryna ski this day"
      >
        X
      </span>
    </div>
  );
}

function Dropdown(props) {
  return (
    <div>
      <select
        id="mountainSelect"
        name="mountains"
        onChange={props.onChange}
        value={props.selectedValue}
      >
        {props.values.map((val) => {
          return (
            <option value={val} key={val}>
              {props.renderLabel(val)}
            </option>
          );
        })}
      </select>
    </div>
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

function notify_day_available(day, makeReservationLink) {
  if (Notification.permission === "granted") {
    var title = `Parking is available for ${day}!!!`;
    var message = "Quick, click here to make the reservation!";

    // show notification here
    var my_notification = new Notification(title, { body: message });
    my_notification.onclick = (e) => onAlertClick(e, makeReservationLink);
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
  var message =
    "Watch for this alert here if your day opens up. Click this notification to be taken to the reservation page. Try it now!";
  if (!window.Notification) {
    console.log("Browser does not support notifications.");
  } else {
    // check if permission is already granted
    if (Notification.permission === "granted") {
      // show notification here
      var theNotification = new Notification(title, { body: message });
      theNotification.onclick = (e) => onAlertClick(e, makeReservationLink);
    } else {
      // request permission from user
      Notification.requestPermission()
        .then(function (p) {
          if (p === "granted") {
            // show notification here
            var notify = new Notification(title, { body: message });
            notify.onclick = (e) => onAlertClick(e, makeReservationLink);
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

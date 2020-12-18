var bachelor_url =
  "https://api.parkwhiz.com/v4/venues/478498/events/?fields=%3Adefault%2Csite_url%2Cavailability%2Cvenue%3Atimezone&q=%20starting_after%3A2020-12-13T00%3A00%3A00-08%3A00&sort=start_time&zoom=pw%3Avenue";

var daysToSki = ["Dec 19", "Dec 20"];

var response = fetch(bachelor_url)
  .then((response) => {
    if (response.ok) return response.json();
  })
  .then((days) => {
    var thing = days.filter((day) => {
      var foundDay = daysToSki.some((d) => day.name.includes(d));
      if (foundDay && doesDayHaveParking(day)) {
        console.log(day.name);
        return day;
      }
    });
  });

function doesDayHaveParking(day) {
  return day.availability && day.availability.available > 0;
}

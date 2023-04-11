"use strict";

const searchBox = document.getElementById("searchBox");
const cardsContainer = document.querySelector(".forecast-cards");
const days = document.querySelectorAll(".card-header .day");
const time = document.querySelectorAll(".card-header .time");
const degree = document.querySelectorAll(".degree");
const conditionImgs = document.querySelectorAll(".card-body img");
const realFeel = document.querySelectorAll(".card-data .real-feel");
const wind = document.querySelectorAll(".card-data .wind");
const pressure = document.querySelectorAll(".card-data .pressure");
const sunRise = document.querySelectorAll(".card-data .sunrise");
const sunSet = document.querySelectorAll(".card-data .sunset");
const cityLocation = document.querySelector(".location p");
const nameOfDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wendesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const abbrOfDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const recentCitiesContainer = document.querySelector(".city-items");
let recentCities = [];
let forecastData;
const percentBar = document.querySelectorAll(".rain-day-hours .percent");
const clearCitiesBtn = document.querySelector(".recent-header button");

// Getting Recent Cities user searched before.
if (JSON.parse(localStorage.getItem("recentCities"))) {
  recentCities = JSON.parse(localStorage.getItem("recentCities"));
  for (let item of recentCities) {
    showRecentCities(item);
  }
}

// Getting forecast data from Weather API
async function getForecast(city) {
  let response = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?days=7&q=${city}&key=7fdcd34ae77d4704bcd13602231104`
  );
  forecastData = await response.json();
  console.log(forecastData);
  displayWeather(forecastData);
}

// Setting default City to be Cairo
getForecast("cairo");

// Function to be executed whenever you want to search about new city
async function getCityWeather() {
  let searchCity = searchBox.value;
  if (searchCity != "") {
    await getForecast(searchCity);
    const imageSrc = await getCityImage(forecastData.location.name);
    const newCity = new AddCity(
      `${forecastData.location.name}`,
      `${forecastData.location.country}`,
      imageSrc
    );
    let foundCity;
    for (let i = 0; i < recentCities.length; i++) {
      foundCity = false;
      if (recentCities[i].city == newCity.city) {
        foundCity = true;
        break;
      }
    }
    console.log(!foundCity);
    if (!foundCity) {
      recentCities.push(newCity);
      showRecentCities(newCity);
      localStorage.setItem("recentCities", JSON.stringify(recentCities));
    }
    searchBox.value = "";
  }
}

// Calling function when getting out of search box or pressing "Enter"
searchBox.addEventListener("blur", getCityWeather);
document.addEventListener("keydown", function (e) {
  if (e.code === "Enter" && searchBox.value !== "") {
    getCityWeather();
  }
});

function displayWeather(forecastData) {
  const weekWeather = forecastData.forecast.forecastday;
  cityLocation.innerHTML = `<span class="city-name">${forecastData.location.name}</span>, ${forecastData.location.country}`;
  cardsContainer.innerHTML = "";
  const timeNow = new Date();
  for (let [index, day] of weekWeather.entries()) {
    let dateOfday = new Date(day.date);
    let card = `
      <div class="${
        index == 0 ? "card active" : "card"
      }" data-index="${index}" >
      <div class="card-header">
        <div class="day">${nameOfDays[dateOfday.getDay()]}</div>
        <div class="time">${timeNow.getHours()}:${timeNow.getMinutes()} ${
      timeNow.getHours() > 11 && timeNow.getMinutes() > 0 ? "PM" : "AM"
    }</div>
      </div>
      <div class="card-body">
        <img src="./images/conditions/${
          day.hour[timeNow.getHours()].condition.text
        }.svg" alt="" />
        <div class="degree">${Math.trunc(
          day.hour[timeNow.getHours()].temp_c
        )}°</div>
      </div>
      <div class="card-data">
        <ul class="left-column">
          <li>Real Feel: <span class="real-feel">${
            day.hour[timeNow.getHours()].feelslike_c
          }</span></li>
          <li>Wind: <span class="wind">${
            day.hour[timeNow.getHours()].wind_dir
          }, ${day.hour[timeNow.getHours()].wind_kph} Km/h</span></li>
          <li>Pressure: <span class="pressure">${
            day.hour[timeNow.getHours()].pressure_mb
          }Mb</span></li>
          <li>Humidity: <span class="humidity">${
            day.hour[timeNow.getHours()].humidity
          }%</span></li>
        </ul>
        <ul class="right-column">
          <li>Sunrise: <span class="sunrise">${day.astro.sunrise}</span></li>
          <li>Sunset: <span class="sunset">${day.astro.sunset}</span></li>
        </ul>
      </div>
    </div>
    `;
    cardsContainer.innerHTML += card;
  }

  const cards = document.querySelectorAll(".card");

  // Chance Of Rain Chart
  function rain(dayCard) {
    for (let i = 0; i < percentBar.length; i++) {
      let activeCardIndex = dayCard.dataset.index;
      let height =
        weekWeather[activeCardIndex].hour[
          percentBar[i].parentElement.parentElement.dataset.clock
        ].chance_of_rain;
      percentBar[i].style.height = `${height}%`;
    }
  }

  rain(document.querySelector(".card.active"));
  for (let card of cards) {
    card.addEventListener("click", function () {
      for (let card of cards) {
        card.classList.remove("active");
      }
      card.classList.add("active");
      rain(card);
    });
  }
}

async function getCityImage(city) {
  const cityImageResponse = await fetch(
    `https://api.unsplash.com/search/photos?page=1&query=${city}&client_id=maVgNo3IKVd7Pw7-_q4fywxtQCACntlNXKBBsFdrBzI&per_page=5&orientation=landscape`
  );
  const cityImage = await cityImageResponse.json();
  const cityImageURL =
    cityImage.results[Math.trunc(Math.random() * 5)].urls.small;
  return cityImageURL;
}

function AddCity(city, country, imgSrc) {
  this.city = city;
  this.country = country;
  this.image = imgSrc;
}

function showRecentCities(item) {
  let itemContent = `
      <div class="item">
        <div class="city-image">
          <img src="${item.image}" alt="Image for ${item.city} city" />
        </div>
        <div class="city-name"><span class="city-name">${item.city}</span>, ${item.country}</div>
      </div>
    `;
  recentCitiesContainer.innerHTML += itemContent;
}

function clearCities() {
  recentCities = [];
  localStorage.setItem("recentCities", JSON.stringify(recentCities));
  recentCitiesContainer.innerHTML = "";
}

clearCitiesBtn.addEventListener("click", clearCities);

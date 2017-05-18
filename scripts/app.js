// Copyright 2016 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.



(function() {
  'use strict';

  var app = {
    isLoading: true,
    visibleCards: {},
    selectedCities: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('#main'),
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  document.getElementById('butRefresh').addEventListener('click', function() {
    // Refresh all of the forecasts
    app.updateForecasts();
  });

  document.getElementById('butAdd').addEventListener('click', function() {
    // Open/show the add new city dialog
    app.toggleAddDialog(true);
  });

  document.getElementById('butAddCity').addEventListener('click', function() {
    // Add the newly selected city
    var select = document.getElementById('selectCityToAdd');
    var selected = select.options[select.selectedIndex];
    var key = selected.value;
    var label = selected.textContent;
    if (!app.selectedCities) {
      app.selectedCities = [];
    }
    app.getForecast(key, label);
    app.selectedCities.push({key: key, label: label});
    app.saveSelectedCities();
    app.toggleAddDialog(false);
  });

  document.getElementById('butAddCancel').addEventListener('click', function() {
    // Close the add new city dialog
    app.toggleAddDialog(false);
  });


  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Toggles the visibility of the add new city dialog.
  app.toggleAddDialog = function(visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  // Updates a weather card with the latest weather forecast. If the card
  // doesn't already exist, it's cloned from the template.
  app.updateForecastCard = function(data) {
    var dataLastUpdated = new Date(data.created);
    var sunrise = data.channel.astronomy.sunrise;
    var sunset = data.channel.astronomy.sunset;
    var current = data.channel.item.condition;
    var humidity = data.channel.atmosphere.humidity;
    var wind = data.channel.wind;

    var card = app.visibleCards[data.key];
    if (!card) {
      card = app.cardTemplate.cloneNode(true);
      card.classList.remove('cardTemplate');
      card.querySelector('.location').textContent = data.label;
      card.removeAttribute('hidden');
      app.container.appendChild(card);
      app.visibleCards[data.key] = card;
    }

    // Verifies the data provide is newer than what's already visible
    // on the card, if it's not bail, if it is, continue and update the
    // time saved in the card
    var cardLastUpdatedElem = card.querySelector('.card-last-updated');
    var cardLastUpdated = cardLastUpdatedElem.textContent;
    if (cardLastUpdated) {
      cardLastUpdated = new Date(cardLastUpdated);
      // Bail if the card has more recent data then the data
      if (dataLastUpdated.getTime() < cardLastUpdated.getTime()) {
        return;
      }
    }
    cardLastUpdatedElem.textContent = data.created;

    card.querySelector('.description').textContent = current.text;
    card.querySelector('.date').textContent = current.date;
    card.querySelector('.current .icon').classList.add(app.getIconClass(current.code));
    card.querySelector('.current .temperature .value').textContent =
      Math.round(current.temp);
    card.querySelector('.current .sunrise').textContent = sunrise;
    card.querySelector('.current .sunset').textContent = sunset;
    card.querySelector('.current .humidity').textContent =
      Math.round(humidity) + '%';
    card.querySelector('.current .wind .value').textContent =
      Math.round(wind.speed);
    card.querySelector('.current .wind .direction').textContent = wind.direction;
    var nextDays = card.querySelectorAll('.future .oneday');
    var today = new Date();
    today = today.getDay();
    for (var i = 0; i < 7; i++) {
      var nextDay = nextDays[i];
      var daily = data.channel.item.forecast[i];
      if (daily && nextDay) {
        nextDay.querySelector('.date').textContent =
          app.daysOfWeek[(i + today) % 7];
        nextDay.querySelector('.icon').classList.add(app.getIconClass(daily.code));
        nextDay.querySelector('.temp-high .value').textContent =
          Math.round(daily.high);
        nextDay.querySelector('.temp-low .value').textContent =
          Math.round(daily.low);
      }
    }
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };


  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/

  /*
   * Gets a forecast for a specific city and updates the card with the data.
   * getForecast() first checks if the weather data is in the cache. If so,
   * then it gets that data and populates the card with the cached data.
   * Then, getForecast() goes to the network for fresh data. If the network
   * request goes through, then the card gets updated a second time with the
   * freshest data.
   */
  app.getForecast = function(key, label) {
    var statement = 'select * from weather.forecast where woeid=' + key;
    var url = 'https://query.yahooapis.com/v1/public/yql?format=json&q=' +
        statement;
    // TODO add cache logic here
    if ('caches' in window) {
      /*
       * Check if the service worker has already cached this city's weather
       * data. If the service worker has the data, then display the cached
       * data while the app fetches the latest data.
       */
      caches.match(url).then(function(response) {
        if (response) {
          response.json().then(function updateFromCache(json) {
            var results = json.query.results;
            results.key = key;
            results.label = label;
            results.created = json.query.created;
            app.updateForecastCard(results);
          });
        }
      });
    }
    // Fetch the latest data.
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          var results = response.query.results;
          results.key = key;
          results.label = label;
          results.created = response.query.created;
          app.updateForecastCard(results);
        }
      } else {
        // Return the initial weather forecast since no data is available.
        app.updateForecastCard(initialWeatherForecast);
      }
    };
    request.open('GET', url);
    request.send();
  };

  // Iterate all of the cards and attempt to get the latest forecast data
  app.updateForecasts = function() {
    var keys = Object.keys(app.visibleCards);
    keys.forEach(function(key) {
      app.getForecast(key);
    });
  };

  // TODO add saveSelectedCities function here
  // Save list of cities to localStorage.
  app.saveSelectedCities = function() {
    var selectedCities = JSON.stringify(app.selectedCities);
    localStorage.selectedCities = selectedCities;
  };

  /*
   * Fake weather data that is presented when the user first uses the app,
   * or when the user has not saved any cities. See startup code for more
   * discussion.
   */
  var initialWeatherForecast = {
    key: '2459115',
    label: 'New York, NY',
    created: '2016-07-22T01:00:00Z',
    channel: {
      astronomy: {
        sunrise: "5:43 am",
        sunset: "8:21 pm"
      },
      item: {
        condition: {
          text: "Windy",
          date: "Thu, 21 Jul 2016 09:00 PM EDT",
          temp: 56,
          code: 24
        },
        forecast: [
          {code: 44, high: 86, low: 70},
          {code: 44, high: 94, low: 73},
          {code: 4, high: 95, low: 78},
          {code: 24, high: 75, low: 89},
          {code: 24, high: 89, low: 77},
          {code: 44, high: 92, low: 79},
          {code: 44, high: 89, low: 77}
        ]
      },
      atmosphere: {
        humidity: 56
      },
      wind: {
        speed: 25,
        direction: 195
      }
    }
  };
  // TODO uncomment line below to test app with fake data
  // app.updateForecastCard(initialWeatherForecast);

  /************************************************************************
   *
   * Code required to start the app
   *
   * NOTE: To simplify this codelab, we've used localStorage.
   *   localStorage is a synchronous API and has serious performance
   *   implications. It should not be used in production applications!
   *   Instead, check out IDB (https://www.npmjs.com/package/idb) or
   *   SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
   ************************************************************************/

  // TODO add startup code here
  app.selectedCities = localStorage.selectedCities;
  if (app.selectedCities) {
    app.selectedCities = JSON.parse(app.selectedCities);
    app.selectedCities.forEach(function(city) {
      app.getForecast(city.key, city.label);
    });
  } else {
    /* The user is using the app for the first time, or the user has not
     * saved any cities, so show the user some fake data. A real app in this
     * scenario could guess the user's location via IP lookup and then inject
     * that data into the page.
     */
    app.updateForecastCard(initialWeatherForecast);
    app.selectedCities = [
      {key: initialWeatherForecast.key, label: initialWeatherForecast.label}
    ];
    app.saveSelectedCities();
  }

  // TODO add service worker code here
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
})();

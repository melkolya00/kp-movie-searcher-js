import { API_KEY } from "./config.js";
import { getCountryCodes } from "./country_flags.js";
import { getActorsByFilm } from "./kinopoisk_actors.js";
import * as elements from "./elements.js";
let movieCountriesArr = [];
let currentMovieName = "";
const headers = {
  "X-API-KEY": API_KEY,
};
function setRatingColor(rating, element) {
  element.style.color =
    rating < 5.0 ? "red" : rating < 7.0 ? "yellow" : "green";
}
async function getMoviesByName(name, page = 1, limit = 1) {
  try {
    const response = await fetch(
      "https://api.kinopoisk.dev/v1.2/movie/search?" +
        new URLSearchParams({
          query: name,
          limit: limit,
          page: page,
        }),
      {
        headers: headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const movies = await response.json();
    return movies.docs;
  } catch (error) {
    console.error(error);
  }
}
document.addEventListener("keyup", showResults);

function showResults(event) {
  if (event.code.toLowerCase() === "enter") {
    elements.movieCountries.innerHTML = "";
    const filmName = document.querySelector("#title").value.trim();
    if (!filmName) {
      // проверяем пустая ли строка
      showMessage("Введите название фильма.");
      return;
    }
    getMoviesByName(filmName).then(async (movies) => {
      if (movies.length === 0) {
        showMessage("Такого фильма нет на Кинопоиске.");
      } else {
        movies.forEach(async (movie) => {
          updateUI(movie);
          movieCountriesArr = movie.countries;
          const countryCodesForThisMovie = await getCountryCodes();
          updateFlags(countryCodesForThisMovie);
        });
      }
    });
  }
}

// function innerWithTimeout(block, data) {
//   block.style.opacity = 0;
//   block.innerText = data;
//   setTimeout(() => {
//     block.style.opacity = 1;
//   }, 500);
// }

function updateUI(movie) {
  elements.backgroundElem.style.backgroundImage = `url(${movie.backdrop})`;
  setTimeout(() => {
    elements.backgroundElem.classList.add("loaded");
  }, 2000);
  elements.backgroundElem.style.filter = "blur(20px)";
  elements.movieTitle.innerText = `${movie.name} (${movie.year})`;
  currentMovieName = movie.name;
  getActorsByFilm(currentMovieName).then((actors) => {
    actors.forEach((actor) => {
      console.log(actor.enName);
      // actor.name?.console.log(actor.name);
      // console.log(actor.age);
      // console.log();
    });
  });
  // innerWithTimeout(elements.movieTitle, `${movie.name} (${movie.year})`);
  elements.movieRating.innerText = movie.rating;
  // innerWithTimeout(elements.movieRating, movie.rating);
  elements.movieGenres.innerText = movie.genres.join(", ");
  // innerWithTimeout(elements.movieGenres, movie.genres.join(", "));
  elements.movieLength.innerText = `${movie.movieLength} мин. / ${Math.floor(
    movie.movieLength / 60
  )} ч. ${movie.movieLength % 60} мин.`;
  elements.moviePoster.style.opacity = 0;
  elements.moviePoster.src = movie.poster;
  elements.moviePoster.onload = () => {
    setTimeout(() => {
      elements.moviePoster.style.opacity = 1;
    }, 500);
  };
  elements.movieDesc.innerText = movie.description;
  setTimeout(() => {
    elements.descBlock.style.opacity = 1;
    elements.movieDesc.style.opacity = 1;
  }, 500);
  if (!movie.poster) {
    showMessage("У данного фильма нет постера.");
  }
  if (!movie.description) {
    showMessage("У данного фильма нет описания.");
  }

  setRatingColor(movie.rating, elements.movieRating);
}

function updateFlags(codes) {
  const flagImages = codes.map((code) => {
    return code === "SU"
      ? `<img src="./images/ussr.png" alt="${code} flag" title="${code}" />`
      : `<img src="https://flagsapi.com/${code.toUpperCase()}/shiny/32.png" alt="${code} flag" title="${code}" />`;
  });
  elements.movieCountries.innerHTML = flagImages.join(" ");
}

function showMessage(msg) {
  elements.hintElem.innerHTML = msg;
  elements.hintElem.style.opacity = 1;
  setTimeout(() => {
    elements.hintElem.style.opacity = 0;
  }, 2000);
}

export function getMovieCountries() {
  return movieCountriesArr;
}
export { currentMovieName };

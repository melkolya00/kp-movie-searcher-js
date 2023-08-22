import { API_KEY } from "./config.js";
import { getCountryCodes } from "./country_flags.js";
import { getActorsByFilm } from "./kinopoisk_actors.js";
import * as elements from "./elements.js";
let movieCountriesArr = [];
let currentMovieName = "";
const selectFields = [
  "id",
  "name",
  "ageRating",
  "backdrop.previewUrl",
  "poster.url",
  "genres.name",
  "movieLength",
  "persons.id",
  "persons.name",
  "persons.enName",
  "persons.photo",
  "persons.description",
  "persons.enProfession",
  "year",
  "countries.name",
  "rating.kp",
  "description",
  "isSeries",
];
const headers = {
  "X-API-KEY": API_KEY,
};
function setColor(value, element, first, second, color1, color2, color3) {
  element.style.color =
    value < first ? color1 : value < second ? color2 : color3;
}
async function getMoviesByName(name, selectFields, page = 1, limit = 5) {
  try {
    const response = await fetch(
      "https://api.kinopoisk.dev/v1.3/movie?" +
        new URLSearchParams({
          name: name,
          limit: limit,
          page: page,
          selectFields: selectFields.join(" "),
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
    resetUI();
    const filmName = document.querySelector("#title").value.trim();
    if (!filmName) {
      resetUI();
      showMessage("Введите название фильма.");
      return;
    }
    getMoviesByName(filmName, selectFields).then(async (movies) => {
      const exactMatch =
        movies.find((movie) => movie.name.toLowerCase().startsWith(filmName)) ??
        movies[0];
      if (!exactMatch) {
        resetUI();
        showMessage("Такого фильма нет на Кинопоиске.");
      } else {
        updateUI(exactMatch);
        movieCountriesArr = exactMatch.countries.map((country) => country.name);
        const countryCodesForThisMovie = await getCountryCodes();
        updateFlags(countryCodesForThisMovie);
      }
    });
  }
}

function updateUI(movie) {
  elements.backgroundElem.style.backgroundImage = `url(${movie.backdrop.previewUrl})`;
  setTimeout(() => {
    elements.backgroundElem.classList.add("loaded");
  }, 2000);
  elements.backgroundElem.style.filter = "blur(20px)";
  elements.movieTitle.innerText = `${movie.name} (${movie.year})`;
  // currentMovieName = movie.name;
  // getActorsByFilm(currentMovieName).then((actors) => {
  //   actors.forEach((actor) => {
  //     console.log(actor.enName);
  //   });
  // });
  elements.movieRating.innerText = movie.rating.kp;
  if (movie.ageRating !== null) {
    elements.movieAge.innerText = `${movie.ageRating}+`;
    elements.movieAge.style.border = "1px solid";
    setColor(
      movie.ageRating,
      elements.movieAge,
      12,
      16,
      "#94bc70",
      "#d2aa6c",
      "#d28c80"
    );
  }
  if (movie.persons.photo !== null) {
    elements.actorsBlock.innerHTML = movie.persons
      .slice(0, 5)
      .map(
        (person) => `
        <div class="actor">
          <img class="actor__photo" src="${person.photo}" alt="${
          person.name
        }" width="115" height="182" style="object-fit: cover;"/>
          <div class="actor__info"><span class="actor__name">${
            person.name ?? person.enName
          }</span><span class="actor__description">${
          person.description ?? ""
        }</span></div>
        </div>`
      )
      .join("");
  }
  elements.movieGenres.innerText = movie.genres
    .map((genre) => genre.name)
    .join(", ");
  movie.isSeries
    ? "сериал"
    : (elements.movieLength.innerText = `${
        movie.movieLength
      } мин. / ${Math.floor(movie.movieLength / 60)} ч. ${
        movie.movieLength % 60
      } мин.`);
  elements.moviePoster.style.opacity = 0;
  movie.poster.url
    ? (elements.moviePoster.src = movie.poster.url)
    : showMessage("У данного фильма нет постера.");
  elements.moviePoster.onload = () => {
    setTimeout(() => {
      elements.moviePoster.style.opacity = 1;
    }, 500);
  };
  elements.movieDesc.innerText = movie.description;
  elements.descBlock.classList.add("fade-in");
  setTimeout(() => {
    elements.descBlock.style.opacity = 1;
    elements.movieDesc.style.opacity = 1;
  }, 500);
  if (!movie.description) {
    showMessage("У данного фильма нет описания.");
  }

  setColor(
    movie.rating.kp,
    elements.movieRating,
    5.0,
    7.0,
    "red",
    "yellow",
    "var(--gradient-end)"
  );
}

function resetUI() {
  elements.backgroundElem.style.backgroundImage = "";
  elements.backgroundElem.classList.remove("loaded");
  elements.backgroundElem.style.filter = "";
  elements.movieTitle.innerText = "";
  elements.movieRating.innerText = "";
  elements.movieAge.innerText = "";
  elements.movieAge.style.border = "none";
  elements.movieGenres.innerText = "";
  elements.movieLength.innerText = "";
  elements.moviePoster.src = "";
  elements.moviePoster.style.opacity = 0;
  elements.movieDesc.innerText = "";
  elements.descBlock.classList.remove("fade-in");
  elements.actorsBlock.innerHTML = "";
  elements.descBlock.style.opacity = 0;
  elements.movieDesc.style.opacity = 0;
  elements.movieCountries.innerHTML = "";
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

// window.addEventListener("scroll", function () {
//   let header = document.querySelector(".main-header");
//   header.classList.toggle("sticky", window.scrollY > 0);
// });

export function getMovieCountries() {
  return movieCountriesArr;
}
export { currentMovieName };

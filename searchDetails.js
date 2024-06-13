import { API_KEY } from "./config.js";
import { getCountryCodes } from "./country_flags.js";
import { getMoviesByName } from "./searchMoviesByName.js";
import { fetchSimilarMovies } from "./searchSimilarMovies.js";
import * as elements from "./elements.js";

let movieCountriesArr = [];
let currentMovieName = "";
let similarIds = [];
const selectFields = [
  "name",
  "ageRating",
  "backdrop",
  "poster",
  "genres",
  "movieLength",
  "persons",
  "year",
  "countries",
  "rating",
  "similarMovies",
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

async function getMoviesDetails(id, selectFields) {
  try {
    const params = new URLSearchParams();
    params.append("id", id);
    selectFields.forEach((field) => params.append("selectFields", field));

    const url = `https://api.kinopoisk.dev/v1.4/movie?${params.toString()}`;

    const response = await fetch(url, {
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const movie = await response.json();
    return movie;
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("keyup", showResults);

function showResults(event) {
  if (event.code && event.code.toLowerCase() === "enter") {
    resetUI();
    const filmName = document.querySelector("#title").value.trim();
    if (!filmName) {
      resetUI();
      showMessage("Введите название фильма.");
      return;
    }
    getMoviesByName(filmName).then(async (movies) => {
      const exactMatch =
        movies.find((movie) =>
          movie.name.toLowerCase().startsWith(filmName.toLowerCase())
        ) ?? movies[0];
      if (!exactMatch) {
        resetUI();
        showMessage("Такого фильма нет на Кинопоиске.");
      } else {
        const movieDetails = await getMoviesDetails(
          exactMatch.id,
          selectFields
        );
        // similarIds = movieDetails.similarMovies.map((similar) => similar.id);
        // console.log(similarIds);
        console.log(movieDetails);
        updateUI(movieDetails);
        movieCountriesArr = movieDetails.docs[0].countries.map(
          (country) => country.name
        );
        const countryCodesForThisMovie = await getCountryCodes(
          movieCountriesArr
        );
        updateFlags(countryCodesForThisMovie);
      }
    });
  }
}

function updateUI(movie) {
  elements.backgroundElem.style.backgroundImage = `url(${movie.docs[0].backdrop.url})`;
  setTimeout(() => {
    elements.backgroundElem.classList.add("loaded");
  }, 2000);
  elements.backgroundElem.style.filter = "blur(20px)";
  elements.movieTitle.innerText = `${movie.docs[0].name} (${movie.docs[0].year})`;
  elements.movieRating.innerText = movie.docs[0].rating.kp;
  if (movie.docs[0].ageRating !== null) {
    elements.movieAge.innerText = `${movie.docs[0].ageRating}+`;
    elements.movieAge.style.border = "1px solid";
    setColor(
      movie.docs[0].ageRating,
      elements.movieAge,
      12,
      16,
      "#94bc70",
      "#d2aa6c",
      "#d28c80"
    );
  }
  if (movie.docs[0].persons.photo !== null) {
    elements.actorsBlock.innerHTML = movie.docs[0].persons
      .slice(0, 5)
      .map(
        (person) => `
        <div class="actor">
          <img class="actor__photo" src="${person.photo}" alt="${
          person.name
        }" width="115" height="182" style = "object-fit:cover" draggable = "false"/>
          <div class="actor__info"><span class="actor__name">${
            person.name ?? person.enName
          }</span><span class="actor__description">${
          person.description ?? ""
        }</span></div>
        </div>`
      )
      .join("");
  }
  elements.movieGenres.innerText = movie.docs[0].genres
    .map((genre) => genre.name)
    .join(", ");
  movie.docs[0].isSeries
    ? (elements.movieLength.innerText = `сериал`)
    : (elements.movieLength.innerText = `${
        movie.docs[0].movieLength
      } мин. / ${Math.floor(movie.docs[0].movieLength / 60)} ч. ${
        movie.docs[0].movieLength % 60
      } мин.`);
  elements.moviePoster.style.opacity = 0;
  movie.docs[0].poster.url
    ? (elements.moviePoster.src = movie.docs[0].poster.url)
    : showMessage("У данного фильма нет постера.");
  elements.moviePoster.onload = () => {
    setTimeout(() => {
      elements.moviePoster.style.opacity = 1;
    }, 500);
  };
  elements.movieDesc.innerText = movie.docs[0].description;
  elements.descBlock.classList.add("fade-in");
  setTimeout(() => {
    elements.descBlock.style.opacity = 1;
    elements.movieDesc.style.opacity = 1;
  }, 500);
  if (!movie.docs[0].description) {
    showMessage("У данного фильма нет описания.");
  }
  if (similarIds && similarIds.length > 0) {
    elements.similarBlock.style.display = "flex";
    fetchSimilarMovies(similarIds);
  } else {
    elements.similarBlock.style.display = "none";
    showMessage("Похожие фильмы не найдены");
  }

  setColor(
    movie.docs[0].rating.kp,
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
  elements.similarBlock.innerHTML = "";
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
// export { similarIds };

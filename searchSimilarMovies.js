import { API_KEY } from "./config.js";
import * as elements from "./elements.js";
const headers = { "X-API-KEY": API_KEY };
async function getMoviesById(id) {
  try {
    const response = await fetch(`https://api.kinopoisk.dev/v1.4/movie/${id}`, {
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

export function fetchSimilarMovies(idsArray) {
  let movieCards = [];
  elements.similarBlock.insertAdjacentHTML(
    "afterbegin",
    "<span class='similar__title'>Похожие фильмы</span> <div class = 'movies__wrapper'></div>"
  );
  let moviesWrapper = document.querySelector(".movies__wrapper");
  idsArray.slice(0, 5).forEach((id) => {
    getMoviesById(id).then((movie) => {
      console.log(movie.name);
      const movieCard = `
        <div class="movie">
            <img class="movie__photo" src="${movie.poster.url}" alt="${movie.name}" width="115" height="182" style="object-fit:cover" draggable="false"/>
            <div class="movie__info">
                <span class="movie__name">${movie.name}</span>
            </div>
        </div>
      `;
      movieCards.push(movieCard);
      moviesWrapper.innerHTML = movieCards.join("");
    });
  });
}

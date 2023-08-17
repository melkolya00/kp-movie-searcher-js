import { API_KEY } from './config.js';
import { getCountryCodes } from './country_flags.js';
import * as elements from './elements.js';

let movieCountriesArr = [];
const headers = {
    "X-API-KEY": API_KEY
};

function setRatingColor(rating, element) {
    element.style.color = rating < 5.0 ? "red" :
                          rating < 7.0 ? "yellow" : "green";
}

async function getMoviesByName(name, page = 1, limit = 1) {
    try {
        const response = await fetch(`https://api.kinopoisk.dev/v1.2/movie/search?${new URLSearchParams({
            "query": name,
            "limit": limit,
            "page": page,
        })}`, { headers });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const movies = await response.json();
        return movies.docs;
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener("keyup", showResults);

function showResults(event) {
    if (event.code.toLowerCase() === "enter") {
        const filmName = document.querySelector('#title').value.trim();
        if (!filmName) {
            showMessage('Введите название фильма.');
            return;
        }
        getMoviesByName(filmName).then(async movies => {
            if (movies.length === 0) {
                showMessage('Такого фильма нет на Кинопоиске.');
            } else {
                movies.forEach(async movie => {
                    updateUI(movie);
                    movieCountriesArr = movie.countries;
                });
            }
        });
    }
}
function showMessage(msg) {
    elements.hintElem.innerHTML = msg;
    elements.hintElem.style.opacity = 1;
    setTimeout(() => {
        elements.hintElem.style.opacity = 0;
    }, 2000);
}
async function updateUI(movie) {
    elements.backgroundElem.style.backgroundImage = `url(${movie.backdrop})`;
    setTimeout(() => {
        elements.backgroundElem.classList.add('loaded');
    }, 1000);
    elements.backgroundElem.style.filter = "blur(30px)";
    elements.movieTitle.innerText = `${movie.name} (${movie.year})`;
    elements.movieRating.innerText = movie.rating;
    elements.movieGenres.innerText = movie.genres.join(", ");
    elements.movieLength.innerText = `${movie.movieLength} мин. / ${Math.floor(movie.movieLength / 60)} ч. ${movie.movieLength % 60} мин.`;

    getCountryCodes().then(codes => {
        updateFlags(codes);
    });

    elements.moviePoster.style.opacity = 0;
    elements.moviePoster.src = movie.poster;
    elements.moviePoster.onload = () => {
        setTimeout(() => {
            elements.moviePoster.style.opacity = 1;
        }, 500);
    };

    elements.movieDesc.innerText = movie.description;
    setTimeout(() => {
        elements.movieDesc.style.opacity = 1;
    }, 500);

    if (!movie.poster) {
        showMessage('У данного фильма нет постера.');
    }
    else if (!movie.description) {
      showMessage('У данного фильма нет описания.');
  }

    setRatingColor(movie.rating, elements.movieRating);
}

function updateFlags(codes) {
//   elements.movieCountries.innerHTML = movie.countries.join(' ');
    const flagImages = codes.map(code => {
        return `<img src="https://flagsapi.com/${code.toUpperCase()}/shiny/16.png" alt="${code} flag" title="${code}" />`;
    });
    elements.movieCountries.innerHTML = flagImages.join(' ');
}

export function getMovieCountries() {
    return movieCountriesArr;
}

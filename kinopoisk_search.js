import { API_KEY } from './config.js';
import * as elements from './elements.js';
const headers = {
    "X-API-KEY": API_KEY
  };
  function setRatingColor(rating, element) {
    element.style.color = rating < 5.0 ? "red" :
                          rating < 7.0 ? "yellow" : "green";
}
  async function getMoviesByName(name, page = 1, limit = 1) {
    try {
      const response = await fetch('https://api.kinopoisk.dev/v1.2/movie/search?' + new URLSearchParams({
        "query": name,
        "limit": limit,
        "page": page,
      }), {
        headers: headers
      });
  
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
  function showResults(event){
    if (event.code.toLowerCase()==="enter"){
      const filmName = document.querySelector('#title').value.trim();
        if (!filmName) { // проверяем пустая ли строка
            elements.hintElem.innerHTML = 'Введите название фильма.';
            elements.hintElem.style.opacity = 1;
            setTimeout(() => {
                elements.hintElem.style.opacity = 0;
            }, 2000);
            return;
        }
      getMoviesByName(filmName).then(movies => {
        if(movies.length === 0) {
          elements.hintElem.innerHTML = 'Такого фильма нет на Кинопоиске.'
          elements.hintElem.style.opacity = 1;
          setTimeout(() => {
            elements.hintElem.style.opacity = 0;
        }, 2000);
      } else {
          movies.forEach(movie => {
              elements.backgroundElem.style.backgroundImage = `url(${movie.backdrop})`;
              setTimeout(() => {
                elements.backgroundElem.classList.add('loaded');
              }, 1000);
              elements.backgroundElem.style.filter = "blur(30px)";
              elements.movieTitle.innerText = `${movie.name} (${movie.year})`;
              elements.movieRating.innerText = movie.rating;
              elements.movieGenres.innerText = movie.genres.join(", ");
              elements.movieLength.innerText = `${movie.movieLength} мин. / ${Math.floor(movie.movieLength/60)} ч. ${movie.movieLength%60} мин.`;
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
              if (!movie.poster || !movie.description){
              elements.hintElem.innerHTML = 'Нет постера/описания.'
              elements.hintElem.style.opacity = 1;
              setTimeout(() => {
             elements.hintElem.style.opacity = 0;
            }, 2000);}
            setRatingColor (movie.rating, elements.movieRating);
          });
      }
    }
      )}}

      
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
  document.addEventListener("keyup", handleKey);
  function handleKey(event){
    if (event.code.toLowerCase()==="enter"){
      const filmName = document.querySelector('#title').value;
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
              elements.backgroundElem.style.filter = "blur(30px)";
              elements.movieTitle.innerText = `${movie.name} (${movie.year})`;
              elements.movieRating.innerText = movie.rating;
              setRatingColor (movie.rating, elements.movieRating);
              elements.movieGenres.innerText = movie.genres.join(", ");
              elements.moviePoster.src = movie.poster;
              elements.movieDesc.innerText = movie.description;
              if (!movie.poster || !movie.description){
              elements.hintElem.innerHTML = 'Нет постера/описания.'
              elements.hintElem.style.opacity = 1;
              setTimeout(() => {
             elements.hintElem.style.opacity = 0;
            }, 2000);}
          });
      }
    }
      )}}

      
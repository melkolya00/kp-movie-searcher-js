const headers = {
    "X-API-KEY": "1KRVB5P-164419V-P3Q2QH0-4YTTAMW"
  };
  const hintElem = document.querySelector('#hint');
  
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
          hintElem.innerHTML = 'Такого фильма нет на Кинопоиске.'
          hintElem.style.opacity = 1;
          setTimeout(() => {
            hintElem.style.opacity = 0;
        }, 2000);
      } else {
          movies.forEach(movie => {
              console.log("Title:", movie.name);
              console.log("Rating:", movie.rating);
              console.log("Poster:", movie.poster);
              console.log("-----------------------");
              document.getElementById("movieTitle").innerText = `${movie.name} (${movie.year})`;
              document.getElementById("movieGenres").innerText = movie.genres.join(", ");
              document.getElementById("moviePoster").src = movie.poster;
              document.getElementById("movieDesc").innerText = movie.description;
              if (!movie.poster || !movie.description){
              hintElem.innerHTML = 'Нет постера/описания.'
              hintElem.style.opacity = 1;
              setTimeout(() => {
             hintElem.style.opacity = 0;
            }, 2000);}
          });
      }
      
    }
      )}}
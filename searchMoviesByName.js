import { API_KEY } from "./config.js";

const headers = {
  "X-API-KEY": API_KEY,
};

export async function getMoviesByName(name, page = 1, limit = 5) {
  try {
    const response = await fetch(
      "https://api.kinopoisk.dev/v1.4/movie/search?" +
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

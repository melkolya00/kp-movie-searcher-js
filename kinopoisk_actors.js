const headers = { "X-API-KEY": "1KRVB5P-164419V-P3Q2QH0-4YTTAMW" };
// import { currentMovieName } from "./kinopoisk_search.js";
export async function getActorsByFilm(name, sex, fields, limit = 10, page = 1) {
  try {
    const response = await fetch(
      "https://api.kinopoisk.dev/v1/person?" +
        new URLSearchParams({
          "movies.name": name,
          //"selectFields": fields,
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
    const actors = await response.json();
    return actors.docs.filter((actor) => actor.age !== null);
  } catch (error) {
    console.error(error);
  }
}

// const fieldsArray = ["id", "movies.name", "sex", "birthday"];
// getActorsByFilm(currentMovieName).then((actors) => {
//   actors.forEach((actor) => {
//     console.log(actor.enName);
//     console.log(actor.name);
//     console.log(actor.age);
//     console.log();
//   });
// });

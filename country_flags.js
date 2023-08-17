import { getMovieCountries } from "./kinopoisk_search.js";
let countryNameToCodeMap = {};
let countriesLoaded = false;

async function loadCountries() {
  try {
    // 1. Загрузка локального XML файла
    const response = await fetch("./codes.xml");
    if (!response.ok) {
      throw new Error(`Ошибка при загрузке XML: ${response.statusText}`);
    }
    const xmlText = await response.text();

    // 2. Преобразование текста в объект Document
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    // 3. Анализ объекта Document и наполнение словаря
    const countries = xmlDoc.querySelectorAll("country");
    countries.forEach((country) => {
      const name = country.querySelector("name").textContent;
      const alpha2 = country.querySelector("alpha2").textContent;
      countryNameToCodeMap[name] = alpha2;
    });
  } catch (error) {
    console.error("Ошибка при загрузке или анализе XML:", error);
  }
}

export async function getCountryCodes() {
  if (!countriesLoaded) {
    await loadCountries();
    countriesLoaded = true;
  }
  const currentMovieCountries = getMovieCountries();
  return currentMovieCountries.map(
    (country) => countryNameToCodeMap[country] || "Unknown"
  );
}

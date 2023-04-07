import axios from "axios";

const OPEN_WEATHER_API_KEY = process.env.REACT_APP_OPEN_WEATHER_API_KEY;

// open weather api weather type
export type weather = "Thunderstorm" | "Drizzle" | "Rain" | "Snow" | "Atmosphere" | "Clear" | "Clouds";

export const getWeatherImg = (weather: weather) => {
  switch (weather) {
    case "Clear":
      return `sunny`;
    case "Atmosphere":
    case "Clouds":
      return `cloudy`;
    case "Drizzle":
    case "Rain":
      return `rainny`;
    case "Snow":
      return `snow`;
  }
};

export const getWeatherIdx = (weather: weather) => {
  switch (weather) {
    case "Clear":
      return 1;
    case "Atmosphere":
    case "Clouds":
      return 3;
    case "Drizzle":
    case "Rain":
      return 2;
    case "Snow":
      return 4;
  }
  return 1;
};

const getWeatherKor = (weather: weather) => {
  switch (weather) {
    case "Atmosphere":
      return "안개";
    case "Clouds":
      return "구름";
    case "Drizzle":
      return "안개비";
    case "Rain":
      return "비";
    case "Snow":
      return "눈";
    case "Clear":
    default:
      return "맑음";
  }
};

/**
 * [GET]날씨정보 요청
 */
export const getWeather = async () => {
  // default geolocation 설정 : 대전유성구
  let lon = 127.3561363;
  let lat = 36.36405586;

  if (`geolocation` in navigator) {
    navigator.geolocation.watchPosition((position) => {
      lon = position.coords.longitude;
      lat = position.coords.latitude;
    });
  }
  const { data } = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}`,
  );
  const weather = data.weather[0].main;

  const res = {
    weather,
    text: getWeatherKor(weather),
    temperature: Math.round(data.main.temp - 273.15),
    img: `${process.env.PUBLIC_URL}/img/${getWeatherImg(weather)}.png`,
  };
  console.dir(res);
  return res;
};

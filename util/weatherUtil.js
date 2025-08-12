async function fetchWeather(position) {
  if (!position.hasOwnProperty("lat") || !position.hasOwnProperty("lon")) {
    return { valid: false, message: "lon or lat is missing" };
  }

  const { lon, lat } = position;
  const url = `https://weatherapi-com.p.rapidapi.com/current.json?q=${lat},${lon}`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": "39ea5bf926msh2cb3030103be360p1e5d89jsncc0c878e486e",
      "x-rapidapi-host": "weatherapi-com.p.rapidapi.com",
    },
  };

  let response;
  let result;
  try {
    response = await fetch(url, options);
    result = await response.text();
  } catch (error) {
    return { valid: false, message: "Could not be fetched" };
  }
  console.log(result);
  return { valid: true, result: result };
}

module.exports = {
  fetchWeather: fetchWeather,
};

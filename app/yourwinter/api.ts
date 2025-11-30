import { fetchWeatherApi } from "openmeteo";

export async function get_data(lat: number, long: number) {
	const params = {
		latitude: lat,
		longitude: long,
		hourly: ["temperature_2m", "rain"],
	};
	const url = "https://api.open-meteo.com/v1/forecast";
	const responses = await fetchWeatherApi(url, params);

	const response = responses[0];
	const utcOffsetSeconds = response.utcOffsetSeconds();

	const hourly = response.hourly()!;
	const weatherData = {
		hourly: {
			time: Array.from(
				{
					length:
						(Number(hourly.timeEnd()) - Number(hourly.time())) /
						hourly.interval(),
				},
				(_, i) =>
					new Date(
						(Number(hourly.time()) +
							i * hourly.interval() +
							utcOffsetSeconds) *
							1000
					)
			),
			temperature_2m: hourly.variables(0)!.valuesArray(),
			rain: hourly.variables(1)!.valuesArray(),
		},
	};

	return weatherData;
}

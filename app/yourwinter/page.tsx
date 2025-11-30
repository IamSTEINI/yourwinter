"use client";
import { LoaderCircle, Map, MapPin, RefreshCcw, Snowflake } from "lucide-react";
import { useEffect, useState } from "react";
import { get_data } from "./api";
import CAreaChart from "@/components/AreaChart";

function YourWinter() {
	const [longitude, setLong] = useState<number | null>(null);
	const [latitude, setLat] = useState<number | null>(null);
	const [localeData, setLocaleData] = useState<Record<
		string,
		unknown
	> | null>(null);
	const [geoError, setGeoError] = useState<string | null>(null);
	const [chartData, setChartData] = useState<
		{ name: string; value: number }[]
	>([]);
	const [chartLoading, setChartLoading] = useState(false);
	const [rainChartData, setRainChartData] = useState<
		{ name: string; value: number }[]
	>([]);
	const [snowDates, setSnowDates] = useState<string[]>([]);

	// LAT, LONG
	const cityPresets = [
		{ name: "TOKYO", lat: 35.6895, lon: 139.6917 },
		{ name: "BERLIN", lat: 52.5244, lon: 13.4105 },
		{ name: "NEW YORK", lat: 40.7143, lon: -74.006 },
		{ name: "LONDON", lat: 51.5085, lon: -0.1257 },
		{ name: "MOSCOW", lat: 55.7522, lon: 37.6156 },
	];

	useEffect(() => {
		if (!("geolocation" in navigator)) {
			setGeoError("Geolocation is not supported!");
			return;
		}

		const getPos = () => {
			setGeoError(null);
			navigator.geolocation.getCurrentPosition(
				({ coords }) => {
					const { latitude, longitude } = coords;
					setLong(longitude);
					setLat(latitude);
				},
				(err) => {
					setGeoError(
						err.message || "Unable to read your location!!"
					);
				},
				{ enableHighAccuracy: false, timeout: 10000 }
			);
		};

		getPos();
	}, []);

	useEffect(() => {
		if (latitude == null || longitude == null) return;

		const controller = new AbortController();

		(async () => {
			try {
				const res = await fetch(
					`https://api.bigdatacloud.net/data/reverse-geocode-client?longitude=${encodeURIComponent(
						longitude
					)}&latitude=${encodeURIComponent(
						latitude
					)}&localityLanguage=en`,
					{ signal: controller.signal }
				);
				if (!res.ok) throw new Error(`Fetch error: ${res.status}!`);
				const data = await res.json();
				setLocaleData(data);
			} catch (err) {
				if (err instanceof DOMException && err.name === "AbortError") {
				} else {
					console.error(err);
					setGeoError("Failed to fetch locale data");
				}
			}
		})();

		return () => controller.abort();
	}, [latitude, longitude]);

	useEffect(() => {
		if (latitude == null || longitude == null) return;

		(async () => {
			try {
				setChartLoading(true);
				const data = await get_data(latitude, longitude);
				const hourly =
					((data && (data.hourly as unknown)) as {
						time?: ArrayLike<unknown>;
						temperature_2m?: ArrayLike<unknown>;
						rain?: ArrayLike<unknown>;
					}) || {};
				const times: ArrayLike<unknown> = hourly.time || [];
				const temps: ArrayLike<unknown> = hourly.temperature_2m || [];
				const rains: ArrayLike<unknown> =
					(hourly as { rain?: ArrayLike<unknown> }).rain || [];
				const maxP = 72;
				const tempPoints = [] as { name: string; value: number }[];
				const rainPoints = [] as { name: string; value: number }[];
				const snowDaySet = new Set<string>();
				for (
					let i = 0;
					i <
					Math.min(times.length, temps.length, rains.length, maxP);
					i++
				) {
					const t = times[i];
					const temp = Number(Number(temps[i]).toFixed(2));
					const rain = Number(Number(rains[i]).toFixed(2));
					let label = "";
					try {
						label =
							t instanceof Date
								? t.toLocaleString()
								: new Date(String(t)).toLocaleString();
					} catch {
						label = String(t);
					}
					tempPoints.push({
						name: label,
						value: Number.isFinite(temp) ? temp : 0,
					});
					rainPoints.push({
						name: label,
						value: Number.isFinite(rain) ? rain : 0,
					});
					// checking if temp is lower than 1 degree so snow is possible and rain is bigger than 0
					if (
						Number.isFinite(temp) &&
						temp < 1 &&
						Number.isFinite(rain) &&
						rain > 0
					) {
						try {
							const day =
								t instanceof Date
									? t.toISOString().slice(0, 10)
									: new Date(String(t))
											.toISOString()
											.slice(0, 10);
							snowDaySet.add(day);
						} catch {}
					}
				}
				setChartData(tempPoints);
				setRainChartData(rainPoints);
				setSnowDates(Array.from(snowDaySet).sort());
				setChartLoading(false);
			} catch (err) {
				console.error(err);
				setGeoError("Failed to fetch locale weather data");
				setChartLoading(false);
			}
		})();
	}, [latitude, longitude]);

	const city =
		(localeData?.["city"] as string) ??
		(localeData?.["locality"] as string) ??
		undefined;
	const locality = localeData?.["locality"] as string;
	const principalSubdivision = localeData?.["principalSubdivision"] as string;
	const countryName = localeData?.["countryName"] as string;

	return (
		<div className="flex flex-col items-center mt-10 px-4">
			<h1
				onClick={() => {
					window.location.href = "/";
				}}
				className="text-5xl mb-10 group cursor-pointer select-none">
				YOUR{" "}
				<p className="mask ml-10 group-hover:-ml-5 transition-all">
					WINTER
				</p>
			</h1>

			<div className="marquee w-full max-w-xl h-20 border border-[#343445] hover:border-[#565667] transition-all rounded-md mb-5">
				<div className="flex flex-row font-semibold italic">
					<span>TOKYO</span>
					<span>BERLIN</span>
					<span>NEW YORK</span>
					<span>LONDON</span>
					<span>MOSCOW</span>
				</div>
			</div>

			<div className="max-w-xl w-full flex flex-col justify-center items-start border p-6 rounded-md border-[#343445] hover:border-[#565667] transition-all select-none">
				<div className="flex items-center gap-3 w-full">
					<Map />
					<div className="flex-1">
						<div className="opacity-50 italic">Your location</div>
						<div className="mt-1 text-sm text-muted-foreground">
							{geoError ? (
								<span className="text-red-400">{geoError}</span>
							) : latitude && longitude ? (
								<span>
									{latitude.toFixed(4)},{" "}
									{longitude.toFixed(4)}
								</span>
							) : (
								<span>Detecting…</span>
							)}
						</div>
					</div>
					<div>
						<button
							className="h-10 group"
							onClick={() => {
								setGeoError(null);
								if ("geolocation" in navigator) {
									navigator.geolocation.getCurrentPosition(
										({ coords }) => {
											setLat(coords.latitude);
											setLong(coords.longitude);
										},
										(err) =>
											setGeoError(
												err.message ||
													"Unable to read your location."
											),
										{ timeout: 10000 }
									);
								} else {
									setGeoError("Geolocation not available.");
								}
							}}>
							<RefreshCcw
								className="group-hover:animate-spin"
								size={15}
							/>
						</button>
					</div>
				</div>

				<div className="w-full mt-4">
					{localeData ? (
						<div className="text-sm">
							<div className="mt-1">
								{city || locality || principalSubdivision ? (
									<span>
										{city ?? locality}
										{principalSubdivision
											? `, ${principalSubdivision}`
											: ""}
									</span>
								) : (
									<span className="opacity-60">
										No named locality
									</span>
								)}
							</div>
							<div className="mt-2 text-xs opacity-70 flex flex-row items-center space-x-2">
								<MapPin size={16} />
								{countryName ? (
									<span className="italic text-[13px]">
										{countryName}
									</span>
								) : null}
							</div>
						</div>
					) : (
						<div className="text-sm opacity-60">
							No locale data yet. Try refreshing
						</div>
					)}
				</div>
			</div>
			<div className="max-w-xl w-full h-64 mt-6">
				{chartLoading ? (
					<div className="w-full h-full flex items-center justify-center text-sm opacity-70">
						Loading chart…
					</div>
				) : chartData && chartData.length ? (
					<div className="w-full h-full rounded-md border border-[#343445] hover:border-[#565667] transition-all overflow-hidden">
						<div className="w-full flex flex-row justify-between items-center px-5 pt-2">
							<p className="italic text-2xl font-bold">
								TEMPERATURE
							</p>
							<span className="opacity-50">
								See what temperatures are ahead
							</span>
						</div>
						<div className="w-full h-full translate-y-5">
							<CAreaChart
								data={chartData}
								valueName={"°C"}
								colorTheme={{
									areaFill: "rgb(214, 10, 255)",
									areaStroke: "rgb(204, 0, 255)",
								}}
								showYAxis={true}
								showXAxis={false}
								endStopOpacity={0.3}
								startStopOpacity={1}
							/>
						</div>
					</div>
				) : (
					<div className="w-full h-full flex items-center justify-center text-sm opacity-60">
						<LoaderCircle className="mr-5 animate-spin" size={15} />
						No temperature data
					</div>
				)}
			</div>
			<div className="max-w-xl w-full h-56 mt-6">
				{chartLoading ? (
					<div className="w-full h-full flex items-center justify-center text-sm opacity-70">
						<LoaderCircle className="mr-5 animate-spin" size={15} />
						Loading precipitation…
					</div>
				) : rainChartData && rainChartData.length ? (
					<div className="w-full h-full rounded-md border border-[#343445] hover:border-[#565667] transition-all overflow-hidden">
						<div className="w-full flex flex-row justify-between items-center px-5 pt-2">
							<p className="italic text-2xl font-bold">
								PRECIPITATION
							</p>
							<span className="opacity-50">
								Hourly precipitation
							</span>
						</div>
						<div className="w-full h-full translate-y-2">
							<CAreaChart
								data={rainChartData}
								valueName={"mm"}
								colorTheme={{
									areaFill: "#6ec6ff",
									areaStroke: "#2196f3",
								}}
								showYAxis={true}
							/>
						</div>
					</div>
				) : (
					<div className="w-full h-full flex items-center justify-center text-sm opacity-60">
						<LoaderCircle className="mr-5 animate-spin" size={15} />{" "}
						No precipitation data
					</div>
				)}
			</div>

			<div className="max-w-xl w-full mt-4">
				{snowDates && snowDates.length ? (
					<div className="rounded-md border border-[#343445] p-4 mt-2">
						<p className="font-semibold flex flex-row justify-start items-center">
							<Snowflake className="mr-2" />
							Expected snow
						</p>
						<p className="text-sm mt-2 opacity-80">
							Snow is expected on:{" "}
							{snowDates.map((d, i) => (
								<span key={d}>
									{new Date(d).toLocaleDateString()}
									{i < snowDates.length - 1 ? ", " : ""}
								</span>
							))}
						</p>
					</div>
				) : (
					<div className="text-sm opacity-60">
						No expected snow in your area :(
					</div>
				)}
			</div>
		</div>
	);
}

export default YourWinter;

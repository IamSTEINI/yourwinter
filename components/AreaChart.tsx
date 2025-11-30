import React, { useId } from "react";
import {
	AreaChart,
	Area,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

interface DataPoint {
	name: string;
	value: number;
	[key: string]: unknown;
}

interface ChartsProps {
	data: DataPoint[];
	areaStroke?: string;
	valueName?: string;
	showYAxis?: boolean;
	showXAxis?: boolean;
	colorTheme?:
		| string
		| {
				areaStroke?: string;
				areaFill?: string;
				tooltipIndicator?: string;
		  };
	startStopOpacity?: number;
	endStopOpacity?: number;
	gId?: string;
}

export default function CAreaChart({
	data,
	colorTheme = "#8884d8",
	valueName = "Val",
	showYAxis = false,
	showXAxis = false,
	areaStroke: propAreaStroke,
	startStopOpacity = 1,
	endStopOpacity = 0.1,
	gId,
}: ChartsProps) {
	const autoId = useId();
	const id = gId || `areaColor-${autoId}`;
	const areaFill =
		typeof colorTheme === "string"
			? colorTheme
			: colorTheme?.areaFill || "#8884d8";
	const derivedAreaStroke =
		typeof colorTheme === "string"
			? "#ffffff"
			: colorTheme?.areaStroke || "#ffffff";
	return (
		<div className="w-full h-full">
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					data={data}
					margin={{
						top: 10,
						right: 30,
						left: showYAxis ? 20 : 10,
						bottom: 0,
					}}>
					<defs>
						<linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
							<stop
								offset="5%"
								stopColor={areaFill}
								stopOpacity={startStopOpacity}
							/>
							<stop
								offset="95%"
								stopColor={areaFill}
								stopOpacity={endStopOpacity}
							/>
						</linearGradient>
					</defs>
					<CartesianGrid
						horizontal={true}
						vertical={false}
						strokeWidth={0.1}
						stroke="#e0e0e0"
					/>

					<XAxis
						tickLine={false}
						dataKey="name"
						padding={{ left: 10, right: 10 }}
						tick={{ fontSize: showXAxis ? 10 : 0 }}
						interval={0}
						axisLine={{ strokeWidth: 0 }}
					/>
					{showYAxis && (
						<YAxis
							tickLine={false}
							tick={{ fontSize: 12 }}
							axisLine={{ strokeWidth: 0 }}
							width={40}
						/>
					)}
					<Tooltip
						content={({ active, payload, label }) => {
							if (active && payload && payload.length) {
								return (
									<div className="p-3 default-text-color h-fit gap-x-2 w-fit flex flex-row border-[#343445] border rounded-md font-xl bg-[#121212]">
										<div
											className="w-1 rounded-full self-stretch"
											style={{
												backgroundColor: areaFill,
											}}></div>
										<div className="chart-tooltip-text">
											<p className="font-bold">{`${label}`}</p>
											<p className="text-xs">{`${valueName}: ${payload[0].value}`}</p>
										</div>
									</div>
								);
							}
							return null;
						}}
					/>
					<Area
						type="monotone"
						dataKey="value"
						stroke={propAreaStroke || derivedAreaStroke}
						fill={`url(#${id})`}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}

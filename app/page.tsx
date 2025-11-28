"use client";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

function Home() {
	const [offset, setOffset] = useState(0);
	const target = useRef(0);
	const current = useRef(0);

	useEffect(() => {
		const onScroll = () => {
			target.current = window.scrollY * 0.3;
		};
		window.addEventListener("scroll", onScroll, { passive: true });

		let rafId = 0;
		const a = () => {
			current.current += (target.current - current.current) * 0.1;
			setOffset(current.current);
			rafId = requestAnimationFrame(a);
		};
		a();

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener("scroll", onScroll);
		};
	}, []);

	return (
		<div className="flex flex-col justify-center items-center w-full overflow-x-hidden pb-[800px]">
			<div className="w-full h-[90vh] relative">
				<Image
					src="/assets/bg.png"
					alt="Background"
					fill
					style={{ objectFit: "cover", objectPosition: "bottom" }}
					priority
					unoptimized
					sizes="100vw"
					className="nodrag"
				/>
			</div>
			<h1
				className="md:text-[6vw] text-[10vw] fixed"
				style={{
					top: "350px",
					transform: `translate3d(0, ${offset}px, 0)`,
					willChange: "transform",
				}}>
				YOUR{" "}
				<span
					className="italic mask"
					style={{
						color: `rgba(255,255,255, ${Math.min(
							Math.max(offset / 200, 0),
							1
						)})`,
						WebkitTextFillColor: `rgba(255,255,255, ${Math.min(
							Math.max(offset / 200, 0),
							1
						)})`,
						WebkitTextStroke: `1px rgba(255,255,255, ${Math.max(
							1 - Math.min(Math.max(offset / 200, 0), 1),
							0
						)})`,
					}}>
					WINTER
				</span>
			</h1>
			<div
				style={{
					willChange: "transform",
					top: offset + 550,
					opacity: 1 - offset / 100,
				}}
				className="flex flex-col justify-center items-center opacity-50 fixed">
				<span>Scroll</span>
				<ChevronDown size={18} />
			</div>
			<h1
				className="text-5xl fixed"
				style={{
					transform: `translate3d(${Math.min(
						-2000 + offset * 10,
						0
					)}px, 0, 0)`,
					willChange: "transform",
					top: offset + (offset / 10) * 8,
				}}>
				MAKE
			</h1>
			<h1
				className="text-5xl fixed"
				style={{
					left: 0,
					width: "100vw",
					whiteSpace: "nowrap",
					textAlign: "center",
					transform: `translate3d(${Math.max(
						2000 - offset * 10,
						0
					)}px, 0, 0)`,
					top: `${
						500 +
						(offset / 10) * 8 +
						(typeof window !== "undefined"
							? window.innerWidth / 15
							: 0)
					}px`,
					fontSize: `${Math.max(16, offset / 7)}px`,
					willChange: "transform, text-shadow, color, opacity",
					opacity: Math.min(Math.max(offset / 400, 0), 1),
					color: `rgba(204,0,255,${Math.min(
						Math.max(offset / 300, 0),
						0.95
					)})`,
					WebkitTextFillColor: `rgba(204,0,255,${Math.min(
						Math.max(offset / 300, 0),
						0.95
					)})`,
					textShadow: `
						0 0 ${6 + Math.min(Math.max(offset / 300, 0), 1) * 10}px rgba(204,0,255,${
						0.9 * Math.min(Math.max(offset / 300, 0), 1)
					}),
						0 0 ${12 + Math.min(Math.max(offset / 300, 0), 1) * 60}px rgba(204,0,255,${
						0.6 * Math.min(Math.max(offset / 300, 0), 1)
					})
					`,
				}}>
				SPECIAL
			</h1>
			<button
				className="fixed"
				style={{
					transform: `translate3d(${Math.max(
						2000 - offset * 7,
						0
					)}px, 0, 0)`,
					top: `${
						600 +
						(offset / 10) * 10 +
						(typeof window !== "undefined"
							? window.innerWidth / 15
							: 0)
					}px`,
					willChange: "transform, opacity",
					opacity: Math.min(Math.max(offset / 400, 0), 1),
				}}>
				SEE YOUR WINTER
			</button>
			<h1>What is this project?</h1>
			<p className="tracking-widest min-w-[400px] max-w-[800px] w-[60%]">
				This project is an exaggerated version of how you can see when
				and where it is winter, as well as a playful way to view
				statistics.
			</p>
			<h1 className="mt-[150px]">Why this project?</h1>
			<p className="tracking-widest min-w-[400px] max-w-[800px] w-[60%]">
				Fun for me and you.
			</p>
			<h1 className="mt-[150px]">How does it work?</h1>
			<p className="tracking-widest min-w-[400px] max-w-[800px] w-[60%]">
				For this project, various data from weather APIs are evaluated
				and presented in a playful way using graphs and other tools.
			</p>
		</div>
	);
}

export default Home;

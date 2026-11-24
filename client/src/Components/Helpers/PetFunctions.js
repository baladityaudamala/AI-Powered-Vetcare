//Function to get the petdata

import axios from "axios";
import { useEffect } from "react";

const API_URL = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");

const getPetImageUrl = (imageLoc) => {
	if (!imageLoc || typeof imageLoc !== "string") {
		return "/images/paw-print-small.png";
	}

	const source = imageLoc.trim();
	if (/^https?:\/\//i.test(source)) return source;

	const imagePath = source.replace(/^(?:\.\/)+/, "/");
	const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
	const backendUrl =
		API_URL || (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "");

	if (
		(normalizedPath.startsWith("/images/") ||
			normalizedPath.startsWith("/api/images/") ||
			normalizedPath.startsWith("/posts/media/")) &&
		backendUrl
	) {
		return `${backendUrl}${normalizedPath}`;
	}

	return normalizedPath;
};

async function getPetData(petid) {
	console.log(petid);
	try {
		const { data } = await axios.get(`/api/pet/${petid}`, {
			headers: { "x-auth-token": localStorage.getItem("auth-token") },
		});
		return data;
	} catch (error) {
		console.log(error);
	}
}

const loadUserPets = async (user) => {
	let url = `/api/getpetbyuser/${user}`;
	try {
		const { data } = await axios.get(url, {
			headers: { "x-auth-token": localStorage.getItem("auth-token") },
		});
		return data;
	} catch (error) {
		console.log(error);
	}
};

const useEffectOnlyOnce = (func) => useEffect(func, [func]);

export { getPetData, getPetImageUrl, loadUserPets, useEffectOnlyOnce };

import { mkdirSync } from 'fs';

/*
 * Generate a temporary directory name - current time plus a random
 * number in case an automated tool kicks off two jobs at the
 * same second.
 */
export function getTmpDir() {
    let rnd=Math.floor(Math.random() * Math.floor(50));
	let dt=new Date();
	let mm=(dt.getMonth() + 101).toString().substring(1, 3);
	let dd=(dt.getDate() + 100).toString().substring(1, 3);
	let HH=(dt.getHours() + 100).toString().substring(1, 3);
	let MM=(dt.getMinutes() + 100).toString().substring(1, 3);
	let SS=(dt.getSeconds() + 100).toString().substring(1, 3);

	let ts=dt.getFullYear() + mm + dd + HH + MM + SS;
	let dirname='/tmp/bbsfdx_' + ts + rnd;

    mkdirSync(dirname);

	return dirname;
}


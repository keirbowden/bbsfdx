import { mkdirSync } from 'fs';
import { join } from 'path';

/*
 * Generate a temporary directory name - current time plus a random
 * number in case an automated tool kicks off two jobs at the
 * same second.
 */
export function getTmpDir() {
    const rnd = Math.floor(Math.random() * Math.floor(50));
    const dt = new Date();
    const mm = (dt.getMonth() + 101).toString().substring(1, 3);
    const dd = (dt.getDate() + 100).toString().substring(1, 3);
    const HH = (dt.getHours() + 100).toString().substring(1, 3);
    const MM = (dt.getMinutes() + 100).toString().substring(1, 3);
    const SS = (dt.getSeconds() + 100).toString().substring(1, 3);

    const ts = dt.getFullYear() + mm + dd + HH + MM + SS;
    const dirname = join('.', 'bbsfdx_' + ts + rnd);

    mkdirSync(dirname);

    return dirname;
}
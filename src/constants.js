import path from 'path';
import { remote } from 'electron';

export const APP_NAME = "Projet Dictée (défi en 24h) by Dicosaedrique";

export const __external = remote.getGlobal('__external');
export const __dirapp = remote.getGlobal('__dirapp');

export const DATA_PATH = path.join(__external, 'data');

export const FFMPEG_PATH = path.join(DATA_PATH, 'ffmpeg', 'ffmpeg.exe');

export const GOOGLE_API_KEY_PATH = path.join(__dirapp, 'google-cloud-credentials.json');

export const PONCTUATION_FR_DIR = path.join(DATA_PATH, 'dictees', 'ponctuation', 'fr');

export const PAUSE_DIR = path.join(DATA_PATH, 'dictees', 'pause');

export const DICTEES_HISTORY_DIR = path.join(DATA_PATH, 'dictees', 'history');

export const PONCTUATION_FR_FILES =
{
	'.': 'period.mp3',
	'?': 'question_mark.mp3',
	'!': 'exclamation_mark.mp3',
	',': 'comma.mp3',
	';': 'semi_colon.mp3',
	':': 'colon.mp3',
	'…': 'ellipsis_marks.mp3',
	'(': 'round_bracket_open.mp3',
	')': 'round_bracket_close.mp3',
	'«': 'quotation_mark_open.mp3',
	'»': 'quotation_mark_close.mp3',
	'.\n': 'end_of_line.mp3',
}

export const PONCTUATION_FR_LIST = (() =>
{
	var res = [];

	for(var key in PONCTUATION_FR_FILES)
	{
		res.push(key);
	}

	return res;
})();

export const MAX_REQUEST_PER_MINUTE_TTS = 300;

export const MAX_CHARACTER_PER_DICTEE_GENERATED = 5000;

export const PAUSE_MAX = 10000;
export const PAUSE_MIN = 2000;
export const PAUSE_PER_WORD = 333;

export const MAX_WORD_PER_SEGMENT = 10;

export const RELECTURE_TIME = 10 * 1000;

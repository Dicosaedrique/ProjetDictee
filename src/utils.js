import path from 'path';
import ffmpeg from 'fluent-ffmpeg';


import {
	FFMPEG_PATH,
	PAUSE_MAX,
	PAUSE_MIN,
	PAUSE_PER_WORD
} from 'src/constants';

ffmpeg.setFfmpegPath(FFMPEG_PATH);

export function testDefined(obj, level, ...rest)
{
	if (obj === undefined) return false;
	if (rest.length == 0 && obj.hasOwnProperty(level)) return true;
	return testDefined(obj[level], ...rest);
}

export function extractYoutubeVideoId(link)
{
	try
	{
		const videoUrl = new URL(link);

		if(videoUrl.protocol === 'http:' || videoUrl.protocol === 'https:')
		{
			var validLink = true, ytCode = null;

			// since most youtube url match one of these two template :
			// https://youtu.be/xxxxxxxxxxx
			// https://www.youtube.com/watch?v=xxxxxxxxxxx

			if(videoUrl.host === 'www.youtube.com')
			{
				if(videoUrl.href.includes('?v='))
				{
					ytCode = videoUrl.href.split('?v=');
					ytCode = ytCode[ytCode.length-1];
					ytCode = ytCode.substring(0, 11);
				}
				else
					validLink = false;
			}
			else if(videoUrl.host === 'youtu.be')
			{
				ytCode = videoUrl.href.split('/');
				ytCode = ytCode[ytCode.length-1];

				if(ytCode.length != 11)
					validLink = false;
			}
			else
			{
				return null;
			}

			if(validLink)
			{
				return ytCode;
			}
			else
			{
				return null;
			}
		}
		else
		{
			return null;
		}
	}
	catch (e)
	{
		return null;
	}
}

export function extractAudio(input, output) // basé sur le travail de fisch0920 : https://github.com/transitive-bullshit/ffmpeg-extract-audio
{
	const ext = path.extname(output).slice(1);

	return new Promise((resolve, reject) =>
	{
		const cmd = ffmpeg(input)
		.format(ext)
		.on('end', () => resolve && resolve())
		.on('error', (err) => reject(err));

		cmd.output(output).run();
	});
}

export function blurText(text, nonBlurLength = 10)
{
	if(text.length <= 2 * nonBlurLength) return text;

	return [
		text.substring(0, nonBlurLength), // les premier caractères sont visibles
		text.substring(nonBlurLength, text.length - 2*nonBlurLength).replace(/[^\s]/g, '*'), // ensuite ils sont masqués
		text.substring(text.length - nonBlurLength) // puis les derniers caractères sont à nouveau visibles
	].join('');
}

export function findAllOccurences(string, occur)
{
	var indexes = [];
	var index = string.indexOf(occur);

	while(index !== -1)
	{
		indexes.push(index);
		string = string.replace(occur, '');
		index = string.indexOf(occur);
	}

	return indexes;
}

export function getPauseByText(text)
{
	const time = countWordsInText(text) * PAUSE_PER_WORD;

	return ((time < PAUSE_MIN) ? PAUSE_MIN : ((time > PAUSE_MAX) ? PAUSE_MAX : time));
}

export function countWordsInText(text) // d'après le travail de Vineeth.mariserla (https://www.tutorialspoint.com/how-to-count-a-number-of-words-in-given-string-in-javascript)
{
	text = text.replace(/(^\s*)|(\s*$)/gi,"");
	text = text.replace(/[ ]{2,}/gi," ");
	text = text.replace(/\n /,"\n");

	return text.split(' ').length;
}

export function audioconcat(files, output = null, callback)
{
	if(output === null)
		throw "Vous devez renseigner un output";

	var filter = 'concat:' + files.join('|');

    return ffmpeg()
	.input(filter)
	.outputOptions('-acodec copy')
	.on('error', (err, stdout, stderr) =>
	{
		if(callback) callback(err);
	})
	.on('end', () =>
	{
		if(callback) callback();
	})
	.save(output);
}

export function preprocessText(text)
{
	// ['—', '—', '–', '–', '-'] => '-'
	// '"' => '«' '»'
	// “ ” => '«' '»'

	var preprocessedText = text;

	preprocessedText = preprocessedText.replace(/(^\s*)|(\s*$)/gi,""); // enlève les espaces au début et à la fin
	preprocessedText = preprocessedText.replace(/[ ]{2,}/gi," "); // enlève les espace multiples
	preprocessedText = preprocessedText.replace(/\n /,"\n"); // enlève les espaces en début de ligne

	preprocessedText = preprocessedText.replace(/[——––\-]/g, '-');
	preprocessedText = preprocessedText.replace(/[“]/g, '«');
	preprocessedText = preprocessedText.replace(/[”]/g, '»');

	var indexes = findAllOccurences(preprocessedText, '"');

	if(indexes.length < 2)
		return preprocessedText;
	else
	{
		while(indexes.length >= 2)
		{
			preprocessedText = preprocessedText.replace(/["]/, '«');
			preprocessedText = preprocessedText.replace(/["]/, '»');

			indexes = indexes.slice(2);
		}
	}

	return preprocessedText;
}

export function getIndiceHalfTextWords(text) // d'après le travail de John Koerner : https://stackoverflow.com/questions/18087416/split-string-in-half-by-word
{
	var index = Math.round(text.length / 2);

	while (index < text.length && text[index].match(/\s/) == null)
	    index++;

	return index
}

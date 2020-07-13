const path = require('path');
const Diff = require('text-diff');


const PONCTUATION_LIST = [".", "?", "!", ",", ";", ":", "…", "(", ")", "«", "»", ".\n"];

const PONCTUATION_FILES =
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

const PAUSE_FILES =
{
	1: 'pause_1.mp3',
	2: 'pause_2.mp3',
	3: 'pause_3.mp3',
	4: 'pause_4.mp3',
	5: 'pause_5.mp3',
}

const SILENCE = -1;

function generateFragments(text)
{
	var regex = new RegExp(`\.\n|[${PONCTUATION_LIST.filter(elem => elem !== '.\n').join('')}]`, 'g');
	var resRegexExecArray;

	var indexesArray = [];

	while ((resRegexExecArray = regex.exec(text)) !== null)
	{
		indexesArray.push([resRegexExecArray[0], resRegexExecArray.index]);
	}

	if(indexesArray.length === 0) // si y'a pas de ponctuation du tout
	{
		return [{
			ponctuation : false,
			text : text,
			filename  : Date.now() + '.mp3'
		}]
	}

	var lastIndex = 0;
	var res = [];

	for(var [regex, index] of indexesArray)
	{
		const fragmentText = text.substring(lastIndex, index);

		res.push({
			ponctuation : false,
			text : fragmentText,
			filename  : Date.now() + '.mp3'
		});

		res.push({
			ponctuation : true,
			text : regex,
			filename  : PONCTUATION_FILES[regex]
		});

		res.push({
			ponctuation : true,
			pause : true,
			filename : PAUSE_FILES[getPauseByText(fragmentText)]
		});

		lastIndex = index + regex.length;
	}

	return res;
}

function getPauseByText(text)
{
	const words = countWordsInText(text);

	if(words < 3)
		return 1;
	else if(words < 6)
		return 2;
	else if(words < 9)
		return 3;
	else if(words < 12)
		return 4;
	else
		return 5;
}

function countWordsInText(text) // d'après le travail de Vineeth.mariserla (https://www.tutorialspoint.com/how-to-count-a-number-of-words-in-given-string-in-javascript)
{
	text = text.replace(/(^\s*)|(\s*$)/gi,"");
	text = text.replace(/[ ]{2,}/gi," ");
	text = text.replace(/\n /,"\n");

	return text.split(' ').length;
}

function mergeFragment(array)
{
	var mergedArray = [];

	if(array.length === 0)
		return null;

	if(array.length < 3)
		return [array[0].filename];

	var index = 0;
	while (index < array.length - 2)
	{
		mergedArray.push(array[index].filename);
		mergedArray.push(array[index + 1].filename);

		mergedArray.push(array[index].filename);
		mergedArray.push(array[index + 1].filename);

		mergedArray.push(array[index + 2].filename);

		index += 3;
	}

	return mergedArray;
}

var test =
`Pour parler sans ambiguïté, ce dîner à Sainte-Adresse, près du Havre, malgré les effluves embaumés de la mer, malgré les vins de très bons crus, les cuisseaux de veau et les cuissots de chevreuil prodigués par l’amphitryon, fut un vrai guêpier.
Quelles que soient, et quelque exiguës qu’aient pu paraître, à côté de la somme due, les arrhes qu’étaient censés avoir données la douairière et le marguillier, il était infâme d’en vouloir pour cela à ces fusiliers jumeaux et mal bâtis, et de leur infliger une raclée, alors qu’ils ne songeaient qu’à prendre des rafraîchissements avec leurs coreligionnaires.
Quoi qu’il en soit, c’est bien à tort que la douairière, par un contresens exorbitant, s’est laissé entraîner à prendre un râteau et qu’elle s’est crue obligée de frapper l’exigeant marguillier sur son omoplate vieillie. Deux alvéoles furent brisés ; une dysenterie se déclara suivie d’une phtisie, et l’imbécillité du malheureux s’accrut.
— Par saint Martin ! quelle hémorragie ! s’écria ce bélître.
À cet événement, saisissant son goupillon, ridicule excédent de bagage, il la poursuivit dans l’église tout entière.`;

var testBis = "Bonjour je suis antoine";

var textOrigine = `Pour parler sans ambiguïté, ce dîner à Saint-Adresse, près du Havre, malgré les effluves embaumées de la mer, malgré les vins de très bon crus, les cuissots de veaux et les cuissots de chevreuil prodigués par l'amphitrion, fut un vrai guépier. Quelle que soit, quelqu'éxigüe qu'est pu paraître, à côté de la somme dûe, les arres qu'était censé avoir donné la douèrrière et le marguillier, il était infâme d'en vouloir pour cela à ces fussiliers jumeaux et mals battis et de leur infliger une raclée, alors qu'ils ne songeaient qu'à prendre des raffraichissements avec leurs corps éligionnaire. Quoi qu'il en soit, c'est bien à tord que la douèrrière, par un contre-sens exorbitant, s'est laisssée entraînée à prendre un râteau et qu'elle s'est crue obligée de frapper l'exigeant marguillier sur son ommoplate vieillie. Deux alvéoles furent brisées, une dicenterie se déclara, suivie d'une phtisie et l'imbécilité du malheureux s'accrue. « Par Saint-Martin, quelle hémoragie ! » s'écria ce béllitre ! À cet évènement, saississant son goupillon, ridicule excédant de baggage, il l'a poursuivie dans l'église tout entière.`;

var textCorrection = `Pour parler sans ambiguïté, ce dîner à Saint-Adresse, près du Havre, malgré les effluves embaumés de la mer, malgré les vins de très bon crus, les cuisseaux de veaux et les cuissots de chevreuils prodigués par l’amphitryon, fut un vrai guêpier. Quelles que soient, quelque exiguës qu'aient pu paraître, à côté de la somme due, les arrhes qu'étaient censés avoir données la douairière et le marguillier, il était infâme d'en vouloir pour cela à ces fusiliers jumeaux et mals bâtis et de leur infliger une raclée, alors qu'ils ne songeaient qu'à prendre des rafraîchissements avec leurs coreligionnaires. Quoi qu'il en soit, c'est bien à tort que la douairière, par un contresens exorbitant, s'est laissé entraîner à prendre un râteau et qu'elle s'est crue obligée de frapper l'exigeant marguillier sur son omoplate vieillie. Deux alvéoles furent brisés, une dysenterie se déclara, suivie d'une phtisie et l'imbécilité du malheureux s'accrut. « Par Saint-Martin, Quelle hémorragie ! » s'écria ce bélître ! À cet événement, saisissant son goupillon, ridicule excédent de bagage, il la poursuivit dans l'église tout entière.`;

// console.log(mergeFragment(generateFragments(test)));

var diff = new Diff();
var textDiff = diff.main(textOrigine, textCorrection);
var before = diff.prettyHtml(textDiff);
diff.cleanupSemantic(textDiff);
var after = diff.prettyHtml(textDiff);

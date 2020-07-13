import path from 'path';
import fs from 'fs';
import uniqid from 'uniqid';
import ffmpeg from 'fluent-ffmpeg';
import { Howl } from 'howler';

import { remote } from 'electron';

import {
	DATA_PATH,
	DICTEES_HISTORY_DIR,
	PONCTUATION_FR_LIST,
	PONCTUATION_FR_DIR,
	PONCTUATION_FR_FILES,
	MAX_REQUEST_PER_MINUTE_TTS,
	PAUSE_DIR,
	MAX_WORD_PER_SEGMENT
} from 'src/constants';

import { findAllOccurences, getPauseByText, testDefined, countWordsInText, getIndiceHalfTextWords, preprocessText } from 'src/utils';

const textToSpeechClient = remote.getGlobal('textToSpeechClient');

export class EventClass
{
	constructor()
	{
		this.handlers = {};
		this.on = this.addEventListener; // alias
	}

	addEventListener = (evt, callback = null) =>
	{
		if(typeof callback === "function")
		{
			if(evt in this.handlers)
			{
				this.handlers[evt].push(callback);
			}
			else
			{
				this.handlers[evt] = [callback];
			}
		}

		return this;
	}

	emitEvent = (evt, ...rest) =>
	{
		if(evt in this.handlers)
		{
			for(var callback of this.handlers[evt])
			{
				callback(...rest);
			}
		}
	}
}

export class Dictee
{
	constructor(type, name = null)
	{
		this.id = uniqid();
		this.type = type;
		this.name = name;

		this.creationDate = Date.now();
		this.correctText = null;
		this.tries = {};
	}

	init = (callback) =>
	{
		const createBuildFolder = () =>
		{
			if(this.type === Dictee.statics.types.GENERATED)
			{
				const buildFolderPath = path.join(this.getOutputDir(), Dictee.statics.names.GENERATED.SEGMENT_DIR);

				if(!fs.existsSync(buildFolderPath))
					fs.mkdir(buildFolderPath, callback);
				else
					callback();
			}
			else
			{
				callback();
			}
		}

		fs.stat(this.getOutputDir(), (err, stats) =>
		{
			if(err || !stats.isDirectory())
			{
				fs.mkdir(this.getOutputDir(), err =>
				{
					if(err) return callback(err);

					createBuildFolder();
				});
			}
			else
				createBuildFolder();
		});
	}

	setText = (text) =>
	{
		this.correctText = text;

		if(this.name === null)
			this.name = this.correctText.substring(0, 25) + '...';
	}

	saveTry = (obj) =>
	{
		this.tries[Date.now()] = obj;
	}

	getOutputDir = () =>
	{
		return path.join(DICTEES_HISTORY_DIR, this.id);
	}

	getPlayer = () =>
	{
		if(this.type === Dictee.statics.types.EXTERN)
		{
			return new DicteePlayerExtern(this);
		}
		else if(this.type === Dictee.statics.types.GENERATED)
		{
			return new DicteePlayerGenerated(this);
		}
		else
		{
			throw "What on earth is hapenning !";
		}
	}

	getSavableObject = () =>
	{
		var obj = {};

		obj.id = this.id;
		obj.type = this.type;
		obj.name = this.name;
		obj.creationDate = this.creationDate;
		obj.correctText = this.correctText;
		obj.tries = this.tries;

		return obj;
	}
}

Dictee.statics = {
	types :
	{
		GENERATED : "GENERATED",
		EXTERN : "EXTERN"
	},
	names :
	{
		EXTERN : { AUDIOFILE : 'extern_entire_lecture.mp3' },
		GENERATED :
		{
			FULL_DICTEE_AUDIOFILE : 'generated_full_dictee.mp3',
			SEGMENT_DIR : 'build'
		}
	},
	getSaveFilePath : (id) => (path.join(DICTEES_HISTORY_DIR, id, id + '.json')),
};

export class DicteeExtern extends Dictee
{
	constructor(name = null)
	{
		super(Dictee.statics.types.EXTERN, name);
	}

	getAudioFilePath = () => (path.join(this.getOutputDir(), Dictee.statics.names.EXTERN.AUDIOFILE));
}

export class DicteeGenerated extends Dictee
{
	constructor(text, name = null)
	{
		super(Dictee.statics.types.GENERATED, name);

		if(text)
			this.setText(text);
	}

	getSegmentPath = (segmentID) => (path.join(this.getOutputDir(), Dictee.statics.names.GENERATED.SEGMENT_DIR, segmentID + '.mp3'));

	getFullDicteePath = () => (path.join(this.getOutputDir(), Dictee.statics.names.GENERATED.FULL_DICTEE_AUDIOFILE));

	getPlayableDictee = () =>
	{
		// segment :
		// id : uniqid()
		// text : segmentedText
		// ponctuation : regex || null

		var playableList = [];

		// playableList.push(this.getFullDicteePath()); // temp

		for(var segment of this.generated.segmentedArray)
		{
			playableList.push(this.getSegmentPath(segment.id));

			if(segment.ponctuation !== null)
				playableList.push(path.join(PONCTUATION_FR_DIR, PONCTUATION_FR_FILES[segment.ponctuation]));

			playableList.push(getPauseByText(segment.text));

			playableList.push(this.getSegmentPath(segment.id));

			if(segment.ponctuation !== null)
				playableList.push(path.join(PONCTUATION_FR_DIR, PONCTUATION_FR_FILES[segment.ponctuation]));

			playableList.push(getPauseByText(segment.text));
		}

		// playableList.push(this.getFullDicteePath()); // temp

		return playableList;
	}

	getSavableObject = () =>
	{
		var obj = {};

		obj.id = this.id;
		obj.type = this.type;
		obj.name = this.name;
		obj.creationDate = this.creationDate;
		obj.correctText = this.correctText;
		obj.tries = this.tries;
		obj.generated = this.generated;

		return obj;
	}
}

export function dicteeBuilder(obj)
{
	var newDictee;

	if(obj.type === Dictee.statics.types.GENERATED)
		newDictee = new DicteeGenerated();
	else if(obj.type === Dictee.statics.types.EXTERN)
		newDictee = new DicteeExtern();

	for(var prop in obj)
	{
		newDictee[prop] = obj[prop];
	}

	return newDictee;
}

export class DicteePlayer extends EventClass
{
	constructor(dictee)
	{
		super();

		this.refDictee = dictee;
	}

	play = () =>
	{
		throw "Vous devez redéfinir cette méthode";
	}

	stop = () =>
	{
		throw "Vous devez redéfinir cette méthode";
	}
}

export class DicteePlayerExtern extends DicteePlayer
{
	constructor(dictee)
	{
		super(dictee);

		this.audioFilePath = path.join(this.refDictee.getOutputDir(), Dictee.statics.names.EXTERN.AUDIOFILE);
		this.sound = new Howl({ src: [this.audioFilePath], onend: () => { this.emitEvent("finish"); } });
	}

	play = () =>
	{
		this.sound.play();
	}

	stop = () =>
	{
		this.sound.play();
	}
}

export class DicteePlayerGenerated extends DicteePlayer
{
	constructor(dictee)
	{
		super(dictee);

		this.init();
	}

	init = () =>
	{
		this.playableList = this.refDictee.getPlayableDictee();

		this.restantFiles = this.playableList.length;
		this.ready = false;

		this.playlist = [];

		for(var playableName of this.playableList)
		{
			var playable;

			if(typeof playableName === 'string')
			{
				playable = new Howl({ src: [playableName], onend: this.playNext });
				playable.once('load', this.loaded);
			}
			else if(typeof playableName === 'number')
			{
				playable = playableName;
				this.restantFiles--; // pas de chargement !!!
			}

			this.playlist.push(playable);

			this.currentIndice = 0;
		}
	}

	loaded = () =>
	{
		if(--this.restantFiles === 0)
		{
			this.ready = true;

			if(this.waiting === true)
				this.play();
		}
	}

	playNext = () =>
	{
		this.currentIndice++;

		if(this.currentIndice === this.playlist.length)
		{
			this.currentIndice = 0;
			this.emitEvent("finish");
		}
		else
		{
			if(typeof this.playlist[this.currentIndice] === 'number')
				setTimeout(this.playNext, this.playlist[this.currentIndice]);
			else
				this.playlist[this.currentIndice].play();
		}
	}

	play = () =>
	{
		if(!this.ready)
		{
			this.waiting = true;
		}
		else
		{
			this.waiting = false;

			if(typeof this.playlist[this.currentIndice] === 'number')
				setTimeout(this.playNext, this.playlist[this.currentIndice]);
			else
				this.playlist[this.currentIndice].play();
		}
	}

	stop = () =>
	{
		// todo
	}
}

export class DicteeGenerator extends EventClass
{
	constructor()
	{
		super();

		this.refDictee = null;
		this.currentStep = 0;
	}

	log = (...params) =>
	{
		this.emitEvent("log", ...params);
	}

	run = (dictee) =>
	{
		this.refDictee = dictee;

		if("refDictee" in this && this.refDictee.correctText !== null)
		{
			this.log("On préprocess la dictée");
			var preprocessedText = preprocessText(this.refDictee.correctText);

			this.refDictee.correctText = preprocessedText;

			if(testDefined(this.refDictee, 'generated', 'mergedArray'))
			{
				reject("error", { err : {}, message : "Vous avez déjà fait une génération de cette dictée !" });
			}
			else
			{
				Promise.all([this.getFullDictee(preprocessedText), this.generateSegments(preprocessedText)])
				.then(results =>
				{
					var generated = {};

					for(var res of results)
					{
						if(typeof res === 'object')
						generated = { ...generated, ...res };
					}

					this.emitEvent("finished", generated);
				})
				.catch(err =>
				{
					this.emitEvent("error", err);
				});
			}
		}
		else
		{
			this.emitEvent("error", { err : {}, message : "Vous devez renseigner le texte de la dictée !" });
		}
	}

	getFullDictee = (preprocessedText) =>
	{
		return new Promise((resolve, reject) =>
		{
			this.log("On récupère la dictée en entière (appel à TTS)");

			const requestEntireLecture = {
				audioConfig:
				{
					audioEncoding: 'LINEAR16',
					pitch: 2,
					speakingRate: 0.8
				},
				input:
				{
					text: preprocessedText
				},
				voice:
				{
					languageCode: "fr-FR",
					name: "fr-FR-Wavenet-C"
				}
			};

			textToSpeechClient.synthesizeSpeech(requestEntireLecture).then(([res]) =>
			{
				if('audioContent' in res)
				{
					const outputPath = path.join(this.refDictee.getOutputDir(), Dictee.statics.names.GENERATED.FULL_DICTEE_AUDIOFILE);

					this.log("On a recu la réponse de TTS, on sauvegarde le fichier de la dictée entière");
					fs.writeFile(outputPath, res.audioContent, err =>
					{
						if(err)
						{
							reject({ err, message : "Une erreur est survenue lors de la sauvegarde du fichier de dictée ! Veuillez réessayer plus tard." });
							return;
						}

						resolve();
					});
				}
				else
				{
					reject({ err, message : "Erreur lors de la réception de la dictée synthétisée ! Veuillez réessayer plus tard." });
				}
			})
			.catch(err =>
			{
				reject({ err, message : "Une erreur est survenue lors de la génération de la dictée ! Veuillez réessayer plus tard." });
			});
		});
	}

	generateSegments = (preprocessedText) =>
	{
		this.log("Génération des segments de la dictée");
		return new Promise((resolve, reject) =>
		{
			var segmentedArray = this.segmentText(preprocessedText);

			this.log("segmentedArray", segmentedArray);

			var promisesArray = [];

			for(var segment of segmentedArray)
			{
				promisesArray.push(this.generateSegmentText(segment.text, this.refDictee.getSegmentPath(segment.id)));
			}

			if(promisesArray.length > MAX_REQUEST_PER_MINUTE_TTS)
				return reject({ err : {}, message : "Votre dictée fait plus de 300 morceaux de phrases, nous ne pouvons pas la traiter" });

			this.log("On a segmenté la dictée, on va a présent télécharger les segments vers TTS");

			Promise.all(promisesArray)
			.then(() =>
			{
				this.log("On a téléchargé tous les segments, la dictée est prête !");

				resolve({ segmentedArray });
			})
			.catch(err => reject(err));
		});
	}

	segmentText = (text) =>
	{
		var segmentedText = [];

		var regex = new RegExp(`\.\n|[${PONCTUATION_FR_LIST.filter(elem => elem !== '.\n').join('')}]`, 'g');
		var resRegexExecArray;

		var indexesArray = [];

		while ((resRegexExecArray = regex.exec(text)) !== null)
		{
			indexesArray.push([resRegexExecArray[0], resRegexExecArray.index]);
		}

		if(indexesArray.length === 0) // si y'a pas de ponctuation du tout
		{
			segmentedText.push({
				id : uniqid(),
				text,
				ponctuation : null
			});
		}

		var lastIndex = 0;

		for(var [regex, index] of indexesArray)
		{
			const segmentText = text.substring(lastIndex, index);

			segmentedText.push({
				id : uniqid(),
				text : segmentText,
				ponctuation : regex
			});

			lastIndex = index + regex.length;
		}

		function getBiggestSegment(segmentedText)
		{
			var max = 0, segmentIndice = null;
			for(var indice in segmentedText)
			{
				var words = countWordsInText(segmentedText[indice].text);
				if(words > max)
				{
					segmentIndice = indice;
					max = words;
				}
			}
			return { max, segmentIndice };
		}

		// on coupe les phrase de plus de 10 mots en 2
		var maxRes;
		while((maxRes = getBiggestSegment(segmentedText)).max > MAX_WORD_PER_SEGMENT)
		{
			var biggestSegment = segmentedText[maxRes.segmentIndice];

			var firstObject = { id : uniqid(), ponctuation : null };
			var secondObject = { id : uniqid(), ponctuation : biggestSegment.ponctuation };

			var indiceMiddle = getIndiceHalfTextWords(biggestSegment.text);
			firstObject.text = biggestSegment.text.substring(0, indiceMiddle);
			secondObject.text = biggestSegment.text.substring(indiceMiddle);

			segmentedText.splice(maxRes.segmentIndice, 1, firstObject, secondObject);
		}

		return segmentedText;
	}

	generateSegmentText = (segmentText, outputPath) =>
	{
		return new Promise((resolve, reject) =>
		{
			const requestSegmentText = {
				audioConfig:
				{
					audioEncoding: 'LINEAR16',
					pitch: 2,
					speakingRate: 0.7
				},
				input: { text : segmentText },
				voice:
				{
					languageCode: "fr-FR",
					name: "fr-FR-Wavenet-C"
				}
			};

			textToSpeechClient.synthesizeSpeech(requestSegmentText).then(([res]) =>
			{
				if('audioContent' in res)
				{
					fs.writeFile(outputPath, res.audioContent, err =>
					{
						if(err)
						{
							reject({ err, message : "Une erreur est survenue lors de la sauvegarde du fichier de dictée ! Veuillez réessayer plus tard." });
							return;
						}

						resolve();
					});
				}
				else
				{
					reject({ err, message : "Erreur lors de la réception de la dictée synthétisée ! Veuillez réessayer plus tard." });
				}
			})
			.catch(err =>
			{
				reject({ err, message : "Une erreur est survenue lors de la génération de la dictée ! Veuillez réessayer plus tard." });
			});
		});
	}
}

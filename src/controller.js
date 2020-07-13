import fs from 'fs';
import path from 'path';
import { Dictee, DicteeGenerated, DicteeExtern, DicteeGenerator, dicteeBuilder } from 'src/model';
import YoutubeMp3Downloader from 'youtube-mp3-downloader';

import { extractAudio } from 'src/utils';

import {
	DICTEES_HISTORY_DIR,
	DATA_PATH,
	FFMPEG_PATH,
	MAX_CHARACTER_PER_DICTEE_GENERATED
} from 'src/constants';

export default class Controller
{
	constructor()
	{
		this.dictees = {};
		this.currentDictee = null;
	}

	init = () =>
	{
		return new Promise((resolve, reject) =>
		{
			fs.readdir(DICTEES_HISTORY_DIR, (err, historyDirFiles) =>
			{
				if(err) return reject(err);

				var dicteesIds = [];

				for(var dicteeId of historyDirFiles)
				{
					if(!fs.lstatSync(path.join(DICTEES_HISTORY_DIR, dicteeId)).isDirectory()) // si c'est pas un dossier
						continue;

					dicteesIds.push(dicteeId);
				}

				var restantFiles = dicteesIds.length;

				if(restantFiles === 0)
					return resolve();

				const endBuild = (err, builtDictee) =>
				{
					if(err) console.error(err);
					else this.addDictee(builtDictee);
					if(--restantFiles === 0) resolve();
				};

				dicteesIds.forEach(dicteeId =>
				{
					const dicteePathSaveFile = Dictee.statics.getSaveFilePath(dicteeId);

					if(!fs.existsSync(dicteePathSaveFile))
						return endBuild(`Le fichier de sauvegarde n'existe pas ! (${dicteePathSaveFile})`);

					fs.readFile(dicteePathSaveFile, (err, rawData) =>
					{
						if(err)
							return endBuild(err);
						else
							return endBuild(undefined, dicteeBuilder(JSON.parse(rawData)));
					});
				});
			});
		});
	}

	save = () =>
	{
		for(var dicteeId in this.dictees)
		{
			const savePath = Dictee.statics.getSaveFilePath(dicteeId);
			const saveObj = JSON.stringify(this.dictees[dicteeId].getSavableObject());

			fs.writeFile(savePath, saveObj, err => { if(err) console.error(err); });
		}
	}

	addDictee = (dictee, set) =>
	{
		if(!(dictee instanceof Dictee))
			throw "Vous ne pouvez ajouter qu'une dictée";

		this.dictees[dictee.id] = dictee;

		if(set === true) this.setDictee(dictee.id);
	}

	setDictee = (dicteeId) =>
	{
		if(dicteeId in this.dictees)
		{
			this.currentDictee = dicteeId;
			return true;
		}
		return false;
	}

	isDicteeSet = () => this.currentDictee !== null;

	getDictee = () => (this.dictees[this.currentDictee]);

	generateDicteeFromText = (text, set) =>
	{
		return new Promise((resolve, reject) =>
		{
			var newDictee = new DicteeGenerated(text);

			newDictee.init(err =>
			{
				if(err) return reject({ err, message : "Une erreur est survenue à l'initialisation de la dictée !" });

				new DicteeGenerator().on("finished", generated =>
				{
					newDictee.generated = generated;

					this.addDictee(newDictee, set);
					resolve("La dictée a bien été générée");
				})
				.on("error", reject)
				.on("log", (...log) =>
				{
					console.log(...log);
				})
				.run(newDictee);
			});
		});
	}

	generateDicteeFromFile = (filePath, set) =>
	{
		return new Promise((resolve, reject) =>
		{
			var newDictee = new DicteeExtern();

			newDictee.init(err =>
			{
				if(err) return reject({ err, message : "Une erreur est survenue à l'initialisation de la dictée !" });

				extractAudio(filePath, newDictee.getAudioFilePath())
				.then(() =>
				{
					this.addDictee(newDictee, set);
					resolve("Extraction réussiste !");
				})
				.catch(err =>
				{
					reject({ err, message : "Une erreur est survenue pendant la récupération du fichier ! Veuillez réessayer." });
				});
			});
		});
	}

	generateDicteeFromYoutube = (youtubeVideoId, set, progressCallback) =>
	{
		return new Promise((resolve, reject) =>
		{
			var newDictee = new DicteeExtern();

			newDictee.init(err =>
			{
				if(err) return reject({ err, message : "Une erreur est survenue à l'initialisation de la dictée !" });

				var YoutubeDownloader = new YoutubeMp3Downloader({
					ffmpegPath: FFMPEG_PATH,
					outputPath: newDictee.getOutputDir(),
					youtubeVideoQuality: "highest",
					queueParallelism: 2,
					progressTimeout: 100
				});

				YoutubeDownloader.download(youtubeVideoId, Dictee.statics.names.EXTERN.AUDIOFILE);

				YoutubeDownloader.on("finished", (err, { file }) =>
				{
					if(err) return reject({ err, message : "Une erreur est survenue au téléchargement de l'audio !" });

					this.addDictee(newDictee, set);
					resolve("Le téléchargement à réussi : " + file);
				});

				YoutubeDownloader.on("error", err =>
				{
					if(err) reject({ err, message : "Erreur pendant le téléchargement" });
				});

				YoutubeDownloader.on("progress", ({ progress : { percentage }}) =>
				{
					if(progressCallback) progressCallback(Math.floor(percentage));
				});
			});
		});
	}
}

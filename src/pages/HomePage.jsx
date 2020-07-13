import fs from 'fs';
import path from 'path';
import React from 'react';
import { remote } from 'electron';
import { clipboard } from 'electron';

const { dialog } = remote;

import $ from "jquery";
import BasePage from 'components/BasePage';
import { withHistory } from 'components/WithHistory';
import { withControllerContext } from 'components/ControllerContext';

import { testDefined, extractYoutubeVideoId, blurText } from 'src/utils';

class HomePage extends BasePage
{
	constructor(props)
	{
		super(props);

		this.state = {
			filePath : null,
			progress : null,
			dicteeText : ''
		};

		console.log(this.props.controller.dictees);
	}

	showInfos = (message) =>
	{
		dialog.showMessageBox({ title : 'Infos', message });
	}

	showError = (message) =>
	{
		dialog.showErrorBox('Erreur !', message);
	}

	handleCatch = ({ err, message }) =>
	{
		console.error(err);
		this.showError(message);
		this.setState({ progress : null });
	}

	onPasteDictee = () =>
	{
		const dicteeText = clipboard.readText();

		if(typeof dicteeText !== 'string')
			return this.showError("Vous ne pouvez coller que du texte");

		if(dicteeText.length >= 5000)
			return this.showError("Votre dictée ne peut pas faire plus de 5000 caractères !");

		this.setState({ dicteeText });
	}

	handleText = () =>
	{
		const text = this.state.dicteeText.trim();

		if(text !== null && text !== '')
		{
			this.setState({ progress : -1 });

			this.props.controller.generateDicteeFromText(text, true)
			.then(message =>
			{
				this.showInfos(message);
				this.setState({ progress : null });
			})
			.catch(this.handleCatch);
		}
		else
		{
			this.showInfos("Vous devez saisir votre dictée ici avant de valider.");
		}
	}

	handleFile = () =>
	{
		const { filePath } = this.state;
		if(filePath !== null)
		{
			this.setState({ progress : -1 });

			this.props.controller.generateDicteeFromFile(filePath, true)
			.then(message =>
			{
				this.showInfos(message);
				this.setState({ progress : null });
			})
			.catch(this.handleCatch);
		}
		else
		{
			this.showInfos("Vous devez choisir un fichier");
		}
	}

	handleYoutube = () =>
	{
		const link = $('#youtube_link').val();

		if(link !== null && link !== '')
		{
			const youtubeVideoId = extractYoutubeVideoId(link);

			if(youtubeVideoId !== null)
			{
				this.setState({ progress : -1 });

				this.props.controller.generateDicteeFromYoutube(youtubeVideoId, true, (progress) => { this.setState({progress}); })
				.then(message =>
				{
					this.showInfos(message);
					this.setState({ progress : null });
				})
				.catch(this.handleCatch);
			}
			else
				this.showError("Vous devez entrer le lien d'une vidéo youtube (le lien que vous avez fourni n'est pas valide)");
		}
		else
			this.showInfos("Vous devez entrer le lien d'une vidéo youtube");
	}

	onFileChange = (evt) =>
	{
		if(testDefined(evt, 'target', 'files', 0))
			this.setState({ filePath: evt.target.files[0].path});
	}

	handleDicteeCode = () =>
	{
		const dicteeCode = $('#input_dictee_code').val();

		this.props.controller.setDictee(dicteeCode);
	}

	handleStartDictee = () =>
	{
		this.props.history.push('/start');
	}

	render()
	{
		const { filePath, progress, dicteeText, dicteeCode } = this.state;

		return (
			<div id="content" className="scrollbar-style p-3" style={{overflowY : 'auto', height : (window.innerHeight - 106) }}>
			<h1>Tester vos compétences en dictée</h1>
			<p>Vous pouvez effectuer la dictée de votre choix, il est préférable que vous trouviez une vidéo d'une personne la lisant (au rythme d'une dictée) afin que le confort soit maximal. Si vous possédez vous-même des fichiers audio ou vidéo d'une lecture de dictée vous pouvez également les utiliser. En dernier recours, vous pouvez utiliser la fonction expérimentale de lecture par une voix artificiel mais cela peut parfois être une lecture rendant la dictée plus compliquée. Bonne chance à vous !</p>
			<div className="d-flex justify-content-center align-items-center">
				<div className="w-50">
					<div className="md-form input-with-pre-icon">
						<i className="fas fa-user input-prefix"></i>
						<input type="text" id="input_dictee_code" className="form-control" defaultValue="j5kkc17qra3" />
						<label htmlFor="dicteeCode">Code de dictée</label>
					</div>
					<button className="btn blue-gradient" onClick={this.handleDicteeCode}>SET DICTÉE</button>
					<button className="btn blue-gradient" onClick={this.handleStartDictee}>COMMENCER LA DICTÉE</button>
				</div>
			</div>
			<div className="accordion" id="accordionExample">
				<div className="card z-depth-0 bordered">
					<div className="card-header" id="headingTwo">
						<div className="d-flex justify-content-center">
							<h5 className="mb-0">
								<button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
									Depuis un texte (fonctionnalité expérimentale)
								</button>
							</h5>
						</div>
					</div>
					<div id="collapseThree" className="collapse show" aria-labelledby="headingTwo" data-parent="#accordionExample">
						<div className="card-body">
							<div className="d-flex justify-content-center">
								<div className="w-75">
									<button type="button" className="btn btn-default" onClick={this.onPasteDictee}>Cliquer pour coller votre dictée</button>
									<div className="md-form">
									<textarea id="dictee_text" className="md-textarea form-control" rows="2" disabled value={blurText(dicteeText)}></textarea>
									</div>
									<button className="btn blue-gradient" onClick={this.handleText}>PRÉPARER LA DICTÉE</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="card z-depth-0 bordered">
					<div className="card-header" id="headingOne">
						<div className="d-flex justify-content-center">
							<h5 className="mb-0">
								<button className="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
									Depuis une vidéo youtube
								</button>
							</h5>
						</div>
					</div>
					<div id="collapseOne" className="collapse" aria-labelledby="headingOne" data-parent="#accordionExample">
						<div className="card-body">
							<div className="d-flex justify-content-center">
								<div className="w-75">
									<div className="md-form input-with-pre-icon">
										<i className="fas fa-link prefix"></i>
										<input type="text" id="youtube_link" className="form-control" />
										<label htmlFor="youtube_link">Lien vidéo youtube</label>
									</div>
									<button className="btn blue-gradient" onClick={this.handleYoutube}>PRÉPARER LA DICTÉE</button>
									{ progress != null && progress !== -1 &&
										<div className="progress">
										  <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" style={{ width :`${progress}%` }}>{`${progress}%`}</div>
										</div>
									}
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="card z-depth-0 bordered">
					<div className="card-header" id="headingTwo">
						<div className="d-flex justify-content-center">
							<h5 className="mb-0">
								<button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
									Depuis un fichier de votre ordinateur
								</button>
							</h5>
						</div>
					</div>
					<div id="collapseTwo" className="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">
						<div className="card-body">
							<div className="d-flex justify-content-center">
								<div className="w-75">
									<div className="input-group">
										<div className="input-group-prepend">
											<span className="input-group-text" id="inputGroupFileAddon01">Fichier de dictée</span>
										</div>
										<div className="custom-file">
										<input type="file" accept="audio/*,video/*" className="custom-file-input" id="dictee_file" aria-describedby="fileInput" onChange={this.onFileChange} />
											<input type="file" aria-describedby="inputGroupFileAddon01"  />
											<label className="custom-file-label" htmlFor="dictee_file">{(filePath !== null) ? path.basename(filePath) : "Choisissez un fichier audio ou vidéo" }</label>
										</div>
									</div>
									<button className="btn blue-gradient" onClick={this.handleFile}>PRÉPARER LA DICTÉE</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{ progress != null &&
				<div style={{ position : 'fixed', top : '50%', left : '50%', right : '50%', bottom : '50%' }}>
					<div className="spinner-border text-primary" role="status">
						<span className="sr-only">Chargement...</span>
					</div>
				</div>
			}
			</div>
		);
	}
}

export default withControllerContext(withHistory(HomePage));

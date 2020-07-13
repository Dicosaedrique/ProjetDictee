import React from 'react';
import { remote } from 'electron';

const { dialog } = remote;

import $ from "jquery";
import Diff from 'text-diff';

import { RELECTURE_TIME } from 'src/constants';

import {  } from 'src/utils';
import BasePage from 'components/BasePage';
import { withHistory } from 'components/WithHistory';
import { withControllerContext } from 'components/ControllerContext';

class StartPage extends BasePage
{
	constructor(props)
	{
		super(props);

		this.state = {
			countdownInProgress : false,
			countdown : RELECTURE_TIME,
			endOfDictee : false,
			checkMode : false,
			promptCorrectText : false,
			loading : false
		}
	}

	componentDidMount = () =>
	{
		if(this.props.controller.isDicteeSet())
		{
			const player = this.props.controller.getDictee().getPlayer();

			player.on('finish', this.startRelecture)
			.play();
		}
		else
			this.showInfos("Vous devez choisir une dictée");
	}

	startRelecture = () =>
	{
		this.setState({ countdownInProgress : true });

		this.stopInterval = setInterval(() =>
		{
			var newCountDown = this.state.countdown - 1000;

			if(newCountDown <= 0)
			{
				this.endOfDictee();
				this.setState({ countdown : RELECTURE_TIME, countdownInProgress : false });
				if(this.stopInterval) clearInterval(this.stopInterval);
			}
			else
				this.setState({ countdown : newCountDown });
		},
		1000);
	}

	endOfDictee = () =>
	{
		this.setState({ endOfDictee : true });
		this.showInfos("La dictée est finie");
		this.submitDictee();
	}

	submitDictee = () =>
	{
		if(this.stopInterval) clearInterval(this.stopInterval);
		this.dicteeTest = $('#dictee_text').val();
		this.setState({ checkMode : true });
		if(this.props.controller.getDictee().correctText === null)
			this.setState({ promptCorrectText : true });
		else
			this.checkDiff();
	}

	submitCorrectText = () =>
	{
		this.props.controller.getDictee().setText($('#dictee_correct').val());
		this.setState({ promptCorrectText : false });
		this.checkDiff();
	}

	checkDiff = () =>
	{
		this.setState({ loading : true });

		new Promise((resolve, reject) =>
		{
			var diff = new Diff();
			var textDiff = diff.main(this.dicteeTest, this.props.controller.getDictee().correctText);
			diff.cleanupSemantic(textDiff);

			this.parsedHTML = diff.prettyHtml(textDiff); $.parseHTML(this.parsedHTML);

			resolve();
		})
		.then(() => this.setState({ loading : false }, () =>
		{
			$('#anchor').append($.parseHTML(this.parsedHTML));
		}));
	}

	render()
	{
		const { countdownInProgress, countdown, endOfDictee, checkMode, promptCorrectText, loading } = this.state;

		if(promptCorrectText)
		{
			return (
				<div>
					<p>Saisissez le correctif de votre dictée dans le champ ci-dessous</p>
					<div className="md-form">
						<textarea id="dictee_correct" className="md-textarea form-control" rows="2" spellCheck={false}></textarea>
					</div>
					<button className="btn blue-gradient" onClick={this.submitCorrectText}>VALIDER</button>
				</div>
			);
		}
		else
		{
			if(!checkMode)
			{
				return (
					<div>
						{ countdownInProgress && <div className="w-75">
							<p style={{ fontSize : 30 }}>{`${Math.floor(countdown / 1000 / 60)}:${Math.floor(countdown / 1000) % 60}`}</p>
						</div>}
						<div className="md-form">
							<textarea id="dictee_text" className="md-textarea form-control" rows="2" disabled={endOfDictee} spellCheck={false}></textarea>
						</div>
						<button className="btn blue-gradient" onClick={this.submitDictee}>VALIDATION DE LA DICTÉE</button>
					</div>
				);
			}
			else
			{
				if(loading)
				{
					return (
						<div style={{ position : 'fixed', top : '50%', left : '50%', right : '50%', bottom : '50%' }}>
							<div className="spinner-border text-primary" role="status">
								<span className="sr-only">Chargement...</span>
							</div>
						</div>
					);
				}
				else
				{
					return (
						<div id="anchor">
						</div>
					);
				}
			}
		}
	}
}

export default withControllerContext(withHistory(StartPage));

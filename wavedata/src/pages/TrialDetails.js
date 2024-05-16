import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRightIcon, UserIcon, CurrencyDollarIcon, GlobeAltIcon, ChevronRightIcon, PlusSmIcon, TrashIcon, DocumentDuplicateIcon, PencilIcon } from "@heroicons/react/solid";
import { formatDistance } from "date-fns";
import Form from "react-bootstrap/Form";
import useContract from '../contract/useContract.ts';
import "./TrialDetails.css";
import CreateSurveyModal from "../components/modal/CrateSurvey";

import OverViewChartBar from '../components/Card/OverViewChartBar'

import UpdateTrialModal from "../components/modal/UpdateTrial";
import ViewControbutiors from "../components/modal/ViewControbutiors";

function TrialDetails() {
	const params = useParams();
	const navigate = useNavigate();
	const [tabIndex, setTabIndex] = useState(0);
	const [UpdatemodalShow, setModalShow] = useState(false);
	const [CreateSurveymodalShow, setSurveyModalShow] = useState(false);
	const [ContributorsmodalShow, setContributorsmodalShow] = useState(false);
	const [LoadingSurvey, setLoadingSurvey] = useState(false);
	const [LoadingInformed, setLoadingInformed] = useState(false);
	const [SelectedContributorId, setSelectedContributorId] = useState(0);
	const [Selected_ongoing_id, setSelected_ongoing_id] = useState(0);
	const [LoadingContributors, setLoadingContributors] = useState(false);
	const { contract, signerAddress, fD } = useContract();
	const [screenSize, getDimension] = useState({
		dynamicWidth: window.innerWidth,
		dynamicHeight: window.innerHeight
	});

	const [agesData, setAgesData] = useState([]);

	const [emptydata, setemptydata] = useState([]);

	const [audiences, setAudiences] = useState([{ id: "a", AgeMin: "35", AgeMax: "40", Race: "asian", Gender: "male" }]);

	const [subjects, setSubjects] = useState([]);

	const [studyTitle, setStudyTitle] = useState({
		ages_ans: {}
	});

	const [data, setData] = useState([]);

	const [contributors, setContributors] = useState([]);

	const [TRIAL_DATA, setTRIAL_DATA] = useState({});

	const TABS = [{ id: "surveys", title: "Surveys" }, { id: "informed-consent", title: "Informed Consent" }, { id: "contributors", title: "Contributors" }, { id: "settings", title: "Settings" }, { id: "overview", title: "Overview" }];

	const TABLE_COLS = [{ id: "name", title: "Name" }, { id: "question", title: "Question" }, { id: "reward", title: "Reward" }, { id: "submission", title: "Submission" }, { id: "last submission", title: "Last submission" }];

	const CONTRIBUTORs_COLS = [{ id: "name", title: "Name" }, { id: "identifier", title: "Identifier" }, { id: "patient_id", title: "Patient Id" }, { id: "joined", title: "Joined" }, { id: "details", title: "Details" }];

	const AUDIENCES_COLS = [{ id: "age_minimum", title: "Age minimum" }, { id: "age_maximum", title: "Age maximum" }, { id: "race", title: "Race" }, { id: "gender", title: "Gender" }];



	const addSurvey = () => {
		setSurveyModalShow(true);
	};
	const ShowContributors = (user_id, ongoing_id) => {
		setSelectedContributorId(user_id);
		setSelected_ongoing_id(ongoing_id);
		setContributorsmodalShow(true);
	};
	const addAudiance = async () => {
		setAudiences((prevState) => [
			...prevState,
			{
				id: 0,
				ageMin: "",
				ageMax: "",
				race: "",
				gender: ""
			}
		]);
	};

	const addSubject = async () => {

		let ages_ans = {};
		for (let i = 0; i < agesData.length; i++) {
			const element = agesData[i];

			ages_ans[element.id] = {
				answer: "",
				type: "yes/no",
				limited: [],
				questiontype2: "",
				urlText: "",
				urlType: ""
			};
		}

		setSubjects((prevState) => [
			...prevState,
			{
				subject_id: -1,
				subject_index_id: Math.floor(Math.random() * Date.now()).toString(16),
				title: "",
				ages_ans: ages_ans
			}
		]);
	};
	async function UpdateAges(event) {
		DisableButton("AgeSave");

		await contract.UpdateAges(parseInt(params.id), JSON.stringify(agesData)).send({
			feeLimit: 1_000_000_000,
			shouldPollResponse: false
		});

		EnableButton("AgeSave");
	}

	async function CreateOrUpdateSubject(event, idx) {

		var SaveBTN = event.target;
		SaveBTN.classList.remove("hover:bg-gray-600");
		SaveBTN.classList.remove("bg-black");
		SaveBTN.classList.add("bg-gray-400");
		SaveBTN.classList.add("cursor-default");
		SaveBTN.disabled = true;

		let subject_data = subjects[idx];

		if (subject_data.subject_id == -1) {
			await CreateSubject(subject_data, idx);
		} else {
			await UpdateSubject(subject_data);
		}



		SaveBTN.disabled = false;
		SaveBTN.classList.add("hover:bg-gray-600");
		SaveBTN.classList.add("bg-black");
		SaveBTN.classList.remove("bg-gray-400");
		SaveBTN.classList.remove("cursor-default");
	}

	async function CreateSubject(subInfo, idx) {
		let subject_id = await contract._SubjectIds().call();
		await contract.CreateSubject(parseInt(params.id), subInfo.subject_index_id, subInfo.title, JSON.stringify(subInfo.ages_ans)).send({
			feeLimit: 1_000_000_000,
			shouldPollResponse: false
		});

		subjects[idx].subject_id = Number(subject_id);
		updateState();
	}


	async function UpdateSubject(subInfo) {
		await contract.UpdateSubject(subInfo.subject_id, subInfo.title, JSON.stringify(subInfo.ages_ans)).send({
			feeLimit: 1_000_000_000,
			shouldPollResponse: false
		});
	}



	function DisableButton(buttonID) {
		var ButtonElm = document.getElementById(buttonID);
		ButtonElm.classList.remove("hover:bg-gray-600");
		ButtonElm.classList.remove("bg-black");
		ButtonElm.classList.add("bg-gray-400");
		ButtonElm.classList.add("cursor-default");

		ButtonElm.disabled = true;
	}
	function EnableButton(buttonID) {
		var ButtonElm = document.getElementById(buttonID);

		ButtonElm.disabled = false;
		ButtonElm.classList.add("hover:bg-gray-600");
		ButtonElm.classList.add("bg-black");
		ButtonElm.classList.remove("bg-gray-400");
		ButtonElm.classList.remove("cursor-default");
	}


	async function UpdateStudyTitle() {
		DisableButton("StudyTitleSave");


		await contract.UpdateStudyTitle(parseInt(params.id), JSON.stringify(studyTitle.ages_ans)).send({
			feeLimit: 1_000_000_000,
			shouldPollResponse: false
		});
		EnableButton("StudyTitleSave");
	}

	async function UpdateAudiences(event) {
		DisableButton("audienceSave");


		const createdObject = [];
		await audiences.forEach(async (element) => {
			createdObject.push({
				id: parseInt(element.id),
				AgeMin: Number(element.AgeMin),
				AgeMax: Number(element.AgeMax),
				Race: element.Race,
				Gender: element.Gender
			});
		});
		await contract.UpdateAudience(parseInt(params.id), JSON.stringify(createdObject)).send({
			feeLimit: 1_000_000_000,
			shouldPollResponse: false
		});
		EnableButton("audienceSave");

	}
	async function UpdateRewarads(event) {
		event.preventDefault();
		const { rewardselect, rewardprice, totalspendlimit } = event.target;

		DisableButton("rewardsSave");

		try {
			await contract.UpdateReward(Number(parseInt(params.id)), rewardselect.value, Number(rewardprice.value.replace("TRX", "")), parseInt(totalspendlimit.value.replace("TRX", ""))).send({
				feeLimit: 1_000_000_000,
				shouldPollResponse: false
			});
		} catch (error) { }

		EnableButton("rewardsSave");

	}

	async function removeElementFromArray(all, specific, seting) {
		seting([]);

		var storing = [];
		for (let index = 0; index < all.length; index++) {
			const element = all[index];
			if (index === specific) {
				continue;
			}
			storing.push(element);
		}

		seting(storing);
	}
	async function LoadData() {
		if (contract !== undefined && contract !== null) {
			setTRIAL_DATA({});

			let trial_element = await contract._trialMap(parseInt(params.id)).call();
			let allAudiences = [];
			try {
				allAudiences = JSON.parse(await contract._trialAudienceMap(parseInt(params.id)).call());
			} catch (e) {
				allAudiences = [];
			}
			var newTrial = {
				id: Number(trial_element.trial_id),
				title: trial_element.title,
				image: trial_element.image,
				description: trial_element.description,
				contributors: Number(trial_element.contributors),
				audience: Number(allAudiences.length),
				budget: Number(trial_element.budget),
				reward_type: trial_element.reward_type,
				reward_price: Number(trial_element.reward_price),
				total_spending_limit: Number(trial_element.total_spending_limit)
			};
			setTRIAL_DATA(newTrial);


		}
	}


	async function LoadDataInformed() {
		if (contract !== undefined && contract !== null) {
			if (!LoadingSurvey) {
				setLoadingInformed(true);

				//Load Ages
				let ages_Data_element = await contract._trialAges(parseInt(params.id)).call();
				setAgesData(ages_Data_element == "" ? [] : JSON.parse(ages_Data_element));



				//Load Study Title
				let study_Data_element = await contract._trialTitles(parseInt(params.id)).call();
				let parsed_study = JSON.parse(study_Data_element);
				if (study_Data_element == "") {
					setStudyTitle({ ages_ans: {} });
				} else {
					setStudyTitle({ ages_ans: parsed_study });
				}



				//Load Subjects
				let new_subjects = [];
				let total_subs = Number(await contract._SubjectIds().call());
				for (let i = 0; i < total_subs; i++) {
					const element = await contract._trialSubjects(i).call();

					if (Number(element.trial_id) === parseInt(params.id)) {
						new_subjects.push({
							subject_id: Number(element.subject_id),
							trial_id: Number(element.trial_id),
							subject_index_id: element.subject_index_id,
							"title": element.title,
							ages_ans: JSON.parse(element.ages_ans),
						})

					}
				}
				setSubjects(new_subjects);



				setLoadingInformed(false);
			}
		}
	}



	function RatingAnswer({ item, indexItem, index }) {
		return (
			<>
				<div className={`bg-white ${screenSize.dynamicWidth < 800 ? "" : ""}`} style={{ width: screenSize.dynamicWidth < 800 ? "100%" : "49%" }} id={`AnswerType${indexItem}`}>
					<select
						id="testID"
						defaultValue={item.questiontype2}
						onChange={(e) => {
							subjects[index].ages_ans[indexItem].questiontype2 = e.target.value;
							updateState();
						}}
						className="h-10 px-1 rounded-md border border-gray-200 outline-none "
						style={{ "width": "100%" }}
					>
						<option value="1-3">Rating from 1 to 3</option>
						<option value="1-5">Rating from 1 to 5</option>
					</select>
				</div>
			</>
		);
	}

	async function DeleteLimitedAnswer(indexSect, questionid, index) {
		removeElementFromElementBYIndex(index, "LimitedQuestions", { indexSect: indexSect, indexQuestion: questionid });
		removeElementFromArrayBYID(emptydata, 0, setemptydata);
	}

	async function AddLimitedAnswer(e, item, indexSect, indexItem) {

		var AddLimitedBTN = e.currentTarget;
		AddLimitedBTN.classList.remove("hover:bg-white");
		AddLimitedBTN.classList.add("bg-gray-300");
		AddLimitedBTN.classList.add("cursor-default");
		AddLimitedBTN.disabled = true;
		subjects[indexSect].ages_ans[(indexItem)].limited.push({ answer: "" });

		removeElementFromArrayBYID(emptydata, 0, setemptydata);
		AddLimitedBTN.classList.add("hover:bg-white");
		AddLimitedBTN.classList.remove("bg-gray-300");
		AddLimitedBTN.classList.remove("cursor-default");
		AddLimitedBTN.disabled = false;
	}

	function AnswerTypeJSX({ item, indexSect, indexItem }) {
		function Allanswer({ item, indexSect }) {
			var all = [];
			subjects[indexSect].ages_ans[indexItem].limited.map((itemQuestions, index) => {
				all.push(
					<div key={index} style={{ display: "flex", width: screenSize.dynamicWidth < 800 ? "100%" : "49%", alignItems: "center", fontSize: 19, justifyContent: "space-between" }} className="mb-3">
						<span style={{ fontWeight: 700, minWidth: "fit-content" }} className="mr-2">
							Answer {index + 1}
						</span>
						<input
							onKeyUp={(e) => {
								subjects[indexSect].ages_ans[indexItem].limited[index].answer = e.target.value;
							}}
							type="text"
							defaultValue={itemQuestions.answer}
							className="border py-1 px-2"
							placeholder="Answer"
							style={{ width: "69%" }}
						/>
						<button
							onClick={(e) => {
								DeleteLimitedAnswer(indexSect, indexItem, index);
							}}
							orderid={index}
							className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center hover:bg-white"
						>
							<TrashIcon className="w-5 h-5" />
						</button>
					</div>
				);
			});

			return all;
		}
		return (
			<>
				<div className="w-full ml-0" id={`AnswerType${indexItem}`}>
					<div>
						<Allanswer item={item} indexSect={indexSect} />

						<button onClick={(e) => AddLimitedAnswer(e, item, indexSect, indexItem)} className="h-10 mb-3 rounded-md border-solid border bg-gray-100 flex py-2 px-4 items-center text-gray-700 hover:bg-white">
							<PlusSmIcon className="w-5 h-5 " />
							<p className="ml-2"> Answer</p>
						</button>
					</div>
				</div>
			</>
		);
	}

	async function isSurveyCompleted( user_id, survey_id) {
		
		let all_completed_surveys = await contract.getAllCompletedSurveysIDByUser(Number(user_id)).call();
	
		for (let i = 0; i < all_completed_surveys.length; i++) {
		  let completed_survey_element = await contract._completedsurveyMap(Number(all_completed_surveys[i])).call();
		  if (Number(completed_survey_element.trial_id) === Number(params.id) && Number(completed_survey_element.survey_id) == Number(survey_id) ) {
			return true;
		  }
		 
		}
		return false;
	}

	async function LoadDataSurvey( contributes = null) {
		if (contract !== undefined && contract !== null) {
			if (!LoadingSurvey ) {
				if (contributes == null) contributes= contributors;
				setLoadingSurvey(true);
				let survey_data = []
				setData([]);
				try {
					for (let i = 0; i < Number(await contract._SurveyIds().call()); i++) {
						let survey_element = await contract._surveyMap(i).call();

						var new_survey = {
							id: Number(survey_element.survey_id),
							trial_id: Number(survey_element.trial_id),
							user_id: Number(survey_element.user_id),
							name: survey_element.name,
							description: survey_element.description,
							date: survey_element.date,
							image: survey_element.image,
							reward: Number(survey_element.reward),
							submission: Number(survey_element?.submission),
							completed:{

							}
						};
						if (parseInt(params.id) === new_survey.trial_id) {
							for (let iC = 0; iC < contributes.length; iC++) {
								const element = contributes[iC];
								new_survey.completed[element.user_id] = await isSurveyCompleted(element.user_id,new_survey.id);
							}
							survey_data.push(new_survey);
						}
					}
				} catch (ex) { }
				setData(survey_data);
				setLoadingSurvey(false);
			}
		}
	}

	async function LoadAudiences() {
		if (contract !== undefined && contract !== null) {
			setAudiences([]);
			let allAudiences = JSON.parse(await contract._trialAudienceMap(parseInt(params.id)).call());
			setAudiences(allAudiences);
		}
	}
	async function LoadDataContributors() {
		if (contract !== undefined && contract !== null) {
			setLoadingContributors(true);
		let new_contributors = [];
		setContributors([]);

		for (let i = 0; i < Number(await contract._OngoingIds().call()); i++) {
			const element = await contract._ongoingMap(i).call();
			const user_element = await contract.getUserDetails(Number(element.user_id)).call();
			const fhir_element = await contract._fhirMap(Number(element.user_id)).call();
			if (Number(element.trial_id) === parseInt(params.id)) {
				new_contributors.push({
					id: i,
					user_id: Number(element.user_id),
					name: user_element[2],
					image: user_element[0],
					family_name: fhir_element.family_name,
					givenname: fhir_element.given_name,
					identifier: fhir_element.identifier,
					phone: fhir_element.phone,
					gender: fhir_element.gender,
					about: fhir_element.about,
					patient_id: fhir_element.patient_id,
					joined: element.date
				}
				);
			}
		}
		setContributors(new_contributors);

		setLoadingContributors(false);
		return new_contributors;
	}
	}

	async function deleteTrial() {
		await contract.delete_a_trial(Number(parseInt(params.id))).send({
			feeLimit: 1_000_000_000,
			shouldPollResponse: false
		});
		navigate("/trials", { replace: true });
	}
	async function AddAge() {
		setAgesData((prevState) => [
			...prevState,
			{

				id: Math.floor(Math.random() * Date.now()).toString(16),
				from: 0,
				to: 0,
				older: false
			}
		]);
	}
	async function removeElementFromArrayBYID(all, specificid, seting) {
		seting([]);
		var storing = [];
		for (let index = 0; index < all.length; index++) {
			const element = all[index];
			if (element.id === specificid) {
				continue;
			}
			storing.push(element);
		}

		seting(storing);

	}
	async function updateState() {
		removeElementFromArrayBYID(emptydata, 0, setemptydata);
	}

	function getAgesPlaceholder(from, to, older) {
		if (!older) {
			if (from == 0) {
				return `children upto ${to} years`
			}
			return `${from}-${to} years`
		} else {
			return `${from} years and older`
		}
	}

	async function removeElementFromElementBYIndex(specificid, type = "age", args = {}) {
		var storing = [];
		if (type === "age") {
			for (let index = 0; index < agesData.length; index++) {
				const element = agesData[index];
				if (index === specificid) {
					continue;
				}
				storing.push(element);
			}
			setAgesData(storing);
			return;
		}

		if (type === "subject") {
			for (let index = 0; index < subjects.length; index++) {
				const element = subjects[index];
				if (index === specificid) {
					continue;
				}
				storing.push(element);
			}
			setSubjects(storing);
			return;
		}
		if (type === "LimitedQuestions") {
			/*
		 args = {
			indexSect : 0,
			indexQuestion : 0
		 }
		 */
			for (let index = 0; index < subjects[args.indexSect].ages_ans[args.indexQuestion].limited.length; index++) {
				const element = subjects[args.indexSect].ages_ans[args.indexQuestion].limited[index];
				if (index === specificid) {
					continue;
				}
				storing.push(element);
			}
			subjects[args.indexSect].ages_ans[args.indexQuestion].limited = storing;
			return;
		}

	}

	async function duplicateElementFromElementBYIndex(specificid, type = "age", args = {}) {
		var storing = [];
		let found = 0;
		if (type === "age") {
			for (let index = 0; index < agesData.length; index++) {
				const element = agesData[index];
				if (index === specificid) {
					storing.push(element);
					found = 1;
				}
				var element2 = structuredClone(element);

				if (found === 1) {
					element2.id = Math.floor(Math.random() * Date.now()).toString(16);
				}
				storing.push(element2);
			}
			setAgesData(storing);
			return;
		}

		if (type === "subject") {
			for (let index = 0; index < subjects.length; index++) {
				const element = subjects[index];
				if (index === specificid) {
					storing.push(element);
					found = 1;
				}
				var element2 = structuredClone(element);

				if (found === 1) {
					element2.subject_id = -1;
					element2.subject_index_id = Math.floor(Math.random() * Date.now()).toString(16);
				}
				storing.push(element2);
			}
			setSubjects(storing);
			return;
		}

	}

	async function loadOverview() {
		let contributes = await LoadDataContributors();
		LoadDataSurvey(contributes);
	}
	useEffect(async () => {
		const setDimension = () => {
			getDimension({
				dynamicWidth: window.innerWidth,
				dynamicHeight: window.innerHeight
			});
		};

		window.addEventListener("resize", setDimension);
		LoadData();
		LoadDataSurvey();
	}, [contract]);

	useEffect(async () => {
		if (tabIndex === 0) {
			LoadDataSurvey();
		} else if (tabIndex === 1) {
			LoadDataInformed();
		} else if (tabIndex === 3) {
			LoadAudiences();
		} else if (tabIndex === 2) {
			LoadDataContributors();
		} else {
			loadOverview();
		}
	}, [tabIndex]);
	return (
		<>
			<div style={{ zoom: screenSize.dynamicWidth < 760 ? 0.8 : 1 }} className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex mb-2 items-center">
				<div onClick={() => navigate(-1)} className="flex items-center hover:cursor-pointer hover:underline decoration-gray-400">
					<p className="text-gray-400">Trials</p>
					<ChevronRightIcon className="mx-1 w-5 h-5 text-gray-400" />
				</div>
				<div className="flex items-center">
					<p className="text-gray-400">{TRIAL_DATA?.title}</p>
				</div>
			</div>
			<div className={`bg-white border border-gray-400 rounded-lg overflow-hidden mb-2`}>
				{screenSize.dynamicWidth < 760 ? (
					<>
						<div className="container-Trial-Template">
							<div className="Title-Template">
								<p className="font-semibold">{TRIAL_DATA?.title}</p>
							</div>
							<div className="description-Template">
								<p className="mt-6">{TRIAL_DATA?.description}</p>
							</div>
							<div className="Image-Box">
								<img src={TRIAL_DATA?.image} alt="Trial" style={{ width: "8rem" }} className="object-cover" />
							</div>
							<div className="Next-Button">
								<button
									onClick={() => {
										setModalShow(true);
									}}
									className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center"
								>
									<PencilIcon className="w-5 h-5 text-gray-400" />
								</button>
							</div>
						</div>
					</>
				) : (
					<>
						<div className="flex p-6">
							<img src={TRIAL_DATA?.image} alt="Trial" className="object-cover max-w-xs" />
							<div className="mx-8 flex-1">
								<p className="text-3xl font-semibold">{TRIAL_DATA?.title}</p>
								<p className="mt-6">{TRIAL_DATA?.description}</p>
							</div>
							<button
								onClick={() => {
									setModalShow(true);
								}}
								className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center"
							>
								<PencilIcon className="w-5 h-5 text-gray-400" />
							</button>
						</div>
					</>
				)}

				<div className="flex p-6 border-t border-t-gray-400 bg-gray-200">
					<div className="flex items-center">
						<UserIcon className="w-5 h-5 text-gray-500" />
						{screenSize.dynamicWidth > 760 ? (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`${TRIAL_DATA?.contributors} contributor(s)`}</p>
							</>
						) : (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`${TRIAL_DATA?.contributors}`}</p>
							</>
						)}
					</div>
					<div className="flex items-center ml-6">
						<GlobeAltIcon className="w-5 h-5 text-gray-500" />
						{screenSize.dynamicWidth > 760 ? (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`${TRIAL_DATA?.audience} audience(s)`}</p>
							</>
						) : (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`${TRIAL_DATA?.audience}`}</p>
							</>
						)}
					</div>
					<div className="flex items-center ml-6">
						<CurrencyDollarIcon className="w-5 h-5 text-gray-500" />
						{screenSize.dynamicWidth > 760 ? (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`Budget of ${TRIAL_DATA?.budget} ${TRIAL_DATA?.reward_type}`}</p>
							</>
						) : (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`${TRIAL_DATA?.budget} ${TRIAL_DATA?.reward_type}`}</p>
							</>
						)}
					</div>
				</div>
			</div>
			<div className="bg-white border border-gray-400 rounded-lg flex mt-4">
				{TABS.map(({ id, title }, index) => {
					const IS_LAST = index === TABS.length - 1;
					const ACTIVE = index === tabIndex;

					return (
						<div key={index}>
							<div className="self-stretch w-[1px] bg-gray-400" />
							<button key={id} onClick={() => setTabIndex(index)} className={`flex items-center h-14 p-4 ${ACTIVE ? "bg-gray-100" : "bg-white"}`}>
								<p className={`${ACTIVE ? "text-orange-500" : "text-black"} font-medium`}>{title}</p>
							</button>
							{IS_LAST && <div className="self-stretch w-[1px] bg-gray-400" />}
						</div>
					);
				})}
			</div>
			{tabIndex === 0 && (
				<div className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
					<div className="flex items-center">
						<h2 className="text-2xl font-semibold flex-1">Surveys</h2>
						<button onClick={addSurvey} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center">
							<PlusSmIcon className="w-5 h-5 text-white" />
							<p className="text-white ml-2">Survey</p>
						</button>
					</div>
					<table className="table-responsive-xl">
						<thead className="border-b border-b-gray-400">
							<tr>
								{TABLE_COLS.map(({ id, title }) => {
									return (
										<th key={id} className="text-left font-normal py-3 px-3">
											{title}
										</th>
									);
								})}
								<th className="py-3 px-3" />
							</tr>
						</thead>
						<tbody>
							{data.length !== 0 ? (
								<>
									{data.map(({ id, name, description, reward, submission, date, image }, index) => {
										const IS_LAST = index === data.length - 1;
										return (
											<tr key={id} className={`border-b-gray-400 ${!IS_LAST ? "border-b" : "border-0"}`}>
												<td className="py-3 px-3">
													<div style={{ display: "flex", alignItems: "center", flexDirection: "column", zoom: "0.8", minWidth: "9rem" }}>
														<img src={image} style={{ width: 50, height: 50, borderRadius: 5 }} />
														<span style={{ paddingLeft: 15 }}>{name.slice(0, 15)}</span>
													</div>
												</td>
												<td className="py-3 px-3" style={{ minWidth: "20rem" }}>
													{description.slice(0, 100)}...
												</td>
												<td className="py-3 px-3" style={{ minWidth: "8rem" }}>{`${reward} ${TRIAL_DATA?.reward_type}`}</td>
												<td className="py-3 px-3">{`${Number(submission)}/24`}</td>
												<td className="py-3 px-3">{date && !isNaN(new Date(date).getTime()) ? formatDistance(new Date(date), new Date(), { addSuffix: true }) : "-"}</td>
												<td className="flex justify-end py-3">
													<button
														onClick={() => navigate(`/trials/${TRIAL_DATA.id}/survey/${id}`, { state: { trialID: TRIAL_DATA.id } })}
														className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center hover:bg-white"
													>
														<ArrowRightIcon className="w-5 h-5 text-gray-400 " />
													</button>
												</td>
											</tr>
										);
									})}
								</>
							) : screenSize.dynamicWidth > 760 ? (
								LoadingSurvey === true ? (
									<tr>
										<td colSpan={6}>
											<p className="alert alert-info font-semibold text-3xl text-center">Loading...</p>
										</td>
									</tr>
								) : (
									<tr>
										<td colSpan={6}>
											<p className="alert alert-info font-semibold text-3xl text-center">No Surveys</p>
										</td>
									</tr>
								)
							) : (
								<></>
							)}
						</tbody>
					</table>
					{screenSize.dynamicWidth < 760 && data.length === 0 ? LoadingSurvey === true ? <p className="alert-info font-semibold text-center">Loading...</p> : <p className="alert-info font-semibold text-center">No Surveys</p> : <></>}
				</div>
			)}
			{tabIndex === 1 && (
				<>
					<div className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
						<div className="flex items-center">
							<h2 className="text-2xl font-semibold flex-1">Informed Consent</h2>
						</div>
					</div>
					<div className="bg-white border border-gray-400 rounded-lg flex flex-col mt-4">
						<div className="bg-gray-100 py-4 px-6 border-b border-b-gray-400">
							<h1 className="text-lg mb-2 font-semibold flex-1">Ages Groups</h1>
							<div className="">
								<>
									{agesData.map(({ id, from, to, older }, index) => {
										return (
											<div className="flex mb-2 gap-5 items-center" key={id}>
												<div className="flex items-center w-full">
													<div className="flex gap-5 align-items-center" >
														From
														<input
															type="number"
															className="border py-1 px-2 w-75"
															onInput={(e) => { agesData[index].from = Number(e.target.value); updateState(); }}
															defaultValue={from}
															min={0}
														/>
													</div>
													<div className={`flex gap-5 align-items-center ${agesData[index].older ? "d-none" : ""}`}>
														To
														<input
															type="number"
															onInput={(e) => { agesData[index].to = Number(e.target.value); updateState(); }}
															className="border py-1 px-2 w-75"
															defaultValue={to}
															min={0}
														/>
													</div>
													<div className="flex gap-2">
														<input type="checkbox" onChange={(e) => { agesData[index].older = e.target.checked; updateState(); }} checked={agesData[index].older} /> Older
													</div>
												</div>
												<div className="flex">
													<button
														id={`Trash`}
														onClick={() => { removeElementFromElementBYIndex(index, "age") }}
														className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center hover:bg-white"
													>
														<TrashIcon className="w-5 h-5 text-gray-400" />
													</button>
													<button onClick={() => { duplicateElementFromElementBYIndex(index, "age") }} className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center ml-1 hover:bg-white">
														<DocumentDuplicateIcon className="w-5 h-5 text-gray-400" />
													</button>
												</div>
											</div>
										);
									})}
								</>
							</div>
						</div>

						<div className="p-4 gap-2 d-flex">
							<button onClick={() => { AddAge() }} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center">
								<PlusSmIcon className="w-5 h-5 text-white" />
							</button>
							<button id="AgeSave" onClick={(e) => { UpdateAges(e) }} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-700 hover:text-gray-500">
								Save
							</button>

						</div>
					</div>


					<div className="bg-white border border-gray-400 rounded-lg flex flex-col mt-4">
						<div className="bg-gray-100 py-4 px-6 border-b border-b-gray-400">

							<div className="">

								<div className="mb-2 flex gap-5">
									<h1 className="text-lg mb-2 font-semibold flex-1">Title of the study</h1>

								</div>
								<>
									{agesData.map(({ id, from, to, older }, index) => {
										return (

											<div className="flex mb-2 gap-5 items-center" key={id}>
												<div className="flex items-center w-full">
													<textarea
														className="border py-1 px-2 w-full"
														placeholder={getAgesPlaceholder(from, to, older)}
														onChange={(e) => {
															studyTitle.ages_ans[id] = e.target.value;
															removeElementFromArrayBYID(emptydata, 0, setemptydata);
														}}
														value={(studyTitle?.ages_ans[id] != null ? studyTitle?.ages_ans[id] : "")}
													></textarea>
												</div>

											</div>
										);
									})}
								</>

							</div>
						</div>

						<div className="p-4 gap-2 d-flex">

							<button onClick={() => { UpdateStudyTitle() }} id="StudyTitleSave" className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-700 hover:text-gray-500">
								Save
							</button>

						</div>
					</div>


					{subjects.map(({ subject_id, subject_index_id, title, orderby, ages_ans }, idx) => {
						return <div key={subject_index_id} className="bg-white border border-gray-400 rounded-lg flex flex-col mt-4">
							<div className="bg-gray-100 py-4 px-6 border-b border-b-gray-400">

								<div className="">

									<div className="mb-2 flex gap-5">
										<input
											className="border py-1 px-2 w-full"

											placeholder="Subject"
											value={title}
											onChange={(e) => {
												subjects[idx].title = e.target.value;
												removeElementFromArrayBYID(emptydata, 0, setemptydata);
											}}
										/>
										<div className="flex">
											<button
												id={`Trash`}
												onClick={() => {
													removeElementFromElementBYIndex(idx, "subject")
												}}
												className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center hover:bg-white"
											>
												<TrashIcon className="w-5 h-5 text-gray-400" />
											</button>
											<button onClick={(e) => {
												duplicateElementFromElementBYIndex(idx, "subject")
											}} className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center ml-1 hover:bg-white">
												<DocumentDuplicateIcon className="w-5 h-5 text-gray-400" />
											</button>
										</div>
									</div>
									<>
										{agesData.map(({ id, from, to, older }, index) => {
											return (

												<div className="border flex flex-wrap gap-2 mb-3 mt-3 p-3 position-relative" key={id}>
													<div className="d-flex w-full">
														<div className="w-75">
															<input
																className="border py-1 px-2 w-full"
																onChange={(e) => {
																	subjects[idx].ages_ans[id].urlText = e.target.value;
																	removeElementFromArrayBYID(emptydata, 0, setemptydata);
																}}
																value={subjects[idx].ages_ans[id].urlText}
																placeholder="Image or Video url"
															/>
														</div>
														<div className="align-items-center d-flex gap-5 ml-2">
															<div>
																<input type="radio" value="none"
																	onChange={(e) => {
																		subjects[idx].ages_ans[id].urlType = e.target.value;
																		removeElementFromArrayBYID(emptydata, 0, setemptydata);
																	}}
																	name={"urlType" + idx + id} checked={subjects[idx].ages_ans[id].urlType == "none"} /> None
															</div>
															<div>
																<input type="radio" value="image"
																	onChange={(e) => {
																		subjects[idx].ages_ans[id].urlType = e.target.value;
																		removeElementFromArrayBYID(emptydata, 0, setemptydata);
																	}}
																	name={"urlType" + idx + id} checked={subjects[idx].ages_ans[id].urlType == "image"} /> Image
															</div>
															<div>
																<input type="radio" value="video"
																	onChange={(e) => {
																		subjects[idx].ages_ans[id].urlType = e.target.value;
																		removeElementFromArrayBYID(emptydata, 0, setemptydata);
																	}}
																	name={"urlType" + idx + id} checked={subjects[idx].ages_ans[id].urlType == "video"} /> Video
															</div>
														</div>
													</div>




													<div style={{ top: '-14px' }} className="bg-gray-100 position-absolute text-gray-400">{getAgesPlaceholder(from, to, older)}</div>
													<div className="flex items-center w-75">
														<textarea
															className="border py-1 px-2 w-full"
															onChange={(e) => {
																subjects[idx].ages_ans[id].answer = e.target.value;
																removeElementFromArrayBYID(emptydata, 0, setemptydata);
															}}
															value={subjects[idx].ages_ans[id].answer}
															placeholder={getAgesPlaceholder(from, to, older)}
														> </textarea>
													</div>
													<div className="flex items-center w-56">
														<select
															onChange={(e) => {
																subjects[idx].ages_ans[id].type = e.target.value;
																removeElementFromArrayBYID(emptydata, 0, setemptydata);
															}}
															value={subjects[idx].ages_ans[id].type}
															className="h-10 px-1 rounded-md border w-full border-gray-200 outline-none "
															style={{ "fontFamily": "FontAwesome" }}
														>
															<option value="rating" className="fa-solid">
																&#xf118; Rating question
															</option>
															<option value="yes/no">&#xf058; Yes/no question</option>
															<option value="limited">&#xf0c9; Limited question</option>
															<option value="open">&#xf059; Open question</option>
															<option value="upload">&#xf093;  Image Upload</option>


														</select>

													</div>


													{subjects[idx].ages_ans[id].type === "rating" && <RatingAnswer item={subjects[idx].ages_ans[id]} indexItem={id} index={idx} />}
													{subjects[idx].ages_ans[id].type === "limited" && <AnswerTypeJSX item={subjects[idx].ages_ans[id]} indexItem={id} indexSect={idx} />}

												</div>
											);
										})}
									</>

								</div>
							</div>

							<div className="p-4 gap-2 d-flex">

								<button id="SubjectSave" onClick={(e) => { CreateOrUpdateSubject(e, idx) }} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-700 hover:text-gray-500">
									Save
								</button>

							</div>
						</div>
					})}
					<div className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
						<div className="flex items-center">
							<h2 className="text-2xl font-semibold flex-1">Subjects</h2>
							<button onClick={() => { addSubject() }} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center">
								<PlusSmIcon className="w-5 h-5 text-white" />
								<p className="text-white ml-2">Create</p>
							</button>
						</div>
					</div>
				</>
			)}


			{tabIndex === 2 && (
				<>
					<div className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
						<div className="flex items-center">
							<h2 className="text-2xl font-semibold flex-1">Contributors</h2>
						</div>
						<table className="table-responsive-xl">
							<thead className="border-b border-b-gray-400">
								<tr>
									{CONTRIBUTORs_COLS.map(({ id, title }) => {
										return (
											<th key={id} className="text-left font-normal py-3 px-3">
												{title}
											</th>
										);
									})}
								</tr>
							</thead>
							<tbody>
								{contributors.length !== 0 ? (
									<>
										{contributors.map(({ id, user_id, name, identifier, patient_id, joined }, index) => {
											const IS_LAST = index === data.length - 1;
											return (
												<tr key={id} className={`border-b-gray-400 ${!IS_LAST ? "border-b" : "border-0"}`}>
													<td key={id} className="py-3 px-3">
														<div style={{ display: "flex", alignItems: "center" }}>
															<div style={{ padding: "13px", background: "#f3f4f6", borderRadius: "4px" }}>
																<UserIcon className="w-5 h-5 text-gray-700" />
															</div>
															<span style={{ paddingLeft: 15 }}>{name}</span>
														</div>
													</td>
													<td className="py-3 px-3">{`${identifier}`}</td>
													<td className="py-3 px-3">{`${patient_id}`}</td>
													<td className="py-3 px-3">{joined ? formatDistance(new Date(joined), new Date(), { addSuffix: true }) : "-"}</td>
													<td className="py-3 px-3">
														<button
															onClick={() => {
																ShowContributors(user_id, id);
															}}
															type="button"
															className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-600"
														>
															View
														</button>
													</td>
												</tr>
											);
										})}
									</>
								) : screenSize.dynamicWidth > 760 ? (
									LoadingContributors === true ? (
										<tr>
											<td colSpan={6}>
												<p className="alert alert-info font-semibold text-3xl text-center">Loading...</p>
											</td>
										</tr>
									) : (
										<tr>
											<td colSpan={6}>
												<p className="alert alert-info font-semibold text-3xl text-center">No Contributors</p>
											</td>
										</tr>
									)
								) : (
									<></>
								)}
							</tbody>
						</table>
					</div>
				</>
			)}
			{tabIndex === 3 && (
				<>
					<Form onSubmit={UpdateRewarads} className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
						<div className="flex flex-col">
							<h2 className="text-2xl font-semibold flex-1">Reward</h2>
							<div>
								<h4>Reward per survey</h4>
								<div className="flex gap-8 items-center ">
									<select name="rewardselect" defaultValue={TRIAL_DATA?.reward_type ? TRIAL_DATA?.reward_type : ""} id="rewardselect" className="mt-1 h-10 px-2 rounded-md border border-gray-200 outline-none w-6/12">
										<option value="">Select a reward</option>
										<option value="TRX">TRX</option>
									</select>
									<label className="flex flex-col font-semibold mt-1 w-6/12">
										<input
											type="text"
											defaultValue={TRIAL_DATA?.reward_price ? `${TRIAL_DATA?.reward_price}` : "0"}
											id="rewardprice"
											name="rewardprice"
											className="mt-1 h-10 border border-gray-200 rounded-md outline-none px-2 focus:border-gray-400 "
											placeholder="0"
										/>
									</label>
								</div>
							</div>
							<div>
								<h4>Total spending limit</h4>
								<div className="flex gap-8 justify-between items-center ">
									<label style={{ width: "47%" }} className="flex flex-col font-semibold mt-1">
										<input
											type="text"
											defaultValue={TRIAL_DATA?.total_spending_limit ? `${TRIAL_DATA?.total_spending_limit}` : "0"}
											id="totalspendlimit"
											name="totalspendlimit"
											className="mt-1 h-10 border border-gray-200 rounded-md outline-none px-2 focus:border-gray-400 "
											placeholder="0"
										/>
									</label>
									<button type="submit" id="rewardsSave" className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-600">
										Save
									</button>
								</div>
							</div>
						</div>
					</Form>
					<div className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
						<div className="flex items-center">
							<h2 className="text-2xl font-semibold flex-1">Audiences</h2>
							<button onClick={() => addAudiance()} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-600">
								<PlusSmIcon className="w-5 h-5 text-white" />
								<p className="text-white ml-2">Audience</p>
							</button>
						</div>
						<table className="table-responsive-xl">
							<thead className="border-b border-b-gray-400">
								<tr>
									<th className="py-3 px-3">#</th>
									{AUDIENCES_COLS.map(({ id, title }) => {
										return (
											<th key={id} className="text-left font-normal py-3 px-3">
												{title}
											</th>
										);
									})}
									<th className="py-3 px-3" />
								</tr>
							</thead>
							<tbody>
								{audiences.map((item, index) => {
									const IS_LAST = index === audiences.length - 1;
									return (
										<tr key={index} className={`border-b-gray-400 ${!IS_LAST ? "border-b" : "border-0"}`}>
											<td className="flex py-3 px-3 items-center h-[72.5px]">{index + 1}</td>
											<td className="py-3 px-3">
												<input
													type="text"
													style={{ width: screenSize.dynamicWidth < 760 ? "7rem" : "100%" }}
													id="age-min"
													onChange={(e) => {
														audiences[index].AgeMin = e.target.value;
													}}
													name="age-min"
													defaultValue={item.AgeMin}
													className="mt-2 h-10 border border-gray-200 rounded-md outline-none px-2 focus:border-gray-400"
												/>
											</td>
											<td className="py-3 px-3">
												<input
													type="text"
													style={{ width: screenSize.dynamicWidth < 760 ? "7rem" : "100%" }}
													id="age-max"
													name="age-max"
													onChange={(e) => {
														audiences[index].AgeMax = e.target.value;
													}}
													defaultValue={item.AgeMax}
													className="mt-2 h-10 border border-gray-200 rounded-md outline-none px-2 focus:border-gray-400"
												/>
											</td>
											<td className="py-3 px-3" style={{ minWidth: "10rem" }}>
												<select
													name={`race${index}`}
													id={`race-select${index}`}
													onChange={(e) => {
														audiences[index].Race = e.target.value;
													}}
													className="h-10 px-1 rounded-md border border-gray-200 outline-none w-full"
													defaultValue={item.Race}
												>
													<option value="">Select a race</option>
													<option value="asian">Asian</option>
													<option value="asian">African America</option>
													<option value="american-indian">American Indian</option>
													<option value="black">Black</option>
													<option value="hispanic">Hispanic</option>
													<option value="native-hawaiian">Native Hawaiian</option>
													<option value="white">White</option>
													<option value="everyone">Every race</option>
												</select>
											</td>
											<td className="py-3 px-3" style={{ minWidth: "10rem" }}>
												<select
													name={`gender${index}`}
													id={`gender-select${index}`}
													onChange={(e) => {
														audiences[index].Gender = e.target.value;
													}}
													className="h-10 px-1 rounded-md border border-gray-200 outline-none w-full"
													defaultValue={item.Gender}
												>
													<option value="">Select a gender</option>
													<option value="male">Male</option>
													<option value="female">Female</option>
													<option value="everyone">Everyone</option>
												</select>
											</td>
											<td className="flex justify-end items-center h-[72.5px] py-3">
												<button
													onClick={(e) => {
														removeElementFromArray(audiences, index, setAudiences);
													}}
													className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center hover:bg-white"
												>
													<TrashIcon className="w-5 h-5 text-gray-400" />
												</button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
						<div className="flex mt-1 items-center">
							<h2 className="text-2xl font-semibold flex-1"></h2>
							<button id="audienceSave" className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-600" onClick={UpdateAudiences}>
								Save
							</button>
						</div>
					</div>
					<div className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
						<h2 className="text-2xl font-semibold mb-4">Delete</h2>
						<p>Deleting the trial will delete all surveys and the collected data. Contributors will no longer be able to take any of the surveys.</p>
						<button className="mt-4 flex self-start px-2 h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center text-gray-400 hover:bg-white hover:text-red-700" onClick={deleteTrial}>
							<TrashIcon className="w-5 h-5 mr-2" />
							Delete
						</button>
					</div>
				</>
			)}

			{tabIndex === 4 && (
				<>
							{contributors.length !== 0 ? (<>
							{contributors.map((contributorData, cIdx) => {
								return <div className={"bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4"  }>

								<div key={cIdx} className="d-flex">
									<div className="profile-pic-container">
										<div
											style={{
												background:
													'url(' + contributorData.image + ') center center'
											}}
											className="profile-pic-image"
										/>
										<span>{contributorData.name}</span>
									</div>
									{
										data.map((item, idx) => {
											return <div key={idx} className={"align-items-center d-flex each-overview-survey "+ `${item.completed[contributorData.user_id] == true?"completed":""}`}>
												<div className="hr-border" style={{ borderTop: "2.5px solid darkgray", width: "4rem" }} />
												<div className="overview-survey-img-container">
													<div
														className="overview-survey-img"
														style={{ background: 'url(' + item.image + ') center' }}

													/>
													<span className="d-flex justify-content-center overview-survey-text">
														{item.name}
													</span>
												</div>
											</div>
										})
									}
									</div>
								</div>
							})}


						</>) : screenSize.dynamicWidth > 760 ? (
							LoadingContributors === true ? (
								<div>
										<p className="alert alert-info font-semibold text-3xl text-center">Loading...</p>
								</div>
							) : (
								<div>
										<p className="alert alert-info font-semibold text-3xl text-center">No Contributors</p>
										</div>
							)
						) : (
							<></>
						)}


				</>
			)}



			<UpdateTrialModal
				show={UpdatemodalShow}
				onHide={() => {
					setModalShow(false);
					LoadData();
				}}
				id={params.id}
			/>
			<CreateSurveyModal
				show={CreateSurveymodalShow}
				onHide={() => {
					setSurveyModalShow(false);
					LoadDataSurvey();
				}}
				Tiralid={params.id}
			/>
			<ViewControbutiors
				show={ContributorsmodalShow}
				onHide={() => {
					setContributorsmodalShow(false);
				}}
				setShow={setContributorsmodalShow}
				id={Selected_ongoing_id}
			/>
		</>
	);
}

export default TrialDetails;


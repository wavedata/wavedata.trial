
export default async function handler(req, res) {
  try {
    let FixCors = await import("../../../../contract/fixCors.js");
    await FixCors.default(res);
  } catch (error) { }

  let useContract = await import("../../../../contract/useContract.ts");
  const { contract, signerAddress } = await useContract.default();
  let trial_id = await contract.GetOngoingTrial(Number(req.query.userid)).call();
  let totalTrials = await contract._TrialIds().call();

  let all_available_trials = [];
  for (let i = 0; i < Number(totalTrials); i++) {
    let trial_element = await contract._trialMap(Number(i)).call();

    //Load Ages
    let ages_Data_element = await contract._trialAges(Number(trial_element.trial_id)).call();
    let ages_groups = (ages_Data_element == "" ? [] : JSON.parse(ages_Data_element));


    //Load Study Title
    let study_title = {};
    let study_Data_element = await contract._trialTitles(Number(trial_element.trial_id)).call();
    try {
      let parsed_study = JSON.parse(study_Data_element);
      if (study_Data_element == "") {
        study_title = {};
      } else {
        study_title = parsed_study;
      }
    } catch (e) {
      study_title = {};
    }


    //Load Subjects
    let new_subjects = [];
    let total_subs = Number(await contract._SubjectIds().call());
    for (let i = 0; i < total_subs; i++) {
      const element = await contract._trialSubjects(i).call();

      if (Number(element.trial_id) === Number(trial_element.trial_id)) {
        new_subjects.push({
          subject_id: Number(element.subject_id),
          trial_id: Number(element.trial_id),
          subject_index_id: element.subject_index_id,
          "title": element.title,
          ages_ans: JSON.parse(element.ages_ans),
        })

      }
    }



    var newTrial = {
      id: Number(trial_element.trial_id),
      title: trial_element.title,
      image: trial_element.image,
      description: trial_element.description,
      contributors: Number(trial_element.contributors),
      audience: Number(trial_element.audience),
      budget: Number(trial_element.budget),
      permissions: (trial_element.permission),
      study_title: study_title,
      subjects: new_subjects,
      ages_groups: ages_groups
    };
    if (trial_id !== "False") {
      if (Number(trial_id) !== newTrial.id)
        all_available_trials.push(newTrial);
    } else {
      all_available_trials.push(newTrial);
    }
  }
  res.status(200).json({ status: 200, value: JSON.stringify(all_available_trials) })
  return;

}

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:jiffy/jiffy.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:wavedata/model/trial.dart';
import 'package:wavedata/model/trial_action.dart';
import 'package:wavedata/providers/navbar_provider.dart';
import 'package:wavedata/screens/auth_screen.dart';
import 'package:wavedata/screens/feeling_screen.dart';
import 'package:wavedata/screens/informedconsent_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  initState() {
    super.initState();
    GetAccountData();
  }

  var POSTheader = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded"
  };

  var FHIRheader = {
    "accept": "application/fhir+json",
    "x-api-key": "Qi8TXQVe1C2zxiYOdKKm7RQk6qz0h7n19zu1RMg5"
  };

  int userid = 0;
  int startTrial = 0;
  String ImageLink = "https://i.postimg.cc/SsxGw5cZ/person.jpg";
  var userDetails = {
    "userid": -1,
    "credits": 0,
    "ongoingcredit": null,
    "totalongoingcredit": null
  };
  var refreshkey = GlobalKey<RefreshIndicatorState>();
  bool boolWearables = false;
  bool boolGender = false;
  bool boolBirthDate = false;
  bool boolNameGiven = false;
  bool boolNameFamily = false;
  bool boolPhone = false;
  bool boolAbout = false;
  String wrappedData = "";

  Future<void> GetAvialbleData() async {
    avilableTrials = [];
    var url = Uri.parse(
        'https://wavedatatrial-api.netlify.app/api/GET/Trial/GetAvailableTrial?userid=${userid}');
    var correctStatus = false;
    var response = null;
    while (correctStatus == false) {
      final response_draft = await http.get(url);
      if (response_draft.statusCode == 200) {
        correctStatus = true;
        response = response_draft;
      } else {
        await Future.delayed(Duration(seconds: 2));
      }
    }

    var responseData = json.decode(response.body);

    var data = (responseData['value']);
    var allTrials = json.decode(data);
    allTrials.forEach((element) => {
          setState(() {
            avilableTrials.add(Trial(
                id: element['id'],
                title: element['title'],
                image: element['image'],
                permission: element['permissions']));
          })
        });
  }

  Future<void> GetOngoingData() async {
    ongoingTrials = {
      "trialid": -1,
      "title": "",
      "description": "",
      "image": "",
      "startSurvey": 0,
      "totalprice": 0
    };
    dummyActions = [];
    var url = Uri.parse(
        'https://wavedatatrial-api.netlify.app/api/GET/Trial/GetOngoingTrial?userid=${userid}');
    var correctStatus = false;
    var response = null;
    while (correctStatus == false) {
      final response_draft = await http.get(url);
      var responseData = json.decode(response_draft.body);

      var data = (responseData['value']);

      if (response_draft.statusCode == 200) {
        correctStatus = true;
        response = response_draft;
      } else if (data == "None") {
        break;
      } else {
        await Future.delayed(Duration(seconds: 2));
      }
    }
    var responseData = json.decode(response.body);

    var data = (responseData['value']);

    if (data != "None") {
      setState(() {
        isOngoingTrial = true;
      });
      var decoded_data = json.decode(data);
      try {
        //Trials
        var element = decoded_data['Trial'];
        setState(() {
          ongoingTrials['trialid'] = element['id'];
          ongoingTrials['title'] = element['title'];
          ongoingTrials['image'] = element['image'];
          ongoingTrials['description'] = element['description'];
          ongoingTrials['totalprice'] = element['budget'];
          userDetails['totalongoingcredit'] =
              element['budget'] != null ? element['budget'] : 0;
        });
      } catch (e) {}

      setState(() {
        //Surveys
        var SurveyAllElement = decoded_data['Survey'];
        var SurveyAllCompletedElement = decoded_data['Completed'];
        int totalcredit = 0;
        bool first_today = false;


        //Informed Consent
        setState(() {
          if (decoded_data['CompletedInformed'] != "False" && decoded_data['CompletedInformed'] != null ) {
            String timeToday =
                Jiffy(DateTime.parse(decoded_data['CompletedInformed']['date']))
                    .fromNow();
            onGoingInformedConsent = TrialAction(
                id: "informed_consent",
                when: timeToday,
                content: "Informed Consent",
                isDone: true);
          }
        });

        //Other ongoing surveys
        for (var i = 0; i < SurveyAllElement.length; i++) {
          var SurveyElement = SurveyAllElement[i];
          var completedSurvey = SurveyAllCompletedElement.where(
              (e) => e['survey_id'] == SurveyElement['id']);
          String timeToday = "Today";

          if (completedSurvey.length > 0) {
            var completedData = completedSurvey.toList()[0];
            String completedDate = completedData['date'];
            timeToday =
                Jiffy(DateTime.parse(completedDate)).fromNow(); // a year ago
            totalcredit += int.parse(SurveyElement['reward'].toString());
          }
          bool status = completedSurvey.length > 0;

          if (!status) {
            timeToday = "Tomorrow";
            if (!first_today) {
              timeToday = "Today";
              first_today = true;
            }
          }
          dummyActions.add(
            TrialAction(
                id: SurveyElement['id'].toString(),
                when: timeToday,
                content: SurveyElement['name'],
                isDone: status),
          );
        }
        userDetails['ongoingcredit'] = totalcredit;
      });
    }
  }

  Future<void> GetUserData(int userid) async {
    var url = Uri.parse(
        'https://wavedatatrial-api.netlify.app/api/GET/getUserDetails?userid=${userid}');
    var correctStatus = false;
    var response = null;
    while (correctStatus == false) {
      final response_draft = await http.get(url);
      if (response_draft.statusCode == 200) {
        correctStatus = true;
        response = response_draft;
      } else {
        await Future.delayed(Duration(seconds: 2));
      }
    }
    var responseData = json.decode(response.body);

    var dataUD = (responseData['value']);

    setState(() {
      var imageData = dataUD['image'];
      ImageLink = imageData;
    });
  }

  Future<void> GetAccountData() async {
    // Obtain shared preferences.
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      userid = int.parse(prefs.getString("userid").toString());
    });

    GetAvialbleData();
    GetOngoingData();
    GetUserData(userid);
  }

  //FHIR switches
  bool FamilyNameSwitch = false;
  bool GivenNameSwitch = false;
  bool GenderSwitch = false;
  bool PhoneSwitch = false;
  bool AboutSwitch = false;
  //Wearable switches
  bool BloodSwitch = false;
  bool SleepSwitch = false;
  bool StepsSwitch = false;
  bool CaloriesSwitch = false;

  var dummyActions = [];
  var ongoingTrials = {
    "trialid": -1,
    "title": "",
    "description": "",
    "image": "",
    "startSurvey": 0
  };
  var onGoingInformedConsent = TrialAction(
      id: "informed_consent",
      when: "Today",
      content: "Informed Consent",
      isDone: false);
  bool isOngoingTrial = false;

  var avilableTrials = [];

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;
    var navbarViewmodel = ref.watch(navbarProvider);
    Future<void> Logout() async {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove("userid");
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => AuthScreen(),
        ),
      );
    }

    //FHIR switches
    bool? FamilyNameSwitch;
    bool? GivenNameSwitch;
    bool? GenderSwitch;
    bool? PhoneSwitch;
    bool? AboutSwitch;
    //Wearable switches
    bool? BloodSwitch;
    bool? SleepSwitch;
    bool? StepsSwitch;
    bool? CaloriesSwitch;

    bool SetSwitches(int type, bool value, {int fhirtype = 0}) {
      if (fhirtype == 0) {
        setState(() {
          if (type == 0) {
            FamilyNameSwitch = value;
          }
          ;
          if (type == 1) {
            GivenNameSwitch = value;
          }
          ;
          if (type == 2) {
            GenderSwitch = value;
          }
          if (type == 3) {
            PhoneSwitch = value;
          }
          if (type == 4) {
            AboutSwitch = value;
          }
        });
      } else {
        if (type == 0) {
          BloodSwitch = value;
        }
        if (type == 1) {
          SleepSwitch = value;
        }
        if (type == 2) {
          StepsSwitch = value;
        }
        if (type == 3) {
          CaloriesSwitch = value;
        }
      }

      return value;
    }

    Future<void> StartTrial(int trialid) async {
      final prefs = await SharedPreferences.getInstance();
      int userid = int.parse(prefs.getString("userid").toString());

      var given_permission = {
        "family": FamilyNameSwitch,
        "given": GivenNameSwitch,
        "gender": GenderSwitch,
        "phone": PhoneSwitch,
        "about": AboutSwitch,
        "blood": BloodSwitch,
        "sleep": SleepSwitch,
        "steps": StepsSwitch,
        "calories": CaloriesSwitch
      };

      String JsonMadePermission = given_permission.toString();

      var url = Uri.parse(
          'https://wavedatatrial-api.netlify.app/api/POST/Trial/CreateOngoingTrail');
      await http.post(url, headers: POSTheader, body: {
        'trialid': trialid.toString(),
        'userid': userid.toString(),
        'given_permission': JsonMadePermission
      });
      await Future.delayed(Duration(seconds: 2));
      Navigator.pop(context);
    }

    Future<void> WithdrawAmount(Amount) async {
      final prefs = await SharedPreferences.getInstance();
      int userid = int.parse(prefs.getString("userid").toString());

      var url = Uri.parse(
          'https://wavedatatrial-api.netlify.app/api/POST/Trial/Survey/WithdrawAmount');
      await http.post(url,
          headers: POSTheader,
          body: {'userid': userid.toString(), 'amount': Amount});
      await GetAccountData();
      Navigator.pop(context);
    }

    Future<void> startFunction(int trialid, String permissions) async {
      final prefs = await SharedPreferences.getInstance();
      // prefs.setString("trialid", trialid.toString());
      // prefs.setString("trial_permissions", permissions.toString());

      // await Navigator.push(
      //   context,
      //   MaterialPageRoute(
      //     builder: (context) => const InformedConsentScreen(),
      //   ),
      // );
      // await GetAccountData();

      await showDialog(
          context: context,
          builder: (context) =>
              OngoingDialog(trialid, permissions, SetSwitches, StartTrial));
    }

    return //home
        Container(
      height: size.height,
      width: size.width,
      decoration: BoxDecoration(
        image: DecorationImage(
          fit: BoxFit.cover,
          image: Image.asset("assets/images/bg.png").image,
        ),
      ),
      child: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              margin: EdgeInsets.only(top: 24, left: 16, right: 16),
              child: Material(
                elevation: 5,
                borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(100),
                    bottomLeft: Radius.circular(100),
                    topRight: Radius.circular(12),
                    bottomRight: Radius.circular(12)),
                child: Container(
                  height: 150,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Material(
                          elevation: 8,
                          color: Colors.amber,
                          borderRadius: BorderRadius.circular(128),
                          clipBehavior: Clip.none,
                          child: Container(
                              height: 148,
                              width: 148,
                              padding: EdgeInsets.all(12),
                              clipBehavior: Clip.antiAlias,
                              decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(200.0),
                                  color: Colors.white),
                              child: Stack(
                                children: [
                                  Container(
                                    child: Image.network(
                                      ImageLink,
                                      fit: BoxFit.fitWidth,
                                    ),
                                  ),
                                  Positioned(
                                    bottom: 5,
                                    right: 5,
                                    child: GestureDetector(
                                        onTap: () {
                                          var viewmodel =
                                              ref.watch(navbarProvider);
                                          viewmodel.updateIndex(2);
                                        },
                                        child: Container(
                                          height: 40,
                                          width: 40,
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            border: Border.all(
                                              width: 4,
                                              color: Color(0xFFF06129),
                                            ),
                                            color: Colors.white,
                                          ),
                                          child: const Icon(
                                            Icons.edit,
                                            color: Color(0xFFF06129),
                                          ),
                                        )),
                                  )
                                ],
                              ))),
                      Container(
                        margin: EdgeInsets.only(right: 20),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            AspectRatio(
                              aspectRatio: 2 / 4,
                              child: Container(
                                  margin: const EdgeInsets.only(
                                      top: 20, bottom: 20),
                                  padding: EdgeInsets.only(bottom: 24),
                                  decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                          color: Colors.grey.withOpacity(0.3),
                                          width: 1.5),
                                      color: Color(0xFFD1D5DB)),
                                  child:
                                      Image.asset("assets/images/ribbon.png")),
                            ),
                            const SizedBox(
                              width: 16,
                            ),
                            AspectRatio(
                              aspectRatio: 2 / 4,
                              child: Container(
                                  margin: const EdgeInsets.only(
                                      top: 20, bottom: 20),
                                  padding: EdgeInsets.only(bottom: 24),
                                  decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                          color: Colors.grey.withOpacity(0.3),
                                          width: 1.5),
                                      color: Color(0xFFD1D5DB)),
                                  child: Image.asset("assets/images/gift.png")),
                            ),
                          ],
                        ),
                      )
                    ],
                  ),
                ),
              ),
            ),
            Container(
                margin: const EdgeInsets.only(top: 12, left: 16, bottom: 4),
                child: Row(
                  children: [
                    Text("Studies I participated in",
                        style: GoogleFonts.getFont('Lexend Deca',
                            color: Color(0xFF08323A),
                            fontSize: 15,
                            fontWeight: FontWeight.w600)),
                  ],
                )),
            Container(
              margin: EdgeInsets.only(left: 16, right: 16),
              child: Material(
                borderRadius: BorderRadius.circular(12),
                child: Stack(children: [
                  RefreshIndicator(
                      onRefresh: () {
                        return Future<void>(() async {
                          GetOngoingData();
                          await GetAvialbleData();
                        });
                      },
                      child: Stack(children: [
                        Container(
                          height: 240,
                          width: size.width,
                          child: isOngoingTrial == true
                              ? ClipRRect(
                                  child: RefreshIndicator(
                                    onRefresh: GetOngoingData,
                                    child: Wrap(
                                      children: [
                                        Container(
                                          margin: const EdgeInsets.only(
                                              left: 16, top: 8, bottom: 8),
                                          child: Text(
                                              ongoingTrials['title'].toString(),
                                              style: GoogleFonts.getFont(
                                                  'Lexend Deca',
                                                  color: Color(0xFFF06129),
                                                  fontWeight: FontWeight.bold)),
                                        ),
                                        Image.network(
                                            ongoingTrials['image'].toString(),
                                            width: size.width,
                                            fit: BoxFit.cover)
                                      ],
                                    ),
                                  ),
                                )
                              : const Center(
                                  child: Text("No Participated Studies")),
                        ),
                        Positioned(
                            bottom: 5,
                            child: isOngoingTrial == true
                                ? Container(
                                    width: size.width - 20,
                                    height: 150,
                                    child: ListView.builder(
                                      itemCount: dummyActions.length + 1,
                                      padding: EdgeInsets.only(left: 8),
                                      scrollDirection: Axis.horizontal,
                                      itemBuilder: ((context, index) => index ==
                                              0
                                          ? ActionTile(
                                              action: onGoingInformedConsent,
                                              startFunction: () async {
                                                final prefs =
                                                    await SharedPreferences
                                                        .getInstance();
                                                prefs.setString(
                                                    "trialid",
                                                    ongoingTrials["trialid"]
                                                        .toString());
                                                await Navigator.push(
                                                  context,
                                                  MaterialPageRoute(
                                                    builder: (context) =>
                                                        InformedConsentScreen(),
                                                  ),
                                                );
                                                GetAccountData();
                                              })
                                          : ActionTile(
                                              action: dummyActions[index - 1],
                                              startFunction: () async {
                                                await Navigator.push(
                                                  context,
                                                  MaterialPageRoute(
                                                    builder: (context) =>
                                                        FeelingScreen(),
                                                  ),
                                                );
                                                GetAccountData();
                                              },
                                            )),
                                    ),
                                  )
                                : Text(""))
                      ])),
                ]),
              ),
            ),
            Container(
                margin: EdgeInsets.only(top: 25, left: 16, bottom: 4),
                child: Row(
                  children: [
                    Text("Studies I can also participate in",
                        style: GoogleFonts.getFont('Lexend Deca',
                            color: Color(0xFF08323A),
                            fontSize: 15,
                            fontWeight: FontWeight.w600)),
                  ],
                )),
            Container(
              width: size.width,
              height: 220,
              child: RefreshIndicator(
                  key: refreshkey,
                  child: ListView.builder(
                    itemCount: avilableTrials.length,
                    padding: EdgeInsets.only(left: 16),
                    scrollDirection: Axis.horizontal,
                    itemBuilder: ((context, index) {
                      var trial = avilableTrials[index];
                      return Container(
                        //padding: EdgeInsets.all(14),
                        margin: EdgeInsets.only(right: 12),
                        decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.white, width: 1),
                            color: Colors.white),
                        width: 200,
                        clipBehavior: Clip.hardEdge,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            GestureDetector(
                              onTap: (() async {
                                await startFunction(trial.id, trial.permission);
                                GetAccountData();
                              }),
                              behavior: HitTestBehavior.opaque,
                              child: Container(
                                child: Column(
                                  children: [
                                    ClipRRect(
                                      borderRadius: const BorderRadius.only(
                                          topLeft: Radius.circular(12),
                                          topRight: Radius.circular(12)),
                                      child: Container(
                                        height: 140,
                                        child: Image.network(
                                          trial.image,
                                          width: 250,
                                          fit: BoxFit.fitWidth,
                                        ),
                                      ),
                                    ),
                                    Container(
                                      alignment: Alignment.bottomLeft,
                                      padding:
                                          EdgeInsets.only(left: 10, top: 10),
                                      child: Text(trial.title,
                                          style: GoogleFonts.getFont(
                                              'Lexend Deca',
                                              color: Color(0xFFF06129),
                                              fontSize: 16,
                                              fontWeight: FontWeight.w400)),
                                    ),
                                  ],
                                ),
                              ),
                            )
                          ],
                        ),
                      );
                    }),
                  ),
                  onRefresh: () {
                    return Future<void>(() async {
                      GetOngoingData();
                      await GetAvialbleData();
                    });
                  }),
            )
          ],
        ),
      ),
    );
  }
}

class ActionTile extends StatelessWidget {
  final VoidCallback startFunction;

  final TrialAction action;

  const ActionTile({
    Key? key,
    required this.startFunction,
    required this.action,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      margin: const EdgeInsets.only(right: 12, bottom: 2),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white, width: 1),
        color: action.isDone ? Color(0xFF6B7280) : Color(0xFFFEE4CA),
      ),
      width: 120,
      child: action.isDone
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(action.when.toUpperCase(),
                    style: GoogleFonts.getFont('Lexend Deca',
                        color: Colors.white,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700)),
                const SizedBox(
                  height: 12,
                ),
                Text(action.content,
                    style: GoogleFonts.getFont('Lexend Deca',
                        color: Colors.white,
                        fontSize: 12.8,
                        fontWeight: FontWeight.w400)),
                const SizedBox(
                  height: 12,
                ),
                Container(
                  height: 40,
                  child: Center(
                      child: Row(
                    children: [
                      Image.asset("assets/images/done.png"),
                      const SizedBox(
                        width: 4,
                      ),
                      Text("Completed",
                          style: GoogleFonts.getFont('Lexend Deca',
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold))
                    ],
                  )),
                ),
              ],
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(action.when.toUpperCase(),
                    style: GoogleFonts.getFont('Lexend Deca',
                        color: Color(0xFFF06129),
                        fontSize: 14,
                        fontWeight: FontWeight.w700)),
                const SizedBox(
                  height: 8,
                ),
                Container(
                  height: 50,
                  child: Text(action.content,
                      style: GoogleFonts.getFont('Lexend Deca',
                          color: Color(0xFF08323A),
                          fontSize: 12.8,
                          fontWeight: FontWeight.w400)),
                ),
                GestureDetector(
                    onTap: () async {
                      final prefs = await SharedPreferences.getInstance();
                      prefs.setString("surveyid", action.id);
                      startFunction();
                    },
                    behavior: HitTestBehavior.opaque,
                    child: Container(
                      child: Container(
                        height: 40,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(6),
                          color: Color(0xFFF06129),
                        ),
                        child: Center(
                          child: Text("Start",
                              style: GoogleFonts.getFont('Lexend Deca',
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500)),
                        ),
                      ),
                    )),
              ],
            ),
    );
  }
}

class OngoingDialog extends StatefulWidget {
  int trialid;
  final String permissions;
  final Function StartTrial;
  final Function SetSwitches;

  OngoingDialog(
      this.trialid, this.permissions, this.SetSwitches, this.StartTrial);

  @override
  _OngoingDialogState createState() => _OngoingDialogState();
}

class _OngoingDialogState extends State<OngoingDialog> {
  //FHIR switches
  bool FamilyNameSwitch = false;
  bool GivenNameSwitch = false;
  bool GenderSwitch = false;
  bool PhoneSwitch = false;
  bool AboutSwitch = false;
  //Wearable switches
  bool BloodSwitch = false;
  bool SleepSwitch = false;
  bool StepsSwitch = false;
  bool CaloriesSwitch = false;

  bool GetPermission(String type) {
    return jsonDecode(widget.permissions)[type];
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text("Do you want to start the trial?"),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Align(
            alignment: AlignmentDirectional(-0.95, 0),
            child: Text(
              'FHIR',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          Padding(
            padding: EdgeInsetsDirectional.fromSTEB(8, 8, 8, 8),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                GetPermission('family')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: FamilyNameSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  FamilyNameSwitch =
                                      widget.SetSwitches(0, newValue)
                                });
                          },
                          title: Text(
                            'Family Name',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
                GetPermission('given')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: GivenNameSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  GivenNameSwitch =
                                      widget.SetSwitches(1, newValue)
                                });
                          },
                          title: Text(
                            'Given Name',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
                GetPermission('phone')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: PhoneSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  PhoneSwitch = widget.SetSwitches(2, newValue)
                                });
                          },
                          title: Text(
                            'Phone',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
                GetPermission('gender')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: GenderSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  GenderSwitch = widget.SetSwitches(3, newValue)
                                });
                          },
                          title: Text(
                            'Gender',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
                GetPermission('about')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: AboutSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  AboutSwitch = widget.SetSwitches(4, newValue)
                                });
                          },
                          title: Text(
                            'About',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
              ],
            ),
          ),
          Align(
            alignment: AlignmentDirectional(-0.95, 0),
            child: Text(
              'WEARABLES',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          Padding(
            padding: EdgeInsetsDirectional.fromSTEB(8, 8, 8, 8),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                GetPermission('blood')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: BloodSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  BloodSwitch = widget.SetSwitches(0, newValue,
                                      fhirtype: 1)
                                });
                          },
                          title: Text(
                            'Blood Rate Data',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
                GetPermission('sleep')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: SleepSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  SleepSwitch = widget.SetSwitches(1, newValue,
                                      fhirtype: 1)
                                });
                          },
                          title: Text(
                            'Sleep Data',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
                GetPermission('steps')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: StepsSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  StepsSwitch = widget.SetSwitches(2, newValue,
                                      fhirtype: 1)
                                });
                          },
                          title: Text(
                            'Steps Data',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
                GetPermission('calories')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: CaloriesSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  CaloriesSwitch = widget.SetSwitches(
                                      3, newValue,
                                      fhirtype: 1)
                                });
                          },
                          title: Text(
                            'Calories Burned Data',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
            onPressed: (() async {
              await widget.StartTrial(widget.trialid);
            }),
            child: Text("Accept"))
      ],
    );
  }
}

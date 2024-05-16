import 'dart:convert';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:myowndata/model/informed_consent/ages.dart';
import 'package:flutter_html/flutter_html.dart';

import 'package:myowndata/model/informed_consent/subject.dart';
import 'package:myowndata/components/bottom_navbar.dart';
import 'package:myowndata/providers/navbar_provider.dart';
import 'package:myowndata/providers/questionnaire_provider.dart';
import 'package:myowndata/screens/journal_screen.dart';
import 'package:myowndata/screens/tabscreens/home_screen.dart';
import 'package:myowndata/screens/tabscreens/journey_screen.dart';
import 'package:myowndata/screens/tabscreens/mydata_screen.dart';
import 'package:myowndata/screens/tabscreens/credit_screen.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';

class InformedConsentScreen extends ConsumerStatefulWidget {
  const InformedConsentScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<InformedConsentScreen> createState() =>
      _InformedConsentScreenState();
}

class _InformedConsentScreenState extends ConsumerState<InformedConsentScreen> {
  var POSTheader = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded"
  };
  var ages_groups = [];
  var study_title = "";
  List<Subject> subjects = [];
  String trial_id = "-1";

  bool isloading = true;

  void UpdateLoading(bool status) {
    isloading = status;
  }

  Future<void> GetData() async {
    final prefs = await SharedPreferences.getInstance();
    String trialid = prefs.getString("trialid").toString();
    String userid = prefs.getString("userid").toString();

    ages_groups = [];
    subjects = [];

    var url = Uri.parse(
        'https://myowndata-tron-s5-api.netlify.app/api/GET/Trial/GetInformedConsent?trial_id=${trialid}&user_id=${userid}');
    final response = await http.get(url);
    var responseData = jsonDecode(response.body);
    var value = jsonDecode(responseData['value']);

    List<Ages> dataAge = (value["eligible_age_group"] as List).map((e) {
      return Ages.fromMap((e as Map<String, dynamic>));
    }).toList();

    List<Subject> dataSubjects = (value["subjects"] as List).map((e) {
      return Subject.fromMap((e as Map<String, dynamic>));
    }).toList();
    var studytitle = (value['study_title'].toString());

    setState(() {
      ages_groups = dataAge;
      subjects = dataSubjects;
      study_title = studytitle;
      isloading = false;
      trial_id = trialid;
    });
    print("Done!");
  }


  Future<void> FinishIC() async {
    setState(() {
      isloading = true;
    });
    final prefs = await SharedPreferences.getInstance();
    int userid = int.parse(prefs.getString("userid").toString());
    int trialid = int.parse(trial_id);

    var url = Uri.parse(
        'https://myowndata-tron-s5-api.netlify.app/api/POST/Trial/CreateCompletedInformedConsent');
    await http.post(url, headers: POSTheader, body: {
      'userid': userid.toString(),
      'date': DateTime.now().toIso8601String(),
      'trialid': trialid.toString()
    });

    Future.delayed(const Duration(milliseconds: 1500), () async {
      Navigator.of(context).pop();
    });
    setState(() {
      isloading = false;
    });
  }


  @override
  initState() {
    GetData();
    super.initState();
  }

  var initialized = false;

  @override
  Widget build(BuildContext context) {
    var questionnaireViewmodel = ref.watch(questionnaireProvider);
    var navbarViewmodel = ref.watch(navbarProvider);

    if (initialized == false) {
      questionnaireViewmodel.selectedIndex = 0;
      navbarViewmodel.selectedIndex = (4);
      navbarViewmodel.notifyListeners();
      initialized = true;
    }
    return Scaffold(
      appBar: navbarViewmodel.selectedIndex == 4
          ? AppBar(
              automaticallyImplyLeading: false,
              toolbarHeight: 80,
              backgroundColor: Color(0xFFF06129),
              title: Container(
                  height: 80,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: <Widget>[
                      IconButton(
                        iconSize: 20,
                        onPressed: () {
                          if (questionnaireViewmodel.selectedIndex > 0) {
                            questionnaireViewmodel.updateIndex(
                                questionnaireViewmodel.selectedIndex - 1);
                          } else {
                            Navigator.pop(context);
                          }
                        },
                        icon: Icon(Icons.arrow_back, color: Colors.white),
                      ),
                      
                      Container(width: 300),
                      questionnaireViewmodel.selectedIndex != subjects.length
                          ? IconButton(
                              iconSize: 20,
                              onPressed: () {
                                if (questionnaireViewmodel.selectedIndex > 0) {
                                  questionnaireViewmodel.updateIndex(
                                      questionnaireViewmodel.selectedIndex + 1);
                                }
                              },
                              icon: Icon(Icons.arrow_forward,
                                  color: Colors.white),
                            )
                          : Text(""),
                    ],
                  )))
          : null,
      bottomNavigationBar: MyOwnDataNavbar((int newIndex) {
        navbarViewmodel.updateIndex(newIndex);
      }),
      backgroundColor: Color.fromARGB(255, 253, 249, 242),
      body: IndexedStack(
        index: navbarViewmodel.selectedIndex,
        children: [
          //home
          const HomeScreen(),

          //Journey
          const JourneyScreen(),

          //My Data
          const MyDataScreen(),

          //credits
          const CreditScreen(),

          InformConsent(
            isloading,
            UpdateLoading,
            ages_groups,
            study_title,
            subjects,
            questionnaireViewmodel,
            trial_id,
            FinishIC
          ),
        ],
      ),
    );
  }
}

class InformConsent extends StatefulWidget {
  final isloading;
  final ages_groups;
  final study_title;
  final List<Subject> subjects;
  final questionnaireViewmodel;
  final Function UpdateLoading;
  final Function FinishIC;

  final String trialid;

  InformConsent(
      this.isloading,
      this.UpdateLoading,
      this.ages_groups,
      this.study_title,
      this.subjects,
      this.questionnaireViewmodel,
      this.trialid, this.FinishIC);

  @override
  _InformConsentState createState() => _InformConsentState();
}

class _InformConsentState extends State<InformConsent> {
  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;

    var isloading = widget.isloading;
    var ages_groups = widget.ages_groups;
    var study_title = widget.study_title;
    var questionnaireViewmodel = widget.questionnaireViewmodel;
    List<Subject> subjects = widget.subjects;
    Function UpdateLoading = widget.UpdateLoading;
    Function FinishIC = widget.FinishIC;

    String trialid = widget.trialid;

    void GoToNextUrl() {
      UpdateLoading(true);

      questionnaireViewmodel
          .updateIndex(questionnaireViewmodel.selectedIndex + 1);
      UpdateLoading(false);
    }

    List<Widget> renderSections() {
      List<Widget> allsection = subjects.map((e) {
        TextEditingController AnswerBox = new TextEditingController();

        return Column(
          children: [
            Container(
              margin: EdgeInsets.only(left: 48, right: 48, top: 40),
              child: Text(study_title,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.getFont('Lexend Deca',
                      color: Color(0xFF423838),
                      fontSize: 24,
                      fontWeight: FontWeight.w700)),
            ),
            const SizedBox(
              height: 12,
            ),
            Container(
              decoration:
                  BoxDecoration(color: Color.fromARGB(255, 253, 249, 242)),
              child: Column(
                children: [
                  Container(
                    width: size.width,
                    margin: const EdgeInsets.only(left: 16, right: 16),
                    padding: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: const Color(
                        0xFFFEE4CA,
                      ),
                    ),
                    child: QuestionWidget(
                        subject: e, size: size),
                  ),
                   Container(
                        margin: const EdgeInsets.only(
                            top: 20, left: 24, right: 24, bottom: 24),
                        child: GestureDetector(
                          onTap: () async {
                           GoToNextUrl();
                          },
                          child: Material(
                            borderRadius: BorderRadius.circular(8),
                            elevation: 2,
                            child: Container(
                              height: 40,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(8),
                                color: const Color(0xFFF06129),
                              ),
                              child: Center(
                                child: Text(
                                  "Next",
                                  style: GoogleFonts.getFont('Lexend Deca',
                                      fontSize: 16, color: Colors.white),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                ],
              ),
            )
          ],
        );
      }).toList();

      allsection.add(
          // Last page
          Column(
        children: [
          Container(
            margin: EdgeInsets.only(left: 20, right: 20, top: 40),
            child: Text("Your trial start tomorrow. In the trial overview you see the steps for the coming days.",
                textAlign: TextAlign.center,
                style: GoogleFonts.getFont('Lexend Deca',
                    color: Color(0xFF423838),
                    fontSize: 24,
                    fontWeight: FontWeight.w700)),
          ),
          const SizedBox(
            height: 12,
          ),
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            GestureDetector(
              onTap: () async {
               await FinishIC();
              },
              child: Container(
                margin: const EdgeInsets.only(top: 24),
                child: Image.asset("assets/images/check.png"),
              ),
            )
          ]),
        ],
      ));

      return allsection;
    }

    return Column(
        children: isloading == true
            ? [
                Expanded(
                    child: Center(
                        child: Container(
                            height: 150,
                            width: 150,
                            child: const SizedBox(
                              child: CircularProgressIndicator(
                                color: Color(0xFFF06129),
                              ),
                              height: 150.0,
                              width: 150.0,
                            ))))
              ]
            : [
                Expanded(
                    child: SingleChildScrollView(
                        child: Column(
                                     crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Stack(alignment: Alignment.topCenter, children: [
                      IndexedStack(
             
                          index: questionnaireViewmodel.selectedIndex,
                          children: renderSections())
                    ])
                  ],
                )))
              ]);
  }
}

class QuestionWidget extends StatefulWidget {
  final Subject subject;
  final Size size;
  const QuestionWidget(
      {Key? key,
      required this.subject,
      required this.size,});

  @override
  _QuestionWidget createState() => _QuestionWidget();
}

class _QuestionWidget extends State<QuestionWidget> {
  @override
  Widget build(BuildContext context) {
    final Subject subject = widget.subject;
    final Size size = widget.size;
    TextEditingController AnswerBox = new TextEditingController();
    TextEditingController ImageBox = new TextEditingController();

    var question = subject.ages_ans;

    Container GetUrlView() {
      if (subject.ages_ans!.urlType == "image") {
        return Container(
          margin: const EdgeInsets.only(right: 10, bottom: 20, left: 10),
          child: Container(
              child: Image.network(subject.ages_ans!.urlText.toString())),
        );
      }
      if (subject.ages_ans!.urlType == "upload") {
        return Container(
          margin: const EdgeInsets.only(right: 10, bottom: 20, left: 10),
          child: TextField(
            controller: AnswerBox,
            keyboardType: TextInputType.url,
            decoration: const InputDecoration(
                fillColor: Colors.white,
                filled: true,
                hintText: "https://image.com/example.png"),
          ),
        );
      }
      if (subject.ages_ans!.urlType == "video") {
        return Container(
          margin: const EdgeInsets.only(right: 10, bottom: 20, left: 10),
          child: Container(
              child: Html(
                  data: '<iframe height="180" width="340" src="https://www.youtube.com/embed/' +
                      YoutubePlayer.convertUrlToId(
                              subject.ages_ans!.urlText.toString())
                          .toString() +
                      '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; web-share" allowfullscreen></iframe>')),
        );
      }

      return Container();
    }

    if (question!.type == "rating" && question!.questiontype2 == "1-5") {
      return Column(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 24, bottom: 24),
            padding: const EdgeInsets.only(left: 48, right: 48),
            child: Text(
              subject.title,
              textAlign: TextAlign.left,
              style: GoogleFonts.getFont('Lexend Deca',
                  color: const Color(0xFF423838),
                  fontSize: 16,
                  fontWeight: FontWeight.w700),
            ),
          ),
          GetUrlView(),
          Container(
            margin: const EdgeInsets.only(left: 24, right: 24),
            child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              Expanded(
                child: Text(
                  subject.ages_ans!.answer,
                  textAlign: TextAlign.left,
                  style: GoogleFonts.getFont('Lexend Deca',
                      color: const Color(0xFF423838),
                      fontSize: 14,
                      letterSpacing: 0.82,
                      fontWeight: FontWeight.w400),
                ),
              ),
            ]),
          ),
          Container(
              margin: const EdgeInsets.only(top: 24, bottom: 24),
              padding: const EdgeInsets.only(left: 24, right: 24),
              child: Column(
                children: [
                  Text("Note (Optional):", textAlign: TextAlign.left),
                  Container(
                    margin: const EdgeInsets.only(top: 15),
                    child: TextField(
                      controller: AnswerBox,
                      keyboardType: TextInputType.multiline,
                      maxLines: 4,
                      onTap: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                JournalScreen(AnswerBox, title: "Note"),
                          ),
                        );
                      },
                      decoration: const InputDecoration(
                          fillColor: Colors.white, filled: true),
                    ),
                  )
                ],
              )),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        question.GivenAnswer = "5";
                       
                      });
                    },
                    child: Container(
                        margin: const EdgeInsets.only(left: 24, right: 24),
                        child: question.GivenAnswer != "5"
                            ? Image.asset(
                                "assets/images/moods/5.png",
                              )
                            : Image.asset(
                                "assets/images/moodspressed/5.png",
                              )),
                  ),
                  const Text("Excellent")
                ],
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        question.GivenAnswer = "4";
                       
                      });
                    },
                    child: Container(
                        margin: const EdgeInsets.only(left: 24, right: 24),
                        child: question.GivenAnswer != "4"
                            ? Image.asset(
                                "assets/images/moods/4.png",
                              )
                            : Image.asset(
                                "assets/images/moodspressed/4.png",
                              )),
                  ),
                  const Text("Very good")
                ],
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        question.GivenAnswer = "3";
                       
                      });
                    },
                    child: Container(
                        margin: const EdgeInsets.only(left: 24, right: 24),
                        child: question.GivenAnswer != "3"
                            ? Image.asset(
                                "assets/images/moods/3.png",
                              )
                            : Image.asset(
                                "assets/images/moodspressed/3.png",
                              )),
                  ),
                  const Text("Good")
                ],
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        question.GivenAnswer = "2";
                       
                      });
                    },
                    child: Container(
                        margin: const EdgeInsets.only(left: 24, right: 24),
                        child: question.GivenAnswer != "2"
                            ? Image.asset(
                                "assets/images/moods/2.png",
                              )
                            : Image.asset(
                                "assets/images/moodspressed/2.png",
                              )),
                  ),
                  const Text("Fair")
                ],
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        question.GivenAnswer = "1";
                       
                      });
                    },
                    child: Container(
                        margin: const EdgeInsets.only(left: 24, right: 24),
                        child: question.GivenAnswer != "1"
                            ? Image.asset(
                                "assets/images/moods/1.png",
                              )
                            : Image.asset(
                                "assets/images/moodspressed/1.png",
                              )),
                  ),
                  const Text("Poor")
                ],
              )
            ],
          )
        ],
      );
    } else if (question.type == "rating" && question.questiontype2 == "1-3") {
      return Column(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 24, bottom: 24),
            padding: const EdgeInsets.only(left: 48, right: 48),
            child: Text(
              subject.title,
              textAlign: TextAlign.left,
              style: GoogleFonts.getFont('Lexend Deca',
                  color: const Color(0xFF423838),
                  fontSize: 16,
                  fontWeight: FontWeight.w700),
            ),
          ),
          GetUrlView(),
          Container(
            margin: const EdgeInsets.only(left: 24, right: 24),
            child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              Expanded(
                child: Text(
                  subject.ages_ans!.answer,
                  textAlign: TextAlign.left,
                  style: GoogleFonts.getFont('Lexend Deca',
                      color: const Color(0xFF423838),
                      fontSize: 14,
                      letterSpacing: 0.82,
                      fontWeight: FontWeight.w400),
                ),
              ),
            ]),
          ),
          Container(
              margin: const EdgeInsets.only(top: 24, bottom: 24),
              padding: const EdgeInsets.only(left: 24, right: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Text("Note (Optional):", textAlign: TextAlign.left),
                  Container(
                    margin: const EdgeInsets.only(top: 15),
                    child: TextField(
                      controller: AnswerBox,
                      keyboardType: TextInputType.multiline,
                      maxLines: 4,
                      onTap: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                JournalScreen(AnswerBox, title: "Note"),
                          ),
                        );
                      },
                      decoration: const InputDecoration(
                          fillColor: Colors.white, filled: true),
                    ),
                  )
                ],
              )),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        question.GivenAnswer = "3";
                       
                      });
                    },
                    child: Container(
                        margin: const EdgeInsets.only(left: 24, right: 24),
                        child: question.GivenAnswer != "3"
                            ? Image.asset(
                                "assets/images/moods/5.png",
                              )
                            : Image.asset(
                                "assets/images/moodspressed/5.png",
                              )),
                  ),
                  const Text("Excellent")
                ],
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        question.GivenAnswer = "2";
                       
                      });
                    },
                    child: Container(
                        margin: const EdgeInsets.only(left: 24, right: 24),
                        child: question.GivenAnswer != "2"
                            ? Image.asset("assets/images/moods/3.png")
                            : Image.asset("assets/images/moodspressed/3.png")),
                  ),
                  const Text("Good")
                ],
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        question.GivenAnswer = "1";
                       
                      });
                    },
                    child: Container(
                        margin: const EdgeInsets.only(left: 24, right: 24),
                        child: question.GivenAnswer != "1"
                            ? Image.asset("assets/images/moods/1.png")
                            : Image.asset("assets/images/moodspressed/1.png")),
                  ),
                  const Text("Poor")
                ],
              )
            ],
          )
        ],
      );
    } else if (question.type == "open") {
      return Column(children: [
        Container(
          margin: const EdgeInsets.only(top: 24, bottom: 24),
          padding: const EdgeInsets.only(left: 48, right: 48),
          child: Text(
            subject.title,
            textAlign: TextAlign.left,
            style: GoogleFonts.getFont('Lexend Deca',
                color: const Color(0xFF423838),
                fontSize: 16,
                fontWeight: FontWeight.w700),
          ),
        ),
        GetUrlView(),
        Container(
          margin: const EdgeInsets.only(left: 24, right: 24),
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Expanded(
              child: Text(
                subject.ages_ans!.answer,
                textAlign: TextAlign.left,
                style: GoogleFonts.getFont('Lexend Deca',
                    color: const Color(0xFF423838),
                    fontSize: 14,
                    letterSpacing: 0.82,
                    fontWeight: FontWeight.w400),
              ),
            ),
          ]),
        ),
        Container(
            margin: const EdgeInsets.only(top: 24, bottom: 24),
            padding: const EdgeInsets.only(left: 24, right: 24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Text("Note (Optional):", textAlign: TextAlign.left),
                Container(
                  margin: const EdgeInsets.only(top: 15),
                  child: TextField(
                    controller: AnswerBox,
                    keyboardType: TextInputType.multiline,
                    maxLines: 4,
                    onTap: () async {
                      await Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) =>
                              JournalScreen(AnswerBox, title: "Note"),
                        ),
                      );
                    },
                    decoration: const InputDecoration(
                        fillColor: Colors.white, filled: true),
                  ),
                )
              ],
            )),
        Container(
            margin: const EdgeInsets.only(top: 24, bottom: 24),
            padding: const EdgeInsets.only(left: 24, right: 24),
            child: TextField(
              controller: AnswerBox,
              keyboardType: TextInputType.multiline,
              maxLines: 4,
              onTap: () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => JournalScreen(AnswerBox),
                  ),
                );
              },
              decoration:
                  const InputDecoration(fillColor: Colors.white, filled: true),
            )),
      ]);
    }

    return Column(children: [
      Container(
        margin: const EdgeInsets.only(top: 24, bottom: 24),
        padding: const EdgeInsets.only(left: 48, right: 48),
        child: Text(
          subject.title,
          textAlign: TextAlign.left,
          style: GoogleFonts.getFont('Lexend Deca',
              color: const Color(0xFF423838),
              fontSize: 16,
              fontWeight: FontWeight.w700),
        ),
      ),
      GetUrlView(),
      Container(
        margin: const EdgeInsets.only(left: 24, right: 24),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Expanded(
            child: Text(
              subject.ages_ans!.answer,
              textAlign: TextAlign.left,
              style: GoogleFonts.getFont('Lexend Deca',
                  color: const Color(0xFF423838),
                  fontSize: 14,
                  letterSpacing: 0.82,
                  fontWeight: FontWeight.w400),
            ),
          ),
        ]),
      ),
      Container(
          margin: const EdgeInsets.only(top: 24, bottom: 24),
          padding: const EdgeInsets.only(left: 24, right: 24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              Text(
                "Note (Optional):",
                textAlign: TextAlign.left,
              ),
              Container(
                margin: const EdgeInsets.only(top: 15),
                child: TextField(
                  controller: AnswerBox,
                  keyboardType: TextInputType.multiline,
                  maxLines: 4,
                  onTap: () async {
                    await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            JournalScreen(AnswerBox, title: "Note"),
                      ),
                    );
                  },
                  decoration: const InputDecoration(
                      fillColor: Colors.white, filled: true),
                ),
              )
            ],
          )),
      Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: () {
                  setState(() {
                    question.GivenAnswer = "Yes";
                   
                  });
                },
                child: Container(
                    margin: const EdgeInsets.only(left: 24, right: 24),
                    child: question.GivenAnswer != "Yes"
                        ? Image.asset("assets/images/moods/back-yes.png")
                        : Image.asset(
                            "assets/images/moodspressed/back-yes.png")),
              ),
              const Text("Yes")
            ],
          ),
          Row(
            children: [
              GestureDetector(
                onTap: () {
                  setState(() {
                    question.GivenAnswer = "No";
                   
                  });
                },
                child: Container(
                    margin: const EdgeInsets.only(left: 24, right: 24),
                    child: question.GivenAnswer != "No"
                        ? Image.asset("assets/images/moods/back-no.png")
                        : Image.asset(
                            "assets/images/moodspressed/back-no.png")),
              ),
              const Text("No")
            ],
          )
        ],
      )
    ]);
  }
}

(function() {
  "use strict";

  var subsidyTool = document.getElementById("subsidy-tool"),
    startOverLinks = document.querySelectorAll(".start-over"),
    loader = document.getElementById("loadingAnim"),
    householdSize,
    incomeText,
    i;

  // Check for addEventListener method. If not found, assume we are dealing
  // with our special friend IE 8 and use the attachEvent method for both
  // the subsidy tool and start over links.
  if (subsidyTool.addEventListener) {
    subsidyTool.addEventListener("click", captureUserInput, false);
    for (i = 0; i < startOverLinks.length; i++) {
      startOverLinks[i].addEventListener("click", startOver, false);
    }
  } else {
    subsidyTool.attachEvent("onclick", captureUserInput);
    for (i = 0; i < startOverLinks.length; i++) {
      startOverLinks[i].attachEvent("onclick", startOver);
    }
  }

  function updateDisplayProps(classStr, displayVal) {
    var classArray = classStr.split(/\s*,\s*/),
      elems;

    while (classArray.length) {
      elems = document.querySelectorAll(classArray[0]);

      for (var i = 0; i < elems.length; i++) {
        elems[i].style.display = displayVal;
      }

      classArray.shift();
    }
  }

  // polyfill for nextElementSibling in IE 8
  function nextElementSibling(el) {
    do {
      el = el.nextSibling;
    } while (el && el.nodeType !== 1);

    return el;
  }

  function captureUserInput(evt) {
    // more IE 8 workarounds
    evt = evt || window.event;
    var target = evt.target || evt.srcElement;

    // if event wasn't a button click, disregard the event
    if (target.nodeName.toLowerCase() !== "button") {
      return;
    }

    var question = target.parentNode.id,
      // if value attribute is present, use that value, otherwise
      // use the button's text (innerText property is for IE 8)
      value = target.value || (target.textContent || target.innerText);

    // needed to fill the 'household income' list item
    incomeText = target.textContent || target.innerText;


    // Expose global variables for Ensighten

    processMyForm(question, value);
  }

  function displayUserInput(question, value) {
    var currentQuestion = document.getElementById("input-" + question);

    currentQuestion.innerHTML += "<b> " + value + "</b>";
    currentQuestion.style.display = "list-item";
  }

  function displayNextQuestion(question) {
    var currentQuestion = document.getElementById(question),
      nextQuestion = nextElementSibling(currentQuestion);

    updateDisplayProps(".question-div", "none");
    loader.style.display = "block";
    nextQuestion.style.display = "block";

    setTimeout(function() {
      loader.style.display = "none";
      document.getElementById("questionDiv").style.display = "block";
    }, 400);
  }

  function displayAnswer(answer) {
    // Before showing any answers, hide previous answer
    updateDisplayProps(".question-div, .answer-div", "none");
    // First hide questions and then show the answer DIV after loading animation
    loader.style.display = "block";
    // Depending on the function call, show the correct answer
    document.getElementById("answer-" + answer).style.display = "block";

    setTimeout(function() {
      loader.style.display = "none";
      document.getElementById("answerDiv").style.display = "block";
    }, 1000);
  }

  function processMyForm(question, value) {
    var answer = "";
    // if the Age Range was selected, show not eligible answer for Senior or show next question for Adult
    if (question == "ageRange") {
      if (value == "65 or over") {
        answer = "medicare";
      }

      // if the Employer Plan was selected, show not eligible answer for YES or show next question for NO
    } else if (question == "employerPlan") {
      if (value == "Yes") {
        answer = "plan";
      }

      // if the Household was selected, record value and show next question
    } else if (question == "householdSize") {
      householdSize = value; // needed to calculate subsidy eligibility in next step

      // if the Income was selected, show calculate button
    } else if (question == "incomeRange") {
      // depending on number in household, show eligible or not eligible answer based on level of income
      switch (householdSize) {
        case "1 person":
          answer = (value <= 1) ? "yes" : "no";
          break;
        case "2 people":
          answer = (value <= 2) ? "yes" : "no";
          break;
        case "3 people":
          answer = (value <= 3) ? "yes" : "no";
          break;
        case "4 people":
          answer = (value <= 4) ? "yes" : "no";
          break;
        case "5 or more":
          answer = (value <= 4) ? "yes" : "five";
          break;
      }
      // set value to income text so it displays dollar amount
      // instead of integer used in switch block
      value = incomeText;
    }

    displayUserInput(question, value);

    answer ? displayAnswer(answer) : displayNextQuestion(question);
  }

  function startOver(e) {
    e.preventDefault();
    var userAnswers = document.querySelectorAll(".input-li");

    // hide everything, then show loading animatin for a short duration
    updateDisplayProps(".input-li, .question-div, .answer-div", "none");

    // remove previous session answers if present
    for (var i = 0; i < userAnswers.length; i++) {
      var el = userAnswers[i];
      if (el.lastChild.nodeName.toLowerCase() === "strong" ||
        el.lastChild.nodeName.toLowerCase() === "b") {
        el.removeChild(el.lastChild);
      }
    }

    loader.style.display = "block";

    setTimeout(function() {
      loader.style.display = "none";
      document.getElementById("ageRange").style.display = "block";
      document.getElementById("questionDiv").style.display = "block";
    }, 400);
  }
}());

/******************************************************************************
 * Stack Guesser
 * AUTHOR:  Ethan Yanyo
 * PURPOSE: This is a small browser-based guessing game.  The user is presented
 *          with a list of 10 questions from Stack Overflow, and selecting a 
 *          question brings up the answers given to that question.  The goal of
 *          the game is to guess the answer that was accepted for each question. 
 ******************************************************************************
 */


//Global variables to hold list of questions and current question
var questionArray = [];
var question = {};

//Global variables to maintain state of query and game progress
var page = 1;
var score = 0;
var numAnswered = 0;
var tagString="";


/* NAME:         populateQuestionArray
 * DESCRIPTION:  Performs a query of Stack Overflow questions using the Stack Exchange API and optionally filtering questions
 *               based on a tag from the tagField input box.  Populates questionArray with up to 10 questions from the API 
 * PARAMETERS:   N/A
 * RETURNS:      N/A
 * ASSUMES:      tagString, page
 * SIDE EFFECTS: Populates questionArray with up to 10 questions
 * NOTES:        N/A
 * REVISIONS:
 *   emy 04/2019 - Created
 */
function populateQuestionArray(){
	
	//If tagString not set from a previous run, look for a tag to filter by
	if (tagString === ""){ 
		var tags=document.getElementById("tagField").value;
		
		//If there's anything in the tagField, validate that it's a real tag per the Stack Exchange API
		if (tags != ""){
			var request = new XMLHttpRequest();
		  	var requestString = ("http://api.stackexchange.com/2.2/tags/" + tags + "/info?order=desc&sort=popular&site=stackoverflow");
		  	request.open('GET', requestString, false);
		  	request.onload = function() {
		  		//Process JSON response
		  		var data = JSON.parse(this.response);
		  		var count = 0;
		  		
		  		//Basic error handling
		  		if (data.error_id != ""){
		  			window.alert("Error retrieving tags. Showing all questions.");
		  		}
		  		else {
			  		//If data was returned when getting info on the tag
			  		if (data.items.length > 5){ //Questions API can't handle more than 5 tags
			  			window.alert("Too many tags entered.  Showing all questions.");
			  		}
			  		else {
			  			for (var i = 0; i < data.items.length ; i++){
			  				if (tagString === ""){
			  					tagString = ("&tagged=" + data.items[i].name);
			  				}
			  				else {
			  					tagString += (";" + data.items[i].name);
			  				}
			  				
			  				count += data.items[i].count;
			  			}
			  		}
			  		
			  		if (tagString === ""){
			  			window.alert("No valid tags found. Showing all questions.");
			  		}
			  		else if (count < 10){
			  			window.alert("Not enough questions within the given tag(s) to play. Showing all questions.");
			  			tagString = "";
			  		}
		  		}
		  	}
		  	request.send();
		}
	}

	var questionIndex = 0; //keep track of how many questions we're adding
	var pageLimit = page + 10; //if we don't find enough questions in 10 pages, quit out so we don't use up our quota.
	var error = "";
	
	while ((questionIndex < 10) && (page < pageLimit) && (error === "")){
	  var request = new XMLHttpRequest();
	  var requestString = ("http://api.stackexchange.com/2.2/questions?page=" + page + "&pagesize=100&order=desc&sort=activity" + tagString + "&site=stackoverflow&filter=!-MOiNm40F1Y0EbU.woOzZcyaCgGlrU3Gy");
	  request.open('GET', requestString, false);
	  request.onload = function() {
	    //Parse JSON response
	    var data = JSON.parse(this.response);
	    
	    //Handle errors
	    if (data.error_id != ""){
		 	window.alert("Error retrieving questions. Please try again.");
		 	error = 1;
		 	return;
		 }
		 
	    //Iterate through all the returned questions, or until we get 10 questions, whichever comes first
	    for (var i = 0; ((i < data.items.length) && (questionIndex < 10)); i++){
	    
	    		//Only return questions with multiple answers and with an accepted answer
	        	if ((data.items[i].accepted_answer_id != null) && (data.items[i].answer_count > 1)){
	          	questionArray[questionIndex]=data.items[i];
	         	questionIndex++;
	        }
	      }
	    }
	  request.send();
	  
	  page++; //Increment the page to request from the API if we need to query again (or if the user starts a new game)
  }
}


/* NAME:         initialize
 * DESCRIPTION:  Initializes the page with the set of questions
 * PARAMETERS:   N/A
 * RETURNS:      N/A
 * ASSUMES:      numAnswered, score, questionArray
 * SIDE EFFECTS: N/A
 * NOTES:        N/A
 * REVISIONS:
 *   emy 04/2019 - Created
 */
function initialize() {

	//Make sure we have enough questions loaded
	if (questionArray.length < 10) {
		window.alert("Questions not loaded. Please try the request again.");
		return;
	}

  document.getElementById("mainBody").innerHTML = ""; //Clear main body of page
  
  //Once all 10 questions have been answered
  if (numAnswered === 10){
  	window.alert("Congratulations, you've guessed answers for all the questions!  Your final score is: " + score + "/10.  Click Play Again to try again with a new set of questions.");
  	
  	//Add a new button allowing the user to play again
  	var replayBtn = document.createElement("BUTTON");
  	replayBtn.innerHTML="Play Again";
  	replayBtn.onclick=function(){
  		restart();
  	}
  	document.getElementById("mainBody").appendChild(replayBtn);
  	
  	addLineBreak();
  	addLineBreak();
  }
  
  for (var i = 0; i < questionArray.length; i++){
    
    //Create a button for each question that will load the details for that question when clicked
    var btn = document.createElement("BUTTON");
    btn.innerHTML=questionArray[i].title;
    btn.id=i;
    btn.className="questionButton";
    btn.onclick=function(){
      getQuestion(this.id);
    }
    
    //If the question has already been answered, don't allow it to be selected again
    if (questionArray[i].answered===true){
      btn.disabled=true;
    }
    
    document.getElementById("mainBody").appendChild(btn);
    
    addLineBreak();
  }
  
  //Initialize the score field.  Score should always be 0 here, but use the variable just in case
  document.getElementById("scoreField").innerHTML=("Score: " + score);
}


/* NAME:         getQuestion
 * DESCRIPTION:  Gets question data from questionArray for the given index
 * PARAMETERS:   
 *   questionIndex (REQ) - Question index to return data from.  Should be an integer 0-9
 * RETURNS:      N/A
 * ASSUMES:      questionArray
 * SIDE EFFECTS: Sets question object to the current question for use in other functions
 * NOTES:        N/A
 * REVISIONS:
 *   emy 04/2019 - Created
 */
function getQuestion(questionIndex){
	if (questionIndex === null) { return; } //if we don't get passed a question ID, don't proceed

  document.getElementById("mainBody").innerHTML = ""; //Clear the page so we can redraw it for the question/answer view
  
  //Add a back button to go back to the list of questions
  var backButton = document.createElement("BUTTON");
  backButton.innerHTML = "Back";
  backButton.className="backButton";
  backButton.onclick=function(){
    initialize();
  }
  document.getElementById("mainBody").appendChild(backButton);
  
  addLineBreak();
  
  //merge data from questionArray into question object and shuffle order of answers in question
  question = questionArray[questionIndex];
  shuffleAnswers();
  
  //Question Title
  var title = document.createElement("H2");
  title.innerHTML=question.title;
  title.className="center";
  document.getElementById("mainBody").appendChild(title);
  
  addLineBreak();
  
  //Question Body (text of question)
  var text = document.createElement("P");
  text.innerHTML=question.body;
  text.className="questionText";
  document.getElementById("mainBody").appendChild(text);
  
  addLineBreak();
  
  //Add a button for each answer in the question that will check for the correct answer when clicked
  for (var i = 0; i < question.answers.length; i++){
    var btn = document.createElement("BUTTON");
    btn.innerHTML=question.answers[i].body;
    btn.id=("answer" + i);
    btn.onclick=function(){
      checkAnswer(this.id);
    }
    document.getElementById("mainBody").appendChild(btn);
    
    addLineBreak();
    
    //Mark the correct answer, to be used in checkAnswer function
    if (question.answers[i].is_accepted === true){
      question.correctAnswer=("answer" + i);
    }
  }
}


/* NAME:         shuffleAnswers
 * DESCRIPTION:  Shuffles order of answer array within the question object
 * PARAMETERS:   N/A
 * RETURNS:      N/A
 * ASSUMES:      question
 * SIDE EFFECTS: N/A
 * NOTES:        N/A
 * REVISIONS:
 *   emy 04/2019 - Created
 */
function shuffleAnswers() {
    var array=question.answers;
    
    //Modern Fisher-Yates shuffle algorithm
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}


/* NAME:         checkAnswer
 * DESCRIPTION:  Checks if the answer selected is the one marked as accepted
 * PARAMETERS:   
 *   buttonPressed (REQ) - the id of the button element corresponding to the answer selected.
                           Should be a string in the format "answer#", where # is the array index of the answer.
 * RETURNS:      N/A
 * ASSUMES:      question, numAnswered, score
 * SIDE EFFECTS: Increments numAnswered and score (the latter if the answer was correct)
 * NOTES:        N/A
 * REVISIONS:
 *   emy 04/2019 - Created
 */
function checkAnswer(buttonPressed) {

	//If correct, tell the user and increment the score
	if (buttonPressed === question.correctAnswer){
		window.alert("Correct!");
		
		score++;
	}
	else {
		window.alert("Incorrect :(");
		
		//If they answered wrong, highlight the incorrect guess in red
		document.getElementById(buttonPressed).style.backgroundColor="#660000";
  		document.getElementById(buttonPressed).style.color="#FFFFFF";
	}
  
  //Always highlight the correct answer in green
  document.getElementById(question.correctAnswer).style.backgroundColor="#006600";
  document.getElementById(question.correctAnswer).style.color="#FFFFFF";
  
  //disable all answer buttons once one has been guessed
  for (var i = 0; i < question.answers.length; i++) {
    document.getElementById("answer" + i).disabled=true;
  }
  
  //Mark the question as answered (so it can't be attempted again) and increment the number of questions answered
  question.answered=true;
  numAnswered++;
  
  //Update score display
  document.getElementById("scoreField").innerHTML=("Score: " + score);
}


/* NAME:         restart
 * DESCRIPTION:  Allows a user to start a new game once they've answered all 10 questions
 * PARAMETERS:   N/A
 * RETURNS:      N/A
 * ASSUMES:      questionArray, question, score, numAnswered
 * SIDE EFFECTS: Resets the global variables to 0/null
 * NOTES:        N/A
 * REVISIONS:
 *   emy 04/2019 - Created
 */
function restart(){

	//Reset global variables, except for page and tagString, which should be retained from game to game
	questionArray = [];
	question = {};
	score = 0;
	numAnswered = 0;
	
	//Get a new set of questions and start over from the beginning with the question page
	populateQuestionArray();
	initialize();
}


/* NAME:         addLineBreak
 * DESCRIPTION:  Adds a <br /> element to the main body of the page
 * PARAMETERS:   N/A
 * RETURNS:      N/A
 * ASSUMES:      N/A
 * SIDE EFFECTS: N/A
 * NOTES:        Only works for the mainBody div element -- <br>'s will needed to be added manually elsewhere.
 * REVISIONS:
 *   emy 04/2019 - Created
 */
function addLineBreak(){
	var br = document.createElement("BR");
	document.getElementById("mainBody").appendChild(br);
}

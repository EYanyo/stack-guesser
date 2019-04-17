//Global variables to hold list of questions and current question
var questionArray = [];
var question = {};
var page = 1;


function populateQuestionArray(){
	var questionIndex=0;
	
	while (questionIndex < 10){
	  var request = new XMLHttpRequest();
	  var requestString = ("http://api.stackexchange.com/2.2/questions?page=" + page + "&pagesize=100&order=desc&sort=activity&site=stackoverflow&filter=!-MOiNm40F1Y0EbU.woOzZcyaCgGlrU3Gy");
	  request.open('GET', requestString, false);
	  request.onload = function() {
	    // Begin accessing JSON data here
	    var data = JSON.parse(this.response);
	    
	    for (var i = 0; ((i < data.items.length) && (questionIndex < 10)); i++){
	        if ((data.items[i].accepted_answer_id != null)&(data.items[i].answer_count > 1)){
	          questionArray[questionIndex]=data.items[i];
	          questionIndex++;
	        }
	      }
	    }
	  request.send();
	  
	  page++;
  }
}


function initialize() {
  document.getElementById("mainBody").innerHTML = "";
  
  for (var i = 0; i < questionArray.length; i++){
    var btn = document.createElement("BUTTON");
    btn.innerHTML=questionArray[i].title;
    btn.id=i;
    btn.onclick=function(){
      getQuestion(this.id);
    }
    if (questionArray[i].answered===true){
      btn.disabled=true;
    }
    document.getElementById("mainBody").appendChild(btn);
    
    var br = document.createElement("BR");
    document.getElementById("mainBody").appendChild(br);
  }
}


function getQuestion(questionIndex){
  document.getElementById("mainBody").innerHTML = "";
  
  var backButton = document.createElement("BUTTON");
  backButton.innerHTML = "Back";
  backButton.onclick=function(){
    initialize();
  }
  document.getElementById("mainBody").appendChild(backButton);
  
  var br = document.createElement("BR");
  document.getElementById("mainBody").appendChild(br);
  
  question = questionArray[questionIndex];
  shuffleAnswers();
  
  var title = document.createElement("H2");
  title.innerHTML=question.title;
  document.getElementById("mainBody").appendChild(title);
  
  var br = document.createElement("BR");
  document.getElementById("mainBody").appendChild(br);
  
  var text = document.createElement("P");
  text.innerHTML=question.body;
  document.getElementById("mainBody").appendChild(text);
  
  var br = document.createElement("BR");
  document.getElementById("mainBody").appendChild(br);
  
  for (var i = 0; i < question.answers.length; i++){
    var btn = document.createElement("BUTTON");
    btn.innerHTML=question.answers[i].body;
    btn.id=("answer" + i);
    btn.onclick=function(){
      checkAnswer(this.id);
    }
    document.getElementById("mainBody").appendChild(btn);
    
    var br = document.createElement("BR");
    document.getElementById("mainBody").appendChild(br);
    
    if (question.answers[i].is_accepted === true){
      question.correctAnswer=("answer" + i);
    }
  }
}


function shuffleAnswers() {
    var array=question.answers;
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}


function checkAnswer(buttonPressed) {
  document.getElementById(buttonPressed).style.backgroundColor="#660000";
  document.getElementById(buttonPressed).style.color="#FFFFFF";
  document.getElementById(question.correctAnswer).style.backgroundColor="#006600";
  document.getElementById(question.correctAnswer).style.color="#FFFFFF";
  
  for (var i = 0; i < question.answers.length; i++) {
    document.getElementById("answer" + i).disabled=true;
  }
  
  question.answered=true;
}
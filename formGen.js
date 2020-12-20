String.prototype.title = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

function addText(text,tabs,toAdd){
	text += "\n"
	for(let i=0;i<tabs;i++){
		text += "\t"
	}
	text += toAdd
	return text
}

function genPythonServer(data){
	let errorCode = 0;

	//Open Route
	let route = ""
	if(data.name){
		route = `app.route("/${data.name}", methods=["${data.method.toUpperCase()}"])`
	}else{
		return{"passed":false,"error":"Data does not include a form name"}
	}

	let tabs = 0

	//Open function
	route = addText(route,tabs++,`def ${data.name}():`)

	//For each field
	for(let i=0;i<data.fields.length;i++){
		let field = data.fields[i]
		route = addText(route,tabs,`#${field.name} field validation`)
		route = addText(route,tabs,`${field.name} = request.form.get('${field.name}')`)
		route = addText(route,tabs++,`if ${field.name} is None:`)
		route = addText(route,tabs--,`return jsonify({"error":"Not all required data passed, field:'${field.name}' required","eCode":${++errorCode}}),400`)
		if(field.validation){
			if(field.validation.required){
				if(field.type == "checkbox"){
					route = addText(route,tabs++,`if not ${field.name}:`)
					route = addText(route,tabs--,`return jsonify({"error":"field:'${field.name} must be checked","eCode":${++errorCode}}),400`)
				}else{
					route = addText(route,tabs++,`if ${field.name} == "":`)
					route = addText(route,tabs--,`return jsonify({"error":"field:'${field.name} cannot be blank","eCode":${++errorCode}}),400`)
				}
			}
		}
		if(field.type == "dropdown" || field.type == "radio"){
			route = addText(route,tabs++,`if ${field.name} not in ${JSON.stringify(field.options)}:`)
			route = addText(route,tabs--,`return jsonify({"error":"value of field:'${field.name} not valid","eCode":${++errorCode}}),400`)
		}
		route = addText(route,tabs,``)
	}

	route = addText(route,tabs,`#TODO: Auto Generated stub for ${data.method.toUpperCase()} route\n`)

	route = addText(route,tabs,`return jsonify({"success":"success"}),200`)

	return {"passed":true,"route":route}
}

function genJsBulma(data){
	function addTextValidation(js, data, formName){
		let added = false
		js = addText(js,tabs,`let ${data.name}Txt = document.getElementById("${formName.title()}${data.name.title()}Comment")`)
		js = addText(js,tabs,`document.getElementById("${formName.title()}${data.name.title()}Input").classList.remove("is-danger")`)
		js = addText(js,tabs,`document.getElementById("${formName.title()}${data.name.title()}Input").classList.remove("is-success")`)
		js = addText(js,tabs,`clear(${data.name}Txt)`)

		if(data.validation){
			if(data.validation.required){
				added = true
				js = addText(js,tabs++,`if(${data.name}==""){`)
				js = addText(js,tabs,`valid = false;`)
				js = addText(js,tabs,`document.getElementById("${formName.title()}${data.name.title()}Input").classList.add("is-danger")`)
				js = addText(js,tabs,`${data.name}Txt.style.display = "block"`)
				js = addText(js,tabs,`${data.name}Txt.classList.add("is-danger")`)
				js = addText(js,tabs,`${data.name}Txt.innerText = "This field is required"`)
			}
		}
		if(data.type == "number"){
			if(added){
				js = addText(js,--tabs,`}else if(isNaN(parseInt(${data.name}))){`)
			}else{
				js = addText(js,tabs,`if(isNaN(parseInt(${data.name}))){`)
			}
			tabs++;	
			js = addText(js,tabs,`valid = false;`)
			js = addText(js,tabs,`document.getElementById("${formName.title()}${data.name.title()}Input").classList.add("is-danger")`)
			js = addText(js,tabs,`${data.name}Txt.style.display = "block"`)
			js = addText(js,tabs,`${data.name}Txt.classList.add("is-danger")`)
			js = addText(js,tabs,`${data.name}Txt.innerText = "This needs to be a number"`)
			added = true;
		}

		tabs--;
		js = addText(js,tabs++,`}else{`)
		js = addText(js,tabs,`document.getElementById("${formName.title()}${data.name.title()}Input").classList.add("is-success")`)
		js = addText(js,--tabs,`}\n`)
		return js
	}

	function addCheckboxValidation(js, data, formName){
		js = addText(js,tabs,`let ${data.name}Txt = document.getElementById("${formName.title()}${data.name.title()}Comment")`)
		js = addText(js,tabs,`clear(${data.name}Txt)`)

		if(data.validation){
			if(data.validation.required){
				js = addText(js,tabs++,`if(${data.name}==false){`)
				js = addText(js,tabs,`valid = false;`)
				js = addText(js,tabs,`${data.name}Txt.style.display = "block"`)
				js = addText(js,tabs,`${data.name}Txt.classList.add("is-danger")`)
				js = addText(js,tabs,`${data.name}Txt.innerText = "This box must be ticked"`)
				js = addText(js,--tabs,`}\n`)
			}
		}
		return js
	}

	//Open function
	let js = ""
	if(data.name){
		js = `function submit${data.name.title()}(){`
	}else{
		return{"passed":false,"error":"Data does not include a form name"}
	}

	//Create valid var
	let tabs = 1
	js = addText(js,tabs,`let valid = true;\n`)

	js = addText(js,tabs++,`function clear(elem){`)
	js = addText(js,tabs,`elem.style.display = "none"`)
	js = addText(js,tabs,`elem.classList.remove("is-danger")`)
	js = addText(js,tabs,`elem.classList.remove("is-success")`)
	js = addText(js,--tabs,`}\n`)

	//For each field
	let paramsLine = `let params = `
	for(let i=0;i<data.fields.length;i++){
		let field = data.fields[i]

		//Add to params
		if(i == 0){
			paramsLine += `'${field.name}='+${field.name}`
		}else{
			paramsLine += `+'&${field.name}='+${field.name}`
		}

		if(field.type == "checkbox"){
			js = addText(js,tabs,`var ${field.name} = document.forms["${data.name}"]["${field.name}"].checked;`)
		}else{
			js = addText(js,tabs,`var ${field.name} = document.forms["${data.name}"]["${field.name}"].value;`)
		}
		
		switch(field.type){
			case "text":
				js = addTextValidation(js,field,data.name)
				break;
			case "email":
				js = addTextValidation(js,field,data.name)
				break;
			case "tel":
				js = addTextValidation(js,field,data.name)
				break;
			case "dropdown":
				break;
			case "radio":
				break;
			case "checkbox":
				js = addCheckboxValidation(js,field,data.name)
				break;
			case "textArea":
				js = addTextValidation(js,field,data.name)
				break;
			case "number":
				js = addTextValidation(js,field,data.name)
				break;
			default:
				return{"passed":false,"error":`Field ${i+1} failed, unknown type '${fieldType}'`}
		}
		
	}

	//If all fields are valid
	js = addText(js,tabs,"")
	js = addText(js,tabs++,`if(valid){`)

	//Setup ajax request
	js = addText(js,tabs,paramsLine+";")
	js = addText(js,tabs,`var xhttp = new XMLHttpRequest();`)
	
	if(data.method){
		data.method = data.method.toUpperCase()
		if(!["POST","PUT","DELETE","PATCH"].includes(data.method)){
			return{"passed":false,"error":`Method not in valid list: "POST","PUT","DELETE","PATCH"`}
		}
		js = addText(js,tabs,`xhttp.open("${data.method}",'/${data.name}', true);`)
	}else{
		return{"passed":false,"error":"Data does not include a method"}
	}
	js = addText(js,tabs,`xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")`)
	js = addText(js,tabs++,`xhttp.onreadystatechange = function() {`)
	js = addText(js,tabs++,`if (xhttp.readyState === 4) {`)
	js = addText(js,tabs++,`if (xhttp.status === 200){`)
	js = addText(js,tabs,`console.log("Success")`)
	tabs--;
	js = addText(js,tabs++,`}else{`)
	js = addText(js,tabs,`console.log("Error")`)
	js = addText(js,--tabs,`}`)
	js = addText(js,--tabs,`}`)
	js = addText(js,--tabs,`};`)

	js = addText(js,tabs,`xhttp.send(params);`)

	//Close if valid
	js = addText(js,--tabs,`}`)

	//return false and close function
	js = addText(js,tabs,"")
	js = addText(js,tabs,"return false;")
	js = addText(js,--tabs,"}")

	return {"passed":true,"js":js}
}

function genFormBulma(data){

	function addTextInput(html, data, formName, type){
		let placeholder = ""
		if(data.placeholder){
			placeholder = ` placeholder="${data.placeholder}"`
		}

		let required = ""
		if(data.validation){
			if(data.validation.required){
				//required = " required"
			}
		}

		let input = `<input id="${formName.title()}${data.name.title()}Input" class="input" type="${type}" ${placeholder} name="${data.name}"${required}></input>`
		html = addText(html,tabs,input)
		return html
	}

	function addDropdown(html, data, formName){
		if(data.expand){
			html = addText(html,tabs++,`<div class="select is-fullwidth">`)
		}else{
			html = addText(html,tabs++,`<div class="select">`)
		}
		
		html = addText(html,tabs++,`<select name="${data.name}" id="${formName.title()}${data.name.title()}Input">`)

		for(let i=0;i<data.options.length;i++){
			html = addText(html,tabs,`<option>${data.options[i]}</option>`)
		}

		html = addText(html,--tabs,`</select>`)
		html = addText(html,--tabs,`</div>`)
		return html
	}

	function addRadio(html, data, formName){
		for(let i=0;i<data.options.length;i++){
			html = addText(html,tabs++,`<label class="radio">`)
			if(i==0){
				html = addText(html,tabs,`<input type="radio" name="${data.name}" value="${data.options[i]}" id="${formName.title()}${data.name.title()}Input${i}" checked>`)
			}else{
				html = addText(html,tabs,`<input type="radio" name="${data.name}" value="${data.options[i]}" id="${formName.title()}${data.name.title()}Input${i}">`)
			}
			
			html = addText(html,tabs,`${data.options[i]}`)
			html = addText(html,--tabs,`</input>`)
		}
		return html
	}

	function addCheckbox(html, data, formName){
		html = addText(html,tabs++,`<label class="checkbox">`)
		html = addText(html,tabs,`<input type="checkbox" name="${data.name}" id="${formName.title()}${data.name.title()}Input">`)
		html = addText(html,tabs,`${data.text}`)
		html = addText(html,--tabs,`</label>`)

		return html
	}

	function addTextArea(html, data, formName){
		html = addText(html,tabs,`<textarea class="textarea" placeholder="${data.placeholder}" name="${data.name}" id="${formName.title()}${data.name.title()}Input"></textarea>`)

		return html
	}

	let requirements = []
	requirements.push(`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.1/css/bulma.min.css">`)
	requirements.push(`<meta name="viewport" content="width=device-width, initial-scale=1">`)
	requirements.push(`<meta charset="utf-8">`)
	requirements.push(`<script defer src="https://use.fontawesome.com/releases/v5.14.0/js/all.js"></script>`)

	//Initialise form with name and id
	let html = ""
	if(data.name){
		html = `<form name="${data.name}" id="${data.name}" onsubmit="return submit${data.name.title()}()">`
	}else{
		return{"passed":false,"error":"Data does not include a form name"}
	}
	
	let tabs = 1

	for(let i=0;i<data.fields.length;i++){
		let field = data.fields[i]

		//Open a new field
		if(field.expand){
			html = addText(html,tabs++,`<div class="field is-expanded">`)
		}else{
			html = addText(html,tabs++,`<div class="field">`)
		}

		//Open a new field
		let attachments = false
		try{
			if(field.attachments.left.staticBtn){
				attachments = true
			}
		}catch(e){}
		try{
			if(field.attachments.right.staticBtn){
				attachments = true
			}
		}catch(e){}

		if(attachments){
			html = addText(html,tabs++,`<div class="field has-addons">`)
		}else{
			html = addText(html,tabs++,`<div class="field">`)
		}
		
		let fieldName = field.name
		if(!fieldName){
			return{"passed":false,"error":`Field ${i+1} failed, did not have required attribute "name"`}
		}

		let fieldType = field.type
		if(!fieldType){
			return{"passed":false,"error":`Field ${i+1} failed, did not have required attribute "type"`}
		}
			
		//Add label
		let fieldLabel= field.label
		if(field.label){
			if(field.label == "default"){
				fieldLabel = field.name.title()
			}
			html = addText(html,tabs,`<label class="label">${fieldLabel}</label>`)
		}

		//Add left attactments
		try{
			if(field.attachments.left.staticBtn){
				html = addText(html,tabs++,`<p class="control">`)
				html = addText(html,tabs++,`<a class="button is-static">`)
				html = addText(html,tabs,`${field.attachments.left.staticBtn}`)
				html = addText(html,--tabs,`</a>`)
				html = addText(html,--tabs,`</p>`)
			}
		}catch(e){}

		//Open a control
		let control = `<div class="control `
		try{
			if(field.attachments.left.icon){
				control += "has-icons-left "
			}
		}catch(e){}
		try{
			if(field.attachments.right.icon){
				control += "has-icons-right"
			}
		}catch(e){}
		if(field.expand){
			control += " is-expanded"
		}
		control += `">`
		html = addText(html,tabs++,control)

		//Add left icon
		try{
			if(field.attachments.left.icon){
				html = addText(html,tabs++,`<span class="icon is-small is-left">`)
				html = addText(html,tabs,`<i class="${field.attachments.left.icon}"></i>`)
				html = addText(html,--tabs,`</span>`)
			}
		}catch(e){}

		//Differ based on input type
		switch(fieldType){
			case "text":
				html = addTextInput(html,field,data.name,"text");
				break;
			case "email":
				html = addTextInput(html,field,data.name,"email");
				break;
			case "tel":
				html = addTextInput(html,field,data.name,"tel");
				break;
			case "dropdown":
				html = addDropdown(html,field,data.name);
				break;
			case "radio":
				html = addRadio(html,field,data.name);
				break;
			case "checkbox":
				html = addCheckbox(html,field,data.name)
				break;
			case "textArea":
				html = addTextArea(html,field,data.name);
				break;
			case "number":
				html = addTextInput(html,field,data.name);
				break;
			default:
				return{"passed":false,"error":`Field ${i+1} failed, unknown type '${fieldType}'`}
		}
			
		//Add right icon
		try{
			if(field.attachments.right.icon){
				html = addText(html,tabs++,`<span class="icon is-small is-right">`)
				html = addText(html,tabs,`<i class="${field.attachments.right.icon}"></i>`)
				html = addText(html,--tabs,`</span>`)
			}
		}catch(e){}

		//Close the control
		html = addText(html,--tabs,"</div>")

		//Add right attactments
		try{
			if(field.attachments.right.staticBtn){
				html = addText(html,tabs++,`<p class="control">`)
				html = addText(html,tabs++,`<a class="button is-static">`)
				html = addText(html,tabs,`${field.attachments.right.staticBtn}`)
				html = addText(html,--tabs,`</a>`)
				html = addText(html,--tabs,`</p>`)
			}
		}catch(e){}

		//Close the field 1
		html = addText(html,--tabs,"</div>")

		if(field.comment){
			html = addText(html,tabs,`<p class="help" id="${data.name.title()}${field.name.title()}Comment">${field.comment}</p>`)
		}else{
			html = addText(html,tabs,`<p class="help" id="${data.name.title()}${field.name.title()}Comment" style="display:none;"></p>`)
		}

		//Close the field 2
		html = addText(html,--tabs,"</div>")

	}

	//Add the submit button
	html = addText(html,tabs,`<button class="button" type="submit" style="background-color:${data.button.color}; color:${data.button.textColor}">${data.button.text}</button>`)

	//End the form
	html = addText(html,--tabs,"</form>")

	return {"passed":true,"html":html}
}


let data = {
 	"name": "TestForm",
	"fields":[
		{
			"name":"name",
			"type":"text",
			"label":"From",
			"placeholder":"Full Name",
			"attachments":{
				"left":{
					"icon":"fa fa-user"
				}
			},
			"validation":{
				"required":true
			}
		},
		{
			"name":"email",
			"type":"email",
			"placeholder":"Email",
			"attachments":{
				"left":{
					"icon":"fa fa-envelope"
				}
			},
			"validation":{
				"required":true
			}
		},
		{
			"name":"username",
			"type":"text",
			"placeholder":"Username",
			"attachments":{
				"left":{
					"icon":"fas fa-signature"
				}
			},
			"validation":{
				"required":true
			}
		},
		{
			"name":"age",
			"type":"number",
			"placeholder":"Age"
		},
		{
			"name":"telNo",
			"type":"tel",
			"placeholder":"Your Phone Number",
			"comment":"Do not enter the first 0",
			"expand":true,
			"attachments":{
				"left":{
					"staticBtn":"+44"
				}
			},
			"validation":{
				"required":true
			}
		},
		{
			"name":"dept",
			"type":"dropdown",
			"label":"Department",
			"options":[
				"Business Development",
				"Marketing",
				"Sales"
			]
		},
		{
			"name":"member",
			"type":"radio",
			"label":"Already a member?",
			"orientation":"horizontal",
			"options":[
				"Yes",
				"No"
			]
		},
		{
			"name":"subject",
			"type":"text",
			"label":"default",
			"placeholder":"eg. Partnership Opportunity",
			"validation":{
				"required":true
			}
		},
		{
			"name":"question",
			"type":"textArea",
			"label":"default",
			"placeholder":"Explain how we can help you",
			"expand":true,
			"validation":{
				"required":true
			}
		},
		{
			"name":"tnc",
			"type":"checkbox",
			"text":"I agree to the <a>terms and conditions</a>",
			"validation":{
				"required":true
			}
		}
	],
	"button":{
		"text":"Submit",
		"color":"lightgray",
		"textColor":"black"
	},
	"method":"post"
}

let loginData = {
	"name": "TestForm",
	"fields":[
		{
			"name":"Username",
			"type":"text",
			"placeholder":"Username",
			"attachments":{
				"left":{
					"icon":"fa fa-user"
				}
			},
			"validation":{
				"required":true
			}
		},
		{
			"name":"password",
			"type":"text",
			"placeholder":"Password",
			"attachments":{
				"left":{
					"icon":"fa fa-lock"
				}
			},
			"validation":{
				"required":true
			}
		}
	],
	"button":{
		"text":"Login",
		"color":"lightgray",
		"textColor":"black"
	},
	"method":"post"
}


let generated = genFormBulma(data)
let generatedJs = genJsBulma(data)
let generatedRoute = genPythonServer(data)
console.log(generated)
console.log(generatedJs)
console.log(generatedRoute)
if(generated.passed && generatedJs.passed && generatedRoute.passed){
	document.getElementById("output").value = generated.html + "\n\n\n\n" + generatedJs.js + "\n\n\n\n" + generatedRoute.route + "\n"
	document.getElementById("render").innerHTML = generated.html
}else{
	document.getElementById("output").value = generated.error
}


//min: 12
//max: 14
//regex
//Number input
//Password input
//Date input?
//Date min/max
//Dropdown attatchment
//Form success/failure overall text
//Loading btn
//Download page
//Presentation of data


function submitTestform(){
	let valid = true;

	function clear(elem){
		elem.style.display = "none"
		elem.classList.remove("is-danger")
		elem.classList.remove("is-success")
	}

	var name = document.forms["TestForm"]["name"].value;
	let nameTxt = document.getElementById("TestformNameComment")
	document.getElementById("TestformNameInput").classList.remove("is-danger")
	document.getElementById("TestformNameInput").classList.remove("is-success")
	clear(nameTxt)
	if(name==""){
		valid = false;
		document.getElementById("TestformNameInput").classList.add("is-danger")
		nameTxt.style.display = "block"
		nameTxt.classList.add("is-danger")
		nameTxt.innerText = "This field is required"
	}else{
		document.getElementById("TestformNameInput").classList.add("is-success")
	}

	var email = document.forms["TestForm"]["email"].value;
	let emailTxt = document.getElementById("TestformEmailComment")
	document.getElementById("TestformEmailInput").classList.remove("is-danger")
	document.getElementById("TestformEmailInput").classList.remove("is-success")
	clear(emailTxt)
	if(email==""){
		valid = false;
		document.getElementById("TestformEmailInput").classList.add("is-danger")
		emailTxt.style.display = "block"
		emailTxt.classList.add("is-danger")
		emailTxt.innerText = "This field is required"
	}else{
		document.getElementById("TestformEmailInput").classList.add("is-success")
	}

	var username = document.forms["TestForm"]["username"].value;
	let usernameTxt = document.getElementById("TestformUsernameComment")
	document.getElementById("TestformUsernameInput").classList.remove("is-danger")
	document.getElementById("TestformUsernameInput").classList.remove("is-success")
	clear(usernameTxt)
	if(username==""){
		valid = false;
		document.getElementById("TestformUsernameInput").classList.add("is-danger")
		usernameTxt.style.display = "block"
		usernameTxt.classList.add("is-danger")
		usernameTxt.innerText = "This field is required"
	}else{
		document.getElementById("TestformUsernameInput").classList.add("is-success")
	}

	var age = document.forms["TestForm"]["age"].value;
	let ageTxt = document.getElementById("TestformAgeComment")
	document.getElementById("TestformAgeInput").classList.remove("is-danger")
	document.getElementById("TestformAgeInput").classList.remove("is-success")
	clear(ageTxt)
	if(isNaN(parseInt(age))){
		valid = false;
		document.getElementById("TestformAgeInput").classList.add("is-danger")
		ageTxt.style.display = "block"
		ageTxt.classList.add("is-danger")
		ageTxt.innerText = "This needs to be a number"
	}else{
		document.getElementById("TestformAgeInput").classList.add("is-success")
	}

	var telNo = document.forms["TestForm"]["telNo"].value;
	let telNoTxt = document.getElementById("TestformTelnoComment")
	document.getElementById("TestformTelnoInput").classList.remove("is-danger")
	document.getElementById("TestformTelnoInput").classList.remove("is-success")
	clear(telNoTxt)
	if(telNo==""){
		valid = false;
		document.getElementById("TestformTelnoInput").classList.add("is-danger")
		telNoTxt.style.display = "block"
		telNoTxt.classList.add("is-danger")
		telNoTxt.innerText = "This field is required"
	}else{
		document.getElementById("TestformTelnoInput").classList.add("is-success")
	}

	var dept = document.forms["TestForm"]["dept"].value;
	var member = document.forms["TestForm"]["member"].value;
	var subject = document.forms["TestForm"]["subject"].value;
	let subjectTxt = document.getElementById("TestformSubjectComment")
	document.getElementById("TestformSubjectInput").classList.remove("is-danger")
	document.getElementById("TestformSubjectInput").classList.remove("is-success")
	clear(subjectTxt)
	if(subject==""){
		valid = false;
		document.getElementById("TestformSubjectInput").classList.add("is-danger")
		subjectTxt.style.display = "block"
		subjectTxt.classList.add("is-danger")
		subjectTxt.innerText = "This field is required"
	}else{
		document.getElementById("TestformSubjectInput").classList.add("is-success")
	}

	var question = document.forms["TestForm"]["question"].value;
	let questionTxt = document.getElementById("TestformQuestionComment")
	document.getElementById("TestformQuestionInput").classList.remove("is-danger")
	document.getElementById("TestformQuestionInput").classList.remove("is-success")
	clear(questionTxt)
	if(question==""){
		valid = false;
		document.getElementById("TestformQuestionInput").classList.add("is-danger")
		questionTxt.style.display = "block"
		questionTxt.classList.add("is-danger")
		questionTxt.innerText = "This field is required"
	}else{
		document.getElementById("TestformQuestionInput").classList.add("is-success")
	}

	var tnc = document.forms["TestForm"]["tnc"].checked;
	let tncTxt = document.getElementById("TestformTncComment")
	clear(tncTxt)
	if(tnc==false){
		valid = false;
		tncTxt.style.display = "block"
		tncTxt.classList.add("is-danger")
		tncTxt.innerText = "This box must be ticked"
	}

	
	if(valid){
		let params = 'name='+name+'&email='+email+'&username='+username+'&age='+age+'&telNo='+telNo+'&dept='+dept+'&member='+member+'&subject='+subject+'&question='+question+'&tnc='+tnc;
		var xhttp = new XMLHttpRequest();
		xhttp.open("POST",'/TestForm', true);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState === 4) {
				if (xhttp.status === 200){
					console.log("Success")
				}else{
					console.log("Error")
				}
			}
		};
		xhttp.send(params);
	}
	
	return false;
}

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
		route = addText(route,tabs--,`return jsonify({"error":"Not all required data passed, field:'${field.name}' required","eCode":${++errorCode}}),400\n`)
	}

	route = addText(route,tabs,`#TODO: Auto Generated stub for ${data.method.toUpperCase()} route\n`)

	route = addText(route,tabs,`return jsonify({"success":"success"}),200`)

	return {"passed":true,"route":route}
}

function genJsBulma(data){
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

		js = addText(js,tabs,`var ${field.name} = document.forms["${data.name}"]["${field.name}"].value;`)

		//DO VALIDATION HERE
		
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

	function addTextInput(html, data, type){
		let placeholder = ""
		if(data.placeholder){
			placeholder = ` placeholder="${data.placeholder}"`
		}

		let input = `<input class="input" type="${type}" ${placeholder} name="${data.name}"></input>`
		html = addText(html,tabs,input)
		return html
	}

	function addDropdown(html, data){
		if(data.expand){
			html = addText(html,tabs++,`<div class="select is-fullwidth">`)
		}else{
			html = addText(html,tabs++,`<div class="select">`)
		}
		
		html = addText(html,tabs++,`<select name="${data.name}">`)

		for(let i=0;i<data.options.length;i++){
			html = addText(html,tabs,`<option>${data.options[i]}</option>`)
		}

		html = addText(html,--tabs,`</select>`)
		html = addText(html,--tabs,`</div>`)
		return html
	}

	function addRadio(html, data){
		for(let i=0;i<data.options.length;i++){
			html = addText(html,tabs++,`<label class="radio">`)
			if(i==0){
				html = addText(html,tabs,`<input type="radio" name="${data.name}" checked>`)
			}else{
				html = addText(html,tabs,`<input type="radio" name="${data.name}">`)
			}
			
			html = addText(html,tabs,`${data.options[i]}`)
			html = addText(html,--tabs,`</input>`)
		}
		return html
	}

	function addCheckbox(html, data){
		html = addText(html,tabs++,`<label class="checkbox">`)
		html = addText(html,tabs,`<input type="checkbox" name="${data.name}">`)
		html = addText(html,tabs,`${data.text}`)
		html = addText(html,--tabs,`</label>`)

		return html
	}

	function addTextArea(html, data){
		html = addText(html,tabs,`<textarea class="textarea" placeholder="${data.placeholder}" name="${data.name}"></textarea>`)

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
				html = addTextInput(html,field,"text");
				break;
			case "email":
				html = addTextInput(html,field,"email");
				break;
			case "tel":
				html = addTextInput(html,field,"tel");
				break;
			case "dropdown":
				html = addDropdown(html,field);
				break;
			case "radio":
				html = addRadio(html,field);
				break;
			case "checkbox":
				html = addCheckbox(html,field)
				break;
			case "textArea":
				html = addTextArea(html,field);
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
			html = addText(html,tabs,`<p class="help">${field.comment}</p>`)
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
			],
			"validation":{
				"required":true
			}
		},
		{
			"name":"member",
			"type":"radio",
			"label":"Already a member?",
			"orientation":"horizontal",
			"options":[
				"Yes",
				"No"
			],
			"validation":{
				"required":true
			}
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
			"name":"tnc",
			"type":"checkbox",
			"text":"I agree to the <a>terms and conditions</a>",
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
		}
	],
	"button":{
		"text":"Submit",
		"color":"lightgray",
		"textColor":"black"
	},
	"method":"post"
}


let generated = genFormBulma(data)
let generatedJs = genJsBulma(data)
let generatedRoute = genPythonServer(data)
if(generated.passed && generatedJs.passed && generatedRoute.passed){
	document.getElementById("output").value = generated.html + "\n\n\n\n" + generatedJs.js + "\n\n\n\n" + generatedRoute.route + "\n"
	document.getElementById("render").innerHTML = generated.html
}else{
	document.getElementById("output").value = generated.error
}

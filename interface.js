let memoryCount = 256;
let registerCount = 16;
let busWidth = 16;
let stepDelay = 100;
let emu;

const handleRunStep = function(){
  updateRegisters();
  updateMemory();
}

const handleReadm = function(str){
  $("#console").val($("#console").val() + str + "\n");
}

const clearReadm = function(){
	$("#console").val("");
}

const handleLog = function(str, insertLineBreak){
  if(insertLineBreak) handleLog("-".repeat(16));
  console.log("%c Emulator: " + str, "color: #F0F");
}

const resetEmulator = function(){
  emu = new Emulator(busWidth, registerCount, memoryCount, stepDelay, handleRunStep, handleReadm, handleLog);
  updateRegisters();
  updateMemory();
}

//Prefill procedure and flow settings from URL, if available
const presetFormFromURL = function(){
	let procedureText = (new URL(location)).searchParams.get("procedure");
	if(procedureText != null){
		$("#procedure").val(procedureText);
	}

	let widthSetting = (new URL(location)).searchParams.get("width");
	if(widthSetting != null){
		$("#buswidth").val(widthSetting);
	}

  let delaySetting = (new URL(location)).searchParams.get("delay");
	if(delaySetting != null){
		$("#stepdelay").val(delaySetting);
	}
}

const updateURL = function(){
	var newURL = location.href.split("?")[0];
	newURL += "?procedure=" + encodeURIComponent($("#procedure").val());
	newURL += "&width=" + encodeURIComponent($("#buswidth").val());
  newURL += "&delay=" + encodeURIComponent($("#stepdelay").val());
	history.replaceState({}, '', newURL);
}

//Populate memory table and selectors
const populateMemoryFields = function(){
  for(let i = 0; i < memoryCount; i++){
  	$("#memoryTable").append("<tr><td>0x" + i.toString(16) + "</td><td id=\"mem-" + i + "\">0x" + emu.memory[i].toString(16) + "</td></tr>");

    $("#createInstructionImm").append("<option value=\"" + i.toString(16) + "\">" + i.toString(16) + "</option>");
  }
}

//Populate register table and selectors
const populateRegisterFields = function(){
  for(let i = 0; i < registerCount; i++){
  	$("#registerTable").append("<tr><td>0x" + i.toString(16) + "</td><td id=\"reg-" + i + "\">0x" + emu.register[i].toString(16) + "</td></tr>");

    for(let j = 1; j <= 3; j++){
      $("#createInstructionRegister" + j).append("<option value=\"" + i.toString(16) + "\">" + i.toString(16) + "</option>");
    }
  }
}

//Update visible registers
const updateRegisters = function(){
	for(let i = 0; i < registerCount; i++){
		$("#reg-" + i).html("0x" + emu.register[i].toString(16));
	}
}

//Update visible memory
const updateMemory = function(){
	for(let i = 0; i < memoryCount; i++){
		if(i == emu.pc){
			$("#mem-" + i).html("<span class=\"pc\">0x" + emu.memory[i].toString(16) + "</span>");
		}else{
			$("#mem-" + i).html("0x" + emu.memory[i].toString(16));
		}
	}
}

const changeBusWidth = function(){
	const widthStr = $("#buswidth").val();
	switch(widthStr){
		case "16":
			busWidth = 16;
			break;
		case "32":
			busWidth = 32;
			break;
	}
  resetEmulator();
}

const changeStepDelay = function(){
  const delay = parseInt($("#stepdelay").val());
	stepDelay = delay;
  emu.stepDelay = delay;
}

const setBoxesVisibleArray = function(showArray){
	let showingBoxes = [
		"createInstructionRegister1",
		"createInstructionRegister2",
		"createInstructionRegister3",
		"createInstructionImm"
	]
	if(showArray.length != showingBoxes.length) console.error("How are you hiding these boxes dude?");
	for(let i = 0; i < showingBoxes.length; i++){
		if(showArray[i]){
			$("#" + showingBoxes[i]).show();
		}else{
			$("#" + showingBoxes[i]).hide();
		}
	}
}

const setArrowsVisibleArray = function(showArray){
	if(showArray.length != 5) console.error("How are you setting these arrows dude?");
	for(let i = 0; i < 5; i++){
		$("#createInstructionContext" + (i + 1)).html(showArray[i]);
	}
}

const updateVisElements = function() {
	const op = $("#createInstructionOp option:selected").text();

	switch(op){
		case "mov1":
			setBoxesVisibleArray([1, 0, 0, 1]);
			setArrowsVisibleArray(["RF[", "]", "", "<=mem[", "]"]);
			break;
		case "mov2":
			setBoxesVisibleArray([1, 0, 0, 1]);
			setArrowsVisibleArray(["RF[", "]", "", "=>mem[", "]"]);
			break;
		case "mov3":
			setBoxesVisibleArray([1, 1, 0, 0]);
			setArrowsVisibleArray(["mem[RF[", "]]<=RF[", "]", "", ""]);
			break;
		case "mov4":
			setBoxesVisibleArray([1, 0, 0, 1]);
			setArrowsVisibleArray(["RF[", "]", "", "<=", ""]);
			break;
		case "add":
			setBoxesVisibleArray([1, 1, 1, 0]);
			setArrowsVisibleArray(["RF[", "]+RF[", "]=>RF[", "]", ""]);
			break;
		case "subt":
			setBoxesVisibleArray([1, 1, 1, 0]);
			setArrowsVisibleArray(["RF[", "]-RF[", "]=>RF[", "]", ""]);
			break;
		case "jz":
			setBoxesVisibleArray([1, 0, 0, 1]);
			setArrowsVisibleArray(["if RF[", "]=0", "", ", pc=", ""]);
			break;
		case "readm":
			setBoxesVisibleArray([0, 0, 0, 1]);
			setArrowsVisibleArray(["out<=", "", "", "mem[", "]"]);
			break;
		case "mult":
			setBoxesVisibleArray([1, 1, 1, 0]);
			setArrowsVisibleArray(["RF[", "]*RF[", "]=>RF[", "]", ""]);
			break;
		case "inc":
			setBoxesVisibleArray([1, 0, 0, 0]);
			setArrowsVisibleArray(["RF[", "]++", "", "", ""]);
			break;
		case "dec":
			setBoxesVisibleArray([1, 0, 0, 0]);
			setArrowsVisibleArray(["RF[", "]--", "", "", ""]);
			break;
		case "mov5":
			setBoxesVisibleArray([1, 0, 0, 0]);
			setArrowsVisibleArray(["RF[", "] <= mem[RF[ (same register) ]]", "", "", ""]);
			break;
		case "halt":
			setBoxesVisibleArray([0, 0, 0, 0]);
			setArrowsVisibleArray(["", "", "", "", ""]);
			break;
		default:
			setBoxesVisibleArray([1, 1, 1, 1]);
			setArrowsVisibleArray(["", "", "", "", ""]);
	}
}

const pushNewInstruction = function(instructionString){
	const textArea = $("#procedure");
	const needsNewLine = textArea.val() != "" && textArea.val().substr(-1) != "\n";
	textArea.val(textArea.val() + (needsNewLine ? "\n" : "") + instructionString + "\n");
  updateURL();
}

const handleCreatedInstruction = function(){
	const op = $("#createInstructionOp option:selected").text();
	const reg1 = $("#createInstructionRegister1 option:selected").text().toUpperCase();
	const reg2 = $("#createInstructionRegister2 option:selected").text().toUpperCase();
	const reg3 = $("#createInstructionRegister3 option:selected").text().toUpperCase();
	const imm = ("00" + $("#createInstructionImm option:selected").text().toUpperCase()).substr(-2);

	switch(op){
		case "mov1":
			pushNewInstruction("0" + reg1 + imm);
			break;
		case "mov2":
			pushNewInstruction("1" + reg1 + imm);
			break;
		case "mov3":
			pushNewInstruction("2" + reg1 + reg2 + "0");
			break;
		case "mov4":
			pushNewInstruction("3" + reg1 + imm);
			break;
		case "add":
			pushNewInstruction("4" + reg1 + reg2 + reg3);
			break;
		case "subt":
			pushNewInstruction("5" + reg1 + reg2 + reg3);
			break;
		case "jz":
			pushNewInstruction("6" + reg1 + imm);
			break;
		case "readm":
			pushNewInstruction("7" + "0" + imm);
			break;
		case "mult":
			pushNewInstruction("8" + reg1 + reg2 + reg3);
			break;
		case "inc":
			pushNewInstruction("9" + reg1 + "00");
			break;
		case "dec":
			pushNewInstruction("A" + reg1 + "00");
			break;
		case "mov5":
			pushNewInstruction("B" + reg1 + "00");
			break;
		case "halt":
			pushNewInstruction("F000");
			break;
		default:
			console.error("Invalid instruction?");
			break;
	}

	$("#createInstructionForm").hide();
	$("#openInstructionCreator").show();
}

presetFormFromURL();
resetEmulator();
changeBusWidth();
changeStepDelay();
clearReadm();
populateMemoryFields();
populateRegisterFields();

$("#createInstructionForm").on("change", updateVisElements);

$("#openInstructionCreator").on("click", function(){
	$("#createInstructionForm").show();
	$("#openInstructionCreator").hide();
	updateVisElements();
});

$("#buswidth").on("change", changeBusWidth);

$("#stepdelay").on("change", changeStepDelay);

$("#loadbutton").on("click", function() {
	clearReadm();
	const procedure = $("#procedure").val().split("\n").map(x => parseInt(x, 16));
  emu.load(procedure);

  updateRegisters();
  updateMemory();
});

$("#runbutton").on("click", function() {
  emu.run();
  updateRegisters();
  updateMemory();
});

$("#stepbutton").on("click", function() {
  emu.step();
  updateRegisters();
  updateMemory();
});

//Update URL when settings are changed
$("#ctrlpanel").on("input change", updateURL);

$("#cancelInstruction").on("click", function(){
	$("#createInstructionForm").hide();
	$("#openInstructionCreator").show();
});

$("#addInstruction").on("click", handleCreatedInstruction);

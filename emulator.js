// This is quick and dirty, going to try and clean it up

const memoryLocationCount = 256;
const registerCount = 16;

let memory = [];
let register = [];
let pc = 0;
let running = false;

//Add hex to register constructor tables
for(let i = 0; i < 256; i++){
	if(i < 16){
		for(let j = 1; j <= 3; j++){
			$("#createInstructionRegister" + j).append("<option value=\"" + i.toString(16) + "\">" + i.toString(16) + "</option>");
		}
	}
	$("#createInstructionImm").append("<option value=\"" + i.toString(16) + "\">" + i.toString(16) + "</option>");
}

for(let i = 0; i < memoryLocationCount; i++){
	memory[i] = 0;
	$("#memoryTable").append("<tr><td>0x" + i.toString(16) + "</td><td id=\"mem-" + i + "\">0x" + memory[i].toString(16) + "</td></tr>");
}


for(let i = 0; i < registerCount; i++){
	register[i] = 0;
	$("#registerTable").append("<tr><td>0x" + i.toString(16) + "</td><td id=\"reg-" + i + "\">0x" + register[i].toString(16) + "</td></tr>");
}


let updateRegisters = function(){
	for(let i = 0; i < registerCount; i++){
		$("#reg-" + i).html("0x" + register[i].toString(16));
	}
}

let updateMemory = function(){
	for(let i = 0; i < memoryLocationCount; i++){
		if(i == pc){
			$("#mem-" + i).html("<span class=\"pc\">0x" + memory[i].toString(16) + "</span>");
		}else{
			$("#mem-" + i).html("0x" + memory[i].toString(16));
		}
	}
}

let zeroRegisters = function(){
	for(let i = 0; i < registerCount; i++){
		register[i] = 0;
	}
}

let zeroMemory = function(){
	for(let i = 0; i < memoryLocationCount; i++){
		memory[i] = 0;
	}
}

let addToConsole = function(newText){
	$("#console").val($("#console").val() + newText + "\n");
}

let clearConsole = function(){
	$("#console").val("");
}

let simulateFlow = function(n) {
    //return (((n%0xff)+0xff)%0xff)+1;
	return n;
};

let processInstruction = function(instruction){
	const opCode = (instruction >> 12) & 0xf;
	const reg1 = (instruction >> 8) & 0xf;
	const reg2 = (instruction >> 4) & 0xf;
	const reg3 = instruction & 0xf;
	const imm = instruction & 0xff;
	console.log("----------------");
	console.log("PC=0x" + pc.toString(16));
	pc++;
	console.log("Added one, PC=0x" + pc.toString(16));
	console.log("OP=0x" + opCode.toString(16) + ", reg1=0x" + reg1.toString(16) + ", reg2=0x" + reg2.toString(16) + ", reg3=0x" + reg3.toString(16) + ", imm=0x" + imm.toString(16));
	switch(opCode){
		case 0: //mov1
			console.log("mov1");
			register[reg1] = memory[imm];
			break;
		case 1: //mov2
			console.log("mov2");
			memory[imm] = register[reg1];
			break;
		case 2: //mov3
			console.log("mov3");
			memory[register[reg1]] = register[reg2];
			break;
		case 3: //mov4
			console.log("mov4");
			register[reg1] = imm;
			break;
		case 4: //add
			console.log("add");
			register[reg3] = simulateFlow(register[reg1] + register[reg2]);
			break;
		case 5: //subt
			console.log("subt");
			register[reg3] = simulateFlow(register[reg1] - register[reg2]);
			break;
		case 6: //jz
			console.log("jz");
			if(register[reg1] == 0) pc = imm;
			break;
		case 7: //readm
			console.log("readm");
			addToConsole(memory[imm]);
			break;
		case 8: //mult
			console.log("mult");
			register[reg3] = simulateFlow(register[reg1] * register[reg2]);
			break;
		case 9: //inc
			console.log("inc");
			register[reg1] = simulateFlow(register[reg1] + 1);
			break;
		case 10: //dec
			console.log("dec");
			register[reg1] = simulateFlow(register[reg1] - 1);
			break;
		case 11: //mov5
			console.log("mov5");
			alert(memory[register[reg1]]);
			register[reg1] = memory[register[reg1]];
			break;
		case 15: //halt
			console.log("halt");
			running = false;
			break;
		default: //nothing
			console.log("nothing");
			break;
	}
	console.log("Ending instruction, going to execute PC=0x" + pc.toString(16));
}

zeroMemory();
zeroRegisters();

$("#loadbutton").on("click", function() {
	clearConsole();
	
	zeroMemory();
	zeroRegisters();
	const procedureStrings = $("#procedure").val().split("\n");
	for(let i = 0; i < procedureStrings.length; i++){
		const memVal = parseInt(procedureStrings[i], 16);
		memory[i] = !isNaN(memVal) ? memVal : 0;
	}
	pc = 0;
	updateRegisters();
	updateMemory();
	console.log("================");
	console.log("LOADED NEW MEMORY");
	console.log("================");
});

$("#runbutton").on("click", function() {
	zeroRegisters();
	let count = 2048;
	running = true;
	while(running && count != 0){
		processInstruction(memory[pc]);
		count--;
	}
	updateRegisters();
	updateMemory();
	console.log("================");
	console.log("STOPPED");
	console.log("================");
});

$("#stepbutton").on("click", function() {
	if(pc == 0){
		running = true;
	}
	if(running){
		processInstruction(memory[pc]);
		updateRegisters();
		updateMemory();
	}
});

let setBoxesVisibleArray = function(showArray){
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

let setArrowsVisibleArray = function(showArray){
	if(showArray.length != 5) console.error("How are you setting these arrows dude?");
	for(let i = 0; i < 5; i++){
		$("#createInstructionContext" + (i + 1)).html(showArray[i]);
	}
}

let updateVisElements = function() {
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

$("#createInstructionForm").on("change", updateVisElements);

$("#openInstructionCreator").on("click", function(){
	$("#createInstructionForm").show();
	$("#openInstructionCreator").hide();
	updateVisElements();
});

let pushNewInstruction = function(instructionString){
	const textArea = $("#procedure");
	const needsNewLine = textArea.val() != "" && textArea.val().substr(-1) != "\n";
	textArea.val(textArea.val() + (needsNewLine ? "\n" : "") + instructionString + "\n");
}

$("#cancelInstruction").on("click", function(){
	$("#createInstructionForm").hide();
	$("#openInstructionCreator").show();
});

$("#addInstruction").on("click", function(){
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
});
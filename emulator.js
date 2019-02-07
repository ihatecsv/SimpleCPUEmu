// This is quick and dirty, going to try and clean it up

const memoryLocationCount = 256;
const registerCount = 16;

let memory = [];
let register = [];
let pc = 0;
let running = false;


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
			register[reg3] = register[reg1] + register[reg2];
			break;
		case 5: //subt
			console.log("subt");
			register[reg3] = register[reg1] - register[reg2];
			break;
		case 6: //jz
			console.log("jz");
			if(register[reg1] == 0) pc = imm - 1;
			break;
		case 7: //readm
			console.log("readm");
			alert(memory[imm]);
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
	zeroMemory();
	zeroRegisters();
	const procedureStrings = $("#procedure").val().split("\n");
	for(let i = 0; i < procedureStrings.length; i++){
		memory[i] = parseInt(procedureStrings[i], 16);
	}
	pc = 0;
	updateRegisters();
	updateMemory();
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
	console.log("Stopped!");
});

$("#stepbutton").on("click", function() {
	if(pc == 0){
		running = true;
	}
	if(running){
		processInstruction(memory[pc]);
		pc++;
		updateRegisters();
		updateMemory();
	}
});
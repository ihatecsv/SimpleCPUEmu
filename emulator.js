class Emulator {
	constructor(busWidth, registerCount, memoryCount, stepDelay, handleRunStep = function(){}, handleReadm = function(){}, handleEmuLog = function(){}){
		this.busWidth = busWidth;
		if(this.busWidth != 16 && this.busWidth != 32) throw "Invalid bus width! Valid values are 16 and 32!";

		this.registerCount = registerCount;
		this.memoryCount = memoryCount;
		this.stepDelay = stepDelay;

		this.handleRunStep = handleRunStep;
		this.handleReadm = handleReadm;
		this.handleEmuLog = handleEmuLog;

		this.pc = 0x0;
		this.halted = true;

		//TODO: probably unnecessary to do this here
		this.resetMemory();
		this.resetRegisters();

		this.handleEmuLog("Emulator created with bus width " + this.busWidth +"!");
	}

	processInstruction(instruction){
		const op = (instruction >> 12) & 0xf;
		const r1 = (instruction >> 8) & 0xf;
		const r2 = (instruction >> 4) & 0xf;
		const r3 = instruction & 0xf;
		const imm = instruction & 0xff;
		this.handleEmuLog("Parsed instruction: OP=0x" + op.toString(16) + ", r1=0x" + r1.toString(16) + ", r2=0x" + r2.toString(16) + ", r3=0x" + r3.toString(16) + ", imm=0x" + imm.toString(16));
		switch(op){
			case 0x0: //mov1
				this.handleEmuLog("Executing mov1!");
				this.register[r1] = this.memory[imm];
				break;
			case 0x1: //mov2
				this.handleEmuLog("Executing mov2!");
				this.memory[imm] = this.register[r1];
				break;
			case 0x2: //mov3
				this.handleEmuLog("Executing mov3!");
				this.memory[this.register[r1]] = this.register[r2];
				break;
			case 0x3: //mov4
				this.handleEmuLog("Executing mov4!");
				this.register[r1] = imm;
				break;
			case 0x4: //add
				this.handleEmuLog("Executing add!");
				this.register[r3] = this.register[r1] + this.register[r2];
				break;
			case 0x5: //subt
				this.handleEmuLog("Executing subt!");
				this.register[r3] = this.register[r1] - this.register[r2];
				break;
			case 0x6: //jz
				this.handleEmuLog("Executing jz!");
				if(this.register[r1] == 0) this.pc = imm;
				this.handleEmuLog("Jumped, PC=0x" + this.pc.toString(16));
				break;
			case 0x7: //readm
				this.handleEmuLog("Executing readm!");
				this.handleReadm(this.memory[imm]);
				break;
			case 0x8: //mult
				this.handleEmuLog("Executing mult!");
				this.register[r3] = this.register[r1] * this.register[r2];
				break;
			case 0x9: //inc
				this.handleEmuLog("Executing inc!");
				this.register[r1] = this.register[r1] + 1;
				break;
			case 0xa: //dec
				this.handleEmuLog("Executing dec!");
				this.register[r1] = this.register[r1] - 1;
				break;
			case 0xb: //mov5
				this.handleEmuLog("Executing mov5!");
				this.register[r1] = this.memory[this.register[r1]];
				break;
			case 0xf: //halt
				this.handleEmuLog("Executing halt!");
				this.halted = true;
				break;
			default: //invalid op
				this.handleEmuLog("Invalid operation 0x" + op.toString(16) + ", ignoring!");
				break;
		}
	}

	step(){
		if(this.halted){
			this.handleEmuLog("CPU has halted, ignoring step!", true);
			return;
		}
		this.handleEmuLog("Handling new step!", true);
		const instruction = this.memory[this.pc];
		this.handleEmuLog("Fetched instruction at PC=0x" + this.pc.toString(16) + ": 0x" + instruction.toString(16));
		this.pc++;
		this.processInstruction(instruction);
		this.handleRunStep();
	}

	run(){
		if(this.halted){
			this.handleEmuLog("CPU has halted!", true);
			return;
		}
		this.step();
		const objThis = this;
		setTimeout(function(){
			objThis.run(this.stepDelay);
		}, this.stepDelay);
	}

	load(program){
		if(program.length > this.memory.length){
			this.handleEmuLog("Program too long, ignoring!");
			return;
		}
		this.pc = 0x0;
		this.resetMemory();
		this.resetRegisters();
		this.handleEmuLog("Reset machine state!", true);
		for(let i = 0; i < program.length; i++){
			this.memory[i] = program[i];
		}
		this.handleEmuLog("Program loaded into memory! (" + program.length + " instructions)");
		this.halted = false;
	}

	resetMemory(){
		switch(this.busWidth){
			case 16:
				this.memory = new Uint16Array(this.memoryCount);
				break;
			case 32:
				this.memory = new Uint32Array(this.memoryCount);
				break;
		}
	}

	resetRegisters(){
		switch(this.busWidth){
			case 16:
				this.register = new Uint16Array(this.registerCount);
				break;
			case 32:
				this.register = new Uint32Array(this.registerCount);
				break;
		}
	}
}

class Emulator {
	constructor(busWidth, registerCount, memoryCount, verbose){
		this.verbose = verbose;
		this.internalLog("Initialized!");

		this.busWidth = busWidth;

		switch(this.busWidth){
			case 16:
				this.register = new Uint16Array(registerCount);
				this.memory = new Uint16Array(memoryCount);
				this.internalLog("Set bus width to 16 bit!");
				break;
			case 32:
				this.register = new Uint32Array(registerCount);
				this.memory = new Uint32Array(memoryCount);
				this.internalLog("Set bus width to 32 bit!");
				break;
			default:
				this.internalLog("Invalid bus width, throwing error!");
				throw "Invalid bus width! Valid values are 16 and 32!";
				break;
		}
		this.internalLog("Ready!");
	}

	internalLog(str){
		if(this.verbose){
			console.log("%c Emulator: " + str, "color: #F0F");
		}
	}

	loadProgram(program){
		if(program.length > this.memory.length){
			this.internalLog("Program too long, ignoring!");
			return;
		}
		for(let i = 0; i < program.length; i++){
			this.memory[i] = program[i];
		}
		this.internalLog("Program loaded into memory! (" + program.length + " instructions)");
	}
}

let emu = new Emulator(16, 16, 256, true);

let program = new Uint16Array([
	0x3000,
	0x3101,
	0x3301,
	0x3403,
	0x390A,
	0x3A34,
	0x1332,
	0x1433,
	0x3502,
	0x3702,
	0x3600,
	0x4508,
	0x4676,
	0x5818,
	0x6810,
	0x600C,
	0x5646,
	0x4636,
	0x2A60,
	0x4A1A,
	0x4515,
	0x4403,
	0x4604,
	0x5919,
	0x691A,
	0x600A,
	0x7032,
	0x7033,
	0x7034,
	0x7035,
	0x7036,
	0x7037,
	0x7038,
	0x7039,
	0x703A,
	0x703B,
	0xF000
]);

emu.loadProgram(program);

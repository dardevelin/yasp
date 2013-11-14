(function () {
  var emulator;
  var assembler = new yasp.Assembler();

  module("emulator commands", {
    setup: function () {
      emulator = new yasp.Emulator(true);
      emulator.continue();
      assembler = new yasp.Assembler();
    },
    teardown: function () {
      emulator = null;
      assembler = null;
    }
  });

  /*
    Test-Format:
      {
        cmd: "MOV b0,b1",
        setup: { reg: { }, flags: { }, stack: { } },
        steps: [
          { reg: { }, stack: { 0: 0xFF } },
          { ram: { 0x42: 1 }, pin: { .. to be defined .. } },
          { rom: { 0x00: 0 }, flags: { c: false, z: true } }
        ]
      }

    Checkable / setable registers:
      b0 to b31 - byte registers
      w0 to b31 - word registers
      pc        - programm counter
      sp        - stack pointer

    Possible value-formats: (reg, ram, rom, stack)
      hex - 0xFF       - normal JS number literal
      dec - 255        - normal JS number literal
      bin - "1111 111" - binary format, written as string, spaces allowed

    Minimal example:
      {
        cmd: "MOV b0,b2",
        setup: { reg: { "b2": 1 } },
        steps: { reg: { "b0": 1 } }
      }
  */

  var commandTestData = [];

  // MOV
  commandTestData = commandTestData.concat([
    {
      cmd: "MOV b0,1",
      steps: { reg: { "b0": 1 } }
    },
    {
      cmd: "MOV b0,b1",
      setup: { reg: { "b1": 1 } },
      steps: { reg: { "b0": 1 } }
    },
    {
      cmd: "MOV w0,0xFFAA",
      steps: { reg: { "w0": 0xFFAA } }
    },
    {
      cmd: "MOV w0,w1",
      setup: { reg: { "w1": 0xFFAA } },
      steps: { reg: { "w0": 0xFFAA } }
    }
  ]);

  // ADD b,b
  commandTestData = commandTestData.concat([
    {
      cmd: "ADD b0,b1",
      setup: { reg: { "b0": 1, "b1": 1 } },
      steps: { reg: { "b0": 2 }, flags: { c: false, z: false } }
    },
    {
      cmd: "ADD b0,b1",
      setup: { reg: { "b0": 255, "b1": 2 } },
      steps: { reg: { "b0": 1 }, flags: { c: true, z: false } }
    },
    {
      cmd: "ADD b0,b1",
      setup: { reg: { "b0": 0xFF, "b1": 1 } },
      steps: { reg: { "b0": 0 }, flags: { c: true, z: true } }
    }
  ]);

  // ADD b,l
  commandTestData = commandTestData.concat([
    {
      cmd: "ADD b0,1",
      setup: { reg: { "b0": 1 } },
      steps: { reg: { "b0": 2 }, flags: { c: false, z: false } }
    },
    {
      cmd: "ADD b0,2",
      setup: { reg: { "b0": 0xFF } },
      steps: { reg: { "b0": 1 }, flags: { c: true, z: false } }
    },
    {
      cmd: "ADD b0,1",
      setup: { reg: { "b0": 0xFF } },
      steps: { reg: { "b0": 0 }, flags: { c: true, z: true } }
    }
  ]);

  // ADD w,l
  commandTestData = commandTestData.concat([
    {
      cmd: "ADD w0,1",
      setup: { reg: { "w0": 0x02FA } },
      steps: { reg: { "w0": 0x02FB }, flags: { c: false, z: false } }
    },
    {
      cmd: "ADD w0,2",
      setup: { reg: { "w0": 0xFFFF } },
      steps: { reg: { "w0": 0x0001 }, flags: { c: true, z: false } }
    },
    {
      cmd: "ADD w0,1",
      setup: { reg: { "w0": 0xFFFF } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: true, z: true } }
    }
  ]);

  // ADD w,w
  commandTestData = commandTestData.concat([
    {
      cmd: "ADD w0,w1",
      setup: { reg: { "w0": 0x0A10, "w1": 0x01FF } },
      steps: { reg: { "w0": 0x0C0F }, flags: { c: false, z: false } }
    },
    {
      cmd: "ADD w0,w1",
      setup: { reg: { "w0": 0xFFFF, "w1": 0x0002 } },
      steps: { reg: { "w0": 0x0001 }, flags: { c: true, z: false } }
    },
    {
      cmd: "ADD w0,w1",
      setup: { reg: { "w0": 0xFFFF, "w1": 0x0001 } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: true, z: true } }
    }
  ]);

  // SUB b,b
  commandTestData = commandTestData.concat([
    {
      cmd: "SUB b0,b1",
      setup: { reg: { "b0": 2, "b1": 1 } },
      steps: { reg: { "b0": 1 }, flags: { c: false, z: false } }
    },
    {
      cmd: "SUB b0,b1",
      setup: { reg: { "b0": 1, "b1": 2 } },
      steps: { reg: { "b0": 255 }, flags: { c: true, z: false } }
    },
    {
      cmd: "SUB b0,b1",
      setup: { reg: { "b0": 1, "b1": 1 } },
      steps: { reg: { "b0": 0 }, flags: { c: false, z: true } }
    }
  ]);

  // SUB b,l
  commandTestData = commandTestData.concat([
    {
      cmd: "SUB b0,1",
      setup: { reg: { "b0": 2 } },
      steps: { reg: { "b0": 1 }, flags: { c: false, z: false } }
    },
    {
      cmd: "SUB b0,2",
      setup: { reg: { "b0": 1 } },
      steps: { reg: { "b0": 255 }, flags: { c: true, z: false } }
    },
    {
      cmd: "SUB b0,1",
      setup: { reg: { "b0": 1 } },
      steps: { reg: { "b0": 0 }, flags: { c: false, z: true } }
    }
  ]);

  // SUB w,l
  commandTestData = commandTestData.concat([
    {
      cmd: "SUB w0,1",
      setup: { reg: { "w0": 0xFF00 } },
      steps: { reg: { "w0": 0xFEFF }, flags: { c: false, z: false } }
    },
    {
      cmd: "SUB w0,1",
      setup: { reg: { "w0": 0x0000 } },
      steps: { reg: { "w0": 0xFFFF }, flags: { c: true, z: false } }
    },
    {
      cmd: "SUB w0,0x0F01",
      setup: { reg: { "w0": 0x0F01 } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: false, z: true } }
    }
  ]);

  // SUB w,w
  commandTestData = commandTestData.concat([
    {
      cmd: "SUB w0,w1",
      setup: { reg: { "w0": 0xFF00, "w1": 0x0001 } },
      steps: { reg: { "w0": 0xFEFF }, flags: { c: false, z: false } }
    },
    {
      cmd: "SUB w0,w1",
      setup: { reg: { "w0": 0x0000, "w1": 0x0001 } },
      steps: { reg: { "w0": 0xFFFF }, flags: { c: true, z: false } }
    },
    {
      cmd: "SUB w0,w1",
      setup: { reg: { "w0": 0x0F01, "w1": 0x0F01 } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: false, z: true } }
    }
  ]);

  // RR
  commandTestData = commandTestData.concat([
    {
      cmd: "RR b0",
      setup: { reg: { "b0": "01000000" } },
      steps: { reg: { "b0": "00100000" }, flags: { c: false, z: false } }
    },
    {
      cmd: "RR b0",
      setup: { reg: { "b0": "01000001" } },
      steps: { reg: { "b0": "00100000" }, flags: { c: true, z: false } }
    },
    {
      cmd: "RR w0",
      setup: { reg: { "w0": "00011111 11111000" } },
      steps: { reg: { "w0": "00001111 11111100" }, flags: { c: false, z: false } }
    },
    {
      cmd: "RR w0",
      setup: { reg: { "w0": "11111111 10101011" } },
      steps: { reg: { "w0": "01111111 11010101" }, flags: { c: true, z: false } }
    }
  ]);

  // RL
  commandTestData = commandTestData.concat([
    {
      cmd: "RL b0",
      setup: { reg: { "b0": "01000000" } },
      steps: { reg: { "b0": "10000000" }, flags: { c: false, z: false } }
    },
    {
      cmd: "RL b0",
      setup: { reg: { "b0": "10000000" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: true, z: false } }
    },
    {
      cmd: "RL w0",
      setup: { reg: { "w0": "01111111 10101010" } },
      steps: { reg: { "w0": "11111111 01010100" }, flags: { c: false, z: false } }
    },
    {
      cmd: "RL w0",
      setup: { reg: { "w0": "11111111 10101010" } },
      steps: { reg: { "w0": "11111111 01010100" }, flags: { c: true, z: false } }
    }
  ]);

  // CLR-Commands
  commandTestData = commandTestData.concat([
    {
      cmd: "CLR b0",
      setup: { reg: { "b0": 0xFF } },
      steps: { reg: { "b0": 0 }, flags: { c: false, z: true } }
    },
    {
      cmd: "CLR w0",
      setup: { reg: { "w0": 0xFFFF } },
      steps: { reg: { "w0": 0 }, flags: { c: false, z: true } }
    }
  ]);

  // INC b
  commandTestData = commandTestData.concat([
    {
      cmd: "INC b0",
      setup: { reg: { "b0": 0x00 } },
      steps: { reg: { "b0": 0x01 }, flags: { c: false, z: false } }
    },
    {
      cmd: "INC b0",
      setup: { reg: { "b0": 0xFF } },
      steps: { reg: { "b0": 0x00 }, flags: { c: true, z: true } }
    }
  ]);

  // INC w
  commandTestData = commandTestData.concat([
    {
      cmd: "INC w0",
      setup: { reg: { "w0": 0x0FFF } },
      steps: { reg: { "w0": 0x1000 }, flags: { c: false, z: false } }
    },
    {
      cmd: "INC w0",
      setup: { reg: { "w0": 0xFFFF } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: true, z: true } }
    }
  ]);

  // DEC b
  commandTestData = commandTestData.concat([
    {
      cmd: "DEC b0",
      setup: { reg: { "b0": 0x02 } },
      steps: { reg: { "b0": 0x01 }, flags: { c: false, z: false } }
    },
    {
      cmd: "DEC b0",
      setup: { reg: { "b0": 0x01 } },
      steps: { reg: { "b0": 0x00 }, flags: { c: false, z: true } }
    },
    {
      cmd: "DEC b0",
      setup: { reg: { "b0": 0x00 } },
      steps: { reg: { "b0": 0xFF }, flags: { c: true, z: false } }
    }
  ]);

  // DEC w
  commandTestData = commandTestData.concat([
    {
      cmd: "DEC w0",
      setup: { reg: { "w0": 0xFF00 } },
      steps: { reg: { "w0": 0xFEFF }, flags: { c: false, z: false } }
    },
    {
      cmd: "DEC w0",
      setup: { reg: { "w0": 0x0001 } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: false, z: true } }
    },
    {
      cmd: "DEC w0",
      setup: { reg: { "w0": 0x0000 } },
      steps: { reg: { "w0": 0xFFFF }, flags: { c: true, z: false } }
    }
  ]);

  // INV-Commands
  commandTestData = commandTestData.concat([
    {
      cmd: "INV b0",
      setup: { reg: { "b0": "00000001" } },
      steps: { reg: { "b0": "11111110" }, flags: { c:false, z: false } }
    },
    {
      cmd: "INV b0",
      setup: { reg: { "b0": "11111111" } },
      steps: { reg: { "b0": "00000000" }, flags: { c:false, z: true } }
    },
    {
      cmd: "INV w0",
      setup: { reg: { "w0": "00000000 00000001" } },
      steps: { reg: { "w0": "11111111 11111110" }, flags: { c:false, z: false } }
    },
    {
      cmd: "INV w0",
      setup: { reg: { "w0": "11111111 11111111" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c:false, z: true } }
    }
  ]);

  // OR b,b
  commandTestData = commandTestData.concat([
    {
      cmd: "OR b0,b1",
      setup: { reg: { "b0": "01010101",
                      "b1": "01000011" } },
      steps: { reg: { "b0": "01010111" }, flags: { c: false, z: false } }
    },
    {
      cmd: "OR b0,b1",
      setup: { reg: { "b0": "00000000",
                      "b1": "00000000" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // OR b,l
  commandTestData = commandTestData.concat([
    {
      cmd: "OR b0,67", // 01000011
      setup: { reg: { "b0": "01010101" } },
      steps: { reg: { "b0": "01010111" }, flags: { c: false, z: false } }
    },
    {
      cmd: "OR b0,0",
      setup: { reg: { "b0": "00000000" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // OR w,w
  commandTestData = commandTestData.concat([
    {
      cmd: "OR w0,w1",
      setup: { reg: { "w0": "01010101 10101010",
                      "w1": "01000011 11000010" } },
      steps: { reg: { "w0": "01010111 11101010" }, flags: { c: false, z: false } }
    },
    {
      cmd: "OR w0,w1",
      setup: { reg: { "w0": "00000000 00000000",
                      "w1": "00000000 00000000" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // OR w,l
  commandTestData = commandTestData.concat([
    {
      cmd: "OR w0,17346", // 01000011 11000010
      setup: { reg: { "w0": "01010101 10101010" } },
      steps: { reg: { "w0": "01010111 11101010" }, flags: { c: false, z: false } }
    },
    {
      cmd: "OR w0,0",
      setup: { reg: { "w0": "00000000 00000000" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // AND b,b
  commandTestData = commandTestData.concat([
    {
      cmd: "AND b0,b1",
      setup: { reg: { "b0": "01010101",
                      "b1": "01000011" } },
      steps: { reg: { "b0": "01000001" }, flags: { c: false, z: false } }
    },
    {
      cmd: "AND b0,b1",
      setup: { reg: { "b0": "11000000",
                      "b1": "00000011" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // AND b,l
  commandTestData = commandTestData.concat([
    {
      cmd: "AND b0,67", // 01000011
      setup: { reg: { "b0": "01010101" } },
      steps: { reg: { "b0": "01000001" }, flags: { c: false, z: false } }
    },
    {
      cmd: "AND b0,1",
      setup: { reg: { "b0": "10000000" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // AND w,w
  commandTestData = commandTestData.concat([
    {
      cmd: "AND w0,w1",
      setup: { reg: { "w0": "01010101 10101010",
                      "w1": "01000011 11000010" } },
      steps: { reg: { "w0": "01000001 10000010" }, flags: { c: false, z: false } }
    },
    {
      cmd: "AND w0,w1",
      setup: { reg: { "w0": "00100000 00000100",
                      "w1": "10000000 00000001" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // AND w,l
  commandTestData = commandTestData.concat([
    {
      cmd: "AND w0,17346", //01000011 11000010
      setup: { reg: { "w0": "01010101 10101010" } },
      steps: { reg: { "w0": "01000001 10000010" }, flags: { c: false, z: false } }
    },
    {
      cmd: "AND w0,514", //  00000010 00000010
      setup: { reg: { "w0": "00000100 00010000" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // XOR b,b
  commandTestData = commandTestData.concat([
    {
      cmd: "XOR b0,b1",
      setup: { reg: { "b0": "01010101",
                      "b1": "01000011" } },
      steps: { reg: { "b0": "00010110" }, flags: { c: false, z: false } }
    },
    {
      cmd: "XOR b0,b1",
      setup: { reg: { "b0": "11000000",
                      "b1": "11000000" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // XOR b,l
  commandTestData = commandTestData.concat([
    {
      cmd: "XOR b0,67", //   01000011
      setup: { reg: { "b0": "01010101" } },
      steps: { reg: { "b0": "00010110" }, flags: { c: false, z: false } }
    },
    {
      cmd: "XOR b0,3",
      setup: { reg: { "b0": "00000011" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // XOR w,w
  commandTestData = commandTestData.concat([
    {
      cmd: "XOR w0,w1",
      setup: { reg: { "w0": "01010101 10101010",
                      "w1": "01000011 11000010" } },
      steps: { reg: { "w0": "00010110 01101000" }, flags: { c: false, z: false } }
    },
    {
      cmd: "XOR w0,w1",
      setup: { reg: { "w0": "00100000 00000100",
                      "w1": "00100000 00000100" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // XOR w,l
  commandTestData = commandTestData.concat([
    {
      cmd: "XOR w0,17346", //01000011 11000010
      setup: { reg: { "w0": "01010101 10101010" } },
      steps: { reg: { "w0": "00010110 01101000" }, flags: { c: false, z: false } }
    },
    {
      cmd: "XOR w0,514",  // 00000010 00000010
      setup: { reg: { "w0": "00000010 00000010" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // CMP b,b
  commandTestData = commandTestData.concat([
    {
      cmd: "CMP b0,b1 ;equal",
      setup: { reg: { "b0": 1, "b1": 1 } },
      steps: { flags: { c: false, z: true } }
    },
    {
      cmd: "CMP b0,b1 ;1st bigger",
      setup: { reg: { "b0": 1, "b1": 0 } },
      steps: { flags: { c: false, z: false } }
    },
    {
      cmd: "CMP b0,b1 ;2nd bigger",
      setup: { reg: { "b0": 0, "b1": 1 } },
      steps: { flags: { c: true, z: false } }
    }
  ]);

  // CMP b,l
  commandTestData = commandTestData.concat([
    {
      cmd: "CMP b0,1 ;equal",
      setup: { reg: { "b0": 1 } },
      steps: { flags: { c: false, z: true } }
    },
    {
      cmd: "CMP b0,0 ;1st bigger",
      setup: { reg: { "b0": 1 } },
      steps: { flags: { c: false, z: false } }
    },
    {
      cmd: "CMP b0,1 ;2nd bigger",
      setup: { reg: { "b0": 0 } },
      steps: { flags: { c: true, z: false } }
    }
  ]);

  // CMP w,w
  commandTestData = commandTestData.concat([
    {
      cmd: "CMP w0,w1 ;equal",
      setup: { reg: { "w0": 0x0001, "w1": 0x0001 } },
      steps: { flags: { c: false, z: true } }
    },
    {
      cmd: "CMP w0,w1 ;1st bigger",
      setup: { reg: { "w0": 0xAB00, "w1": 0xAA00 } },
      steps: { flags: { c: false, z: false } }
    },
    {
      cmd: "CMP w0,w1 ;1st bigger",
      setup: { reg: { "w0": 0x0001, "w1": 0x0000 } },
      steps: { flags: { c: false, z: false } }
    },
    {
      cmd: "CMP w0,w1 ;2nd bigger",
      setup: { reg: { "w0": 0xAA00, "w1": 0xAB00 } },
      steps: { flags: { c: true, z: false } }
    },
    {
      cmd: "CMP w0,w1 ;2nd bigger",
      setup: { reg: { "w0": 0x0000, "w1": 0x0001 } },
      steps: { flags: { c: true, z: false } }
    }
  ]);

  // CMP w,l
  commandTestData = commandTestData.concat([
    {
      cmd: "CMP w0,0x0001 ;equal",
      setup: { reg: { "w0": 0x0001 } },
      steps: { flags: { c: false, z: true } }
    },
    {
      cmd: "CMP w0,0xAA00 ;1st bigger",
      setup: { reg: { "w0": 0xAB00 } },
      steps: { flags: { c: false, z: false } }
    },
    {
      cmd: "CMP w0,0x0000 ;1st bigger",
      setup: { reg: { "w0": 0x0001 } },
      steps: { flags: { c: false, z: false } }
    },
    {
      cmd: "CMP w0,0xAB00 ;2nd bigger",
      setup: { reg: { "w0": 0xAA00 } },
      steps: { flags: { c: true, z: false } }
    },
    {
      cmd: "CMP w0,0x0001 ;2nd bigger",
      setup: { reg: { "w0": 0x0000 } },
      steps: { flags: { c: true, z: false } }
    }
  ]);

  // MUL
  commandTestData = commandTestData.concat([
    {
      cmd: "MUL w0,w1",
      setup: { reg: { "w0": 0xFF10, "w1": 0xFF02 } },
      steps: { reg: { "w0": 0x0020 } }
    },
    {
      cmd: "MUL w0,w1",
      setup: { reg: { "w0": 0x00FF, "w1": 0x00FF } },
      steps: { reg: { "w0": 0xFE01 } }
    }
  ]);

  // DIV
  commandTestData = commandTestData.concat([
    {
      cmd: "DIV w0,w1",
      setup: { reg: { "w0": 0x00FA, "w1": 0xFF02 } },
      steps: { reg: { "w0": 0x7D } }
    },
    {
      cmd: "DIV w0,w1",
      setup: { reg: { "w0": 0xFF10, "w1": 0xFF02 } },
      steps: { reg: { "w0": 0x7F88 } }
    },
    {
      cmd: "DIV w0,w1",
      setup: { reg: { "w0": 0x000F, "w1": 0xFF02 } },
      steps: { reg: { "w0": 0x0007 } }
    }
  ]);

  // PUSH
  commandTestData = commandTestData.concat([
    {
      cmd: "PUSH b0",
      setup: { reg: { "b0": 0xFA } },
      steps: { reg: { "sp": 0 }, stack: { 0: 0xFA } }
    },
    {
      cmd: "PUSH w0",
      setup: { reg: { "w0": 0xFAFB } },
      steps: { reg: { "sp": 1 }, stack: { 0: 0xFB, 1: 0xFA } }
    }
  ]);

  // POP
  commandTestData = commandTestData.concat([
    {
      cmd: "POP b0",
      setup: { reg: { "sp": 0 }, stack: [0xFA] },
      steps: { reg: { "b0": 0xFA } }
    },
    {
      cmd: "POP w0",
      setup: { reg: { "sp": 1 }, stack: [0xFB, 0xFA] },
      steps: { reg: { "w0": 0xFAFB } }
    }
  ]);

  // Stack
  commandTestData = commandTestData.concat([
    {
      cmd: "PUSH b0\nPOP b1",
      setup: { reg: { "b0": 0xFA } },
      steps: [
        {},
        { reg: { "b1": 0xFA } }
      ]
    },
    {
      cmd: "PUSH w0\nPOP w1",
      setup: { reg: { "w0": 0xFAFB } },
      steps: [
        {},
        { reg: { "w1": 0xFAFB } }
      ]
    }
  ]);

  // JMP
  commandTestData = commandTestData.concat([
    {
      cmd: "JMP lbl\nDB 0xFF\nlbl:",
      setup: { },
      steps: [
        { reg: { "pc": 3 } }
      ]
    }
  ]);

  // JZ
  commandTestData = commandTestData.concat([
    {
      cmd: "JZ lbl\nDB 0xFF\nlbl:",
      setup: { flags: { z: false } },
      steps: [
        { reg: { "pc": 2 } }
      ]
    },
    {
      cmd: "JZ lbl\nDB 0xFF\nlbl:",
      setup: { flags: { z: true } },
      steps: [
        { reg: { "pc": 3 } }
      ]
    }
  ]);

  // JNZ
  commandTestData = commandTestData.concat([
    {
      cmd: "JNZ lbl\nDB 0xFF\nlbl:",
      setup: { flags: { z: false } },
      steps: [
        { reg: { "pc": 3 } }
      ]
    },
    {
      cmd: "JNZ lbl\nDB 0xFF\nlbl:",
      setup: { flags: { z: true } },
      steps: [
        { reg: { "pc": 2 } }
      ]
    }
  ]);

  // JC
  commandTestData = commandTestData.concat([
    {
      cmd: "JC lbl\nDB 0xFF\nlbl:",
      setup: { flags: { c: false } },
      steps: [
        { reg: { "pc": 2 } }
      ]
    },
    {
      cmd: "JC lbl\nDB 0xFF\nlbl:",
      setup: { flags: { c: true } },
      steps: [
        { reg: { "pc": 3 } }
      ]
    }
  ]);

  // JNC
  commandTestData = commandTestData.concat([
    {
      cmd: "JNC lbl\nDB 0xFF\nlbl:",
      setup: { flags: { c: false } },
      steps: [
        { reg: { "pc": 3 } }
      ]
    },
    {
      cmd: "JNC lbl\nDB 0xFF\nlbl:",
      setup: { flags: { c: true } },
      steps: [
        { reg: { "pc": 2 } }
      ]
    }
  ]);

  for (var i = 0; i < commandTestData.length; i++) {
    var test = commandTestData[i];

    test.title = test.cmd.replace('\n', ' / ');
    test.asm = assembler.assemble({ code: test.cmd, jobs: ["bitcode"] });
  }

  QUnit.cases(commandTestData).test("command", function (params) {
    if(params.asm.success === false)
      return ok(false, "Assembler failed");

    emulator.pc = 0;
    emulator.load(params.asm.bitcode, 0);

    var setup = params.setup;

    if(setup) {
      if(setup.reg) {
        for (var r in setup.reg) {
          var val = parseRegValue(setup.reg[r]);

          if(r.length < 2)
          {
            ok(false, "Invalid test: setup-register " + r);
            continue;
          }

          if(r == "pc") {
            emulator.pc = val;
          } else if (r == "sp") {
            emulator.sp = val;
          } else {
            var n = +r.substr(1);

            if(r.charAt(0) === "b")
              emulator.writeByteRegister(n, val);
            else if (r.charAt(0) === "w")
              emulator.writeWordRegister(n, val);
            else
            {
              ok(false, "Invalid test: setup-register " + r + " does not exist.");
            }
          }
        }
      }
      if(setup.stack) {
        emulator.stack = setup.stack;
      }
      if(setup.flags) {
        if(setup.flags.z)
          emulator.flags.z = true;
        if(setup.flags.c)
          emulator.flags.c = true;
      }
    }

    params.steps = params.steps || [];

    if(!(params.steps instanceof Array))
      params.steps = [params.steps];

    for (var i = 0; i < params.steps.length; i++) {
      var step = params.steps[i];

      emulator.tick();

      if(step.reg) {
        for (var r in step.reg) {
          var actual;
          var expected = parseRegValue(step.reg[r]);

          if(r.length < 2)
          {
            ok(false, "Invalid test: step-register " + r);
            continue;
          }

          if(r == "pc") {
            actual = emulator.pc;
          } else if (r == "sp") {
            actual = emulator.sp;
          } else {
            var n = +r.substr(1);

            if(r.charAt(0) === "b")
              actual = emulator.readByteRegister(n);
            else if (r.charAt(0) === "w")
              actual = emulator.readWordRegister(n);
            else
            {
              ok(false, "Invalid test: step-register " + r + " does not exist.");
              continue;
            }
          }

          strictEqual(actual, expected, "register " + r + " is " + expected);
        }
      }
      if(step.flags) {
        var flags = emulator.readFlags();

        for (var flag in flags) {
          var longname = "unknown";
          if(flag == "c")
            longname = "carry";
          if(flag == "z")
            longname = "zero";
          var msg = longname + " flag is " + (step.flags[flag] === true ? "set" : "not set");

          if(typeof step.flags[flag] === undefined && flags[flag] === false ||
             typeof step.flags[flag] !== undefined && flags[flag] == step.flags[flag])
            ok(true, msg);
          else
            ok(false, msg);
        }
      }
      if(step.ram) {
        alert("Step-RAM-Checking is not yet implemented")
      }
      if(step.rom) {
        alert("Step-ROM-Checking is not yet implemented")
      }
      if(step.pin) {
        alert("Step-PIN-Checking is not yet implemented")
      }
      if(step.stack) {
        for (var r in step.stack) {
          var expected = parseRegValue(step.stack[r]);
          var actual = emulator.stack[r];

          strictEqual(actual, expected, "stack-entry " + r + " is " + expected);
        }
      }
    }

    function parseRegValue (val) {
      if(typeof val === "string")
        return parseInt(val.replace(' ', ''), 2);
      return val;
    }
  });

})();

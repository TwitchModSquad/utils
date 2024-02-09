const StringUtils = require("../../src/utilities/StringUtils");
const utils = new StringUtils();

describe("stringGenerator", () => {
    test("returns empty string on 0 length", () => {
        expect(utils.stringGenerator(0)).toBe("");
    });
    
    test("returns string with length 16", () => {
        expect(utils.stringGenerator(16)).toHaveLength(16);
    });
    
    test("returns string with length 32", () => {
        expect(utils.stringGenerator(32)).toHaveLength(32);
    });
    
    test("returns string with length 256", () => {
        expect(utils.stringGenerator(256)).toHaveLength(256);
    });
    
    test("returns string with length 1024", () => {
        expect(utils.stringGenerator(1024)).toHaveLength(1024);
    });
});

describe("comma", () => {
    test("return '0' on 0 number", () => {
        expect(utils.comma(0)).toBe("0");
    });
    
    test("return '1,024' on 1024 number", () => {
        expect(utils.comma(1024)).toBe("1,024");
    });

    test("return '102,420' on 102420 number", () => {
        expect(utils.comma(102420)).toBe("102,420");
    });

    test("return '102,420,696' on 102420696 number", () => {
        expect(utils.comma(102420696)).toBe("102,420,696");
    });

    test("return '9,324,574,321,223' on 9324574321223 number", () => {
        expect(utils.comma(9324574321223)).toBe("9,324,574,321,223");
    });
});

describe("formatNumberSmall", () => {
    test("return '0' on 0 number", () => {
        expect(utils.formatNumberSmall(0)).toBe("0");
    });
    
    test("return '1.0K' on 1024 number", () => {
        expect(utils.formatNumberSmall(1024)).toBe("1.0K");
    });

    test("return '102.4K' on 102420 number", () => {
        expect(utils.formatNumberSmall(102420)).toBe("102.4K");
    });

    test("return '102.4M' on 102420696 number", () => {
        expect(utils.formatNumberSmall(102420696)).toBe("102.4M");
    });
});

describe("stringTable", () => {
    test("return '     Testing    123\\n   Test test   Test'", () => {
        expect(utils.stringTable([
            ["Testing","123"],
            ["Test test", "Test"],
        ])).toBe("     Testing    123\n   Test test   Test");
    });


    test("return '   Heading 1   Heading 2   Heading 3\\n       Row 1     Example     Example\\n       Row 2     Example     Example'", () => {
        expect(utils.stringTable([
            ["Heading 1","Heading 2", "Heading 3"],
            ["Row 1", "Example", "Example"],
            ["Row 2", "Example", "Example"],
        ])).toBe("   Heading 1   Heading 2   Heading 3\n       Row 1     Example     Example\n       Row 2     Example     Example");
    });
});

describe("formatTime", () => {
    let balls = new Date(2024,0,1);
    test("balls [midnight] (00:00:00)", () => {
        expect(utils.formatTime(balls)).toBe("00:00:00");
    });
    let noon = new Date(2024,0,1,12);
    test("noon (12:00:00)", () => {
        expect(utils.formatTime(noon)).toBe("12:00:00");
    });
    let singleDigits = new Date(2024,0,1,1,3,5);
    test("single digits (01:03:05)", () => {
        expect(utils.formatTime(singleDigits)).toBe("01:03:05");
    });
    let doubleDigits = new Date(2024,0,1,22,33,44);
    test("double digits (22:33:44)", () => {
        expect(utils.formatTime(doubleDigits)).toBe("22:33:44");
    });
});

describe("parseDay", () => {
    test("sunday (0)", () => {
        expect(utils.parseDay(0)).toBe("Sun");
    });
    test("wednesday (3)", () => {
        expect(utils.parseDay(3)).toBe("Wed");
    });
    test("saturday (6)", () => {
        expect(utils.parseDay(6)).toBe("Sat");
    });
});

describe("parseDate", () => {
    let balls = new Date(2024,0,1);
    test("Mon 01.01.2024 00:00:00", () => {
        expect(utils.parseDate(balls)).toBe("Mon 01.01.2024 00:00:00");
    });
    let noon = new Date(2024,0,1,12);
    test("Mon 01.01.2024 12:00:00", () => {
        expect(utils.parseDate(noon)).toBe("Mon 01.01.2024 12:00:00");
    });
    let singleDigits = new Date(2024,0,1,1,3,5);
    test("Mon 01.01.2024 01:03:05", () => {
        expect(utils.parseDate(singleDigits)).toBe("Mon 01.01.2024 01:03:05");
    });
    let doubleDigits = new Date(2024,0,1,22,33,44);
    test("Mon 01.01.2024 22:33:44", () => {
        expect(utils.parseDate(doubleDigits)).toBe("Mon 01.01.2024 22:33:44");
    });
});

describe("formatElapsed", () => {
    test("1 second", () => {
        expect(utils.formatElapsed(1)).toBe("00:00:01");
    });
    test("23 minutes 32 seconds (1412 seconds)", () => {
        expect(utils.formatElapsed(1412)).toBe("00:23:32");
    });
    test("742 hours 11 minutes 59 seconds (2671919 seconds)", () => {
        expect(utils.formatElapsed(2671919)).toBe("742:11:59");
    });
});

describe("escapeRegExp", () => {
    const allRegex = "[].*+?^${}()|\\";
    test("all regex", () => {
        expect(utils.escapeRegExp(allRegex)).toBe("");
    });
    const mixed = "this Contains ? S*ome (REGEX)";
    test("some regex", () => {
        expect(utils.escapeRegExp(mixed)).toBe("this Contains  Some REGEX");
    });
});

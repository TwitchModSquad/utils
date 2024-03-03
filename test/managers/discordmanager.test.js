const utils = require("../testUtils");

describe("getUserById", () => {
    test("should return user on valid ID", async () => {
        const ids = ["267380687345025025"];
        const properties = [
            "_id",
            "globalName",
            "displayName",
            "discriminator",
            "updated_at",
        ];

        for (let i = 0; i < ids.length; i++) {
            const data = await utils.Managers.Discord.getUserById(ids[i], false, true);

            for (let p = 0; p < properties.length; p++) {
                expect(data).toHaveProperty(properties[p]);
            }
        }
    });

    test("should throw error on invalid ID", async () => {
        const ids = ["test"];
        
        expect.assertions(ids.length);

        for (let i = 0; i < ids.length; i++) {
            try {
                await utils.Managers.Discord.getUserById(ids[i]);
            } catch(err) {
                expect(err).toMatch("User not found!");
            }
        }
    });
});

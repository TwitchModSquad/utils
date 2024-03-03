const utils = require("../testUtils");

describe("getUserById", () => {
    test("should return user on valid ID", async () => {
        const ids = ["176442256","9528182"];
        const properties = [
            "_id",
            "login",
            "display_name",
            "type",
            "broadcaster_type",
            "created_at",
            "offline_image_url",
            "profile_image_url",
            "updated_at",
        ];

        for (let i = 0; i < ids.length; i++) {
            const data = await utils.Managers.Twitch.getUserById(ids[i], false, true);

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
                await utils.Managers.Twitch.getUserById(ids[i])
            } catch(err) {
                expect(err).toMatch("User not found!");
            }
        }
    });
});

describe("getUserByName", () => {
    test("should return user on valid name", async () => {
        const names = ["devtwijn","chilledchaos"];
        const properties = [
            "_id",
            "login",
            "display_name",
            "type",
            "broadcaster_type",
            "created_at",
            "offline_image_url",
            "profile_image_url",
            "updated_at",
        ];

        for (let i = 0; i < names.length; i++) {
            const data = await utils.Managers.Twitch.getUserByName(names[i]);

            for (let p = 0; p < properties.length; p++) {
                expect(data).toHaveProperty(properties[p]);
            }
        }
    });

    test("should throw error on invalid name", async () => {
        const names = ["x","test"];
        
        expect.assertions(names.length);

        for (let i = 0; i < names.length; i++) {
            try {
                await utils.Managers.Twitch.getUserByName(names[i])
            } catch(err) {
                expect(err).toMatch("User not found!");
            }
        }
    });
});

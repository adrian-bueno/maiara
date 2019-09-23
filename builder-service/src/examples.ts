import dotenv = require("dotenv");
import Docker = require("dockerode");
import getPort = require("get-port");
import { MongoClient } from "mongodb";

import { Context, transformMapToObject, AssistantActiveServices } from '@maiara/core';
import { MinioStorage, MinioStorageConfig } from '@maiara/minio';


dotenv.config();


// const docker = new Docker({
//     protocol: "http",
//     host: process.env.DOCKER_HOST || "localhost",
//     port: process.env.DOCKER_PORT || 2376
// });
//
// docker.createContainer({
//     Image: 'maiara/builder-webapp',
//     AttachStdin: false,
//     AttachStdout: false,
//     AttachStderr: false,
//     HostConfig: {
//         PortBindings: {
//             "80/tcp": [
//                 {
//                     HostPort: "3080"
//                 }
//             ]
//         }
//     }
// }).then(container => {
//
//     return container.start();
// }).then(container => {
//     console.log(`Container ${container.id} started`);
// }).catch(error => {
//     console.error(error);
// });

// _______________________________________________


//
const minio = new MinioStorage({
    bucket: "maiara",
    accessKey: "vidsH98hjAKJ",
    secretKey: "jy0n0ASkjs623823jaJAKJSNJKD29239ihK",
    endpoint: "localhost",
    port: 9000,
    useSSL: false
});


// minio.getAssistant("").then(object => {
//     console.log("[minio]---------------------");
//     console.log(object);
//     console.log("----------------------------");
// })

// minio.listAssistantEnvironments("myassistant").then(environments => {
//     console.log("[environments]---------------------");
//     console.log(environments);
//     console.log("----------------------------");
// })

// minio.listSkillVersions("myskill").then(list => {
//     console.log("[listSkillVersions]---------------------");
//     console.log(list);
//     console.log("----------------------------");
// })

// minio.listSkillLanguages("myskill", "develop").then(list => {
//     console.log("[languages]---------------------");
//     console.log(list);
//     console.log("----------------------------");
// })

// minio.saveAssistant({
//     id: "myassistant",
//     name: "My Assistant"
// })


// minio.getSkill("myskill", "develop", "en").then(skill => {
//     console.log("[skill]---------------------");
//     console.log(JSON.stringify(skill, null, 4));
//     console.log("-----------------------------------");
// }).catch(error => {
//     console.log(JSON.stringify(error))
// })

// minio.getSkillOnlyDialog("myskill", "develop", "en").then(skill => {
//     console.log("[skill]---------------------");
//     console.log(JSON.stringify(skill, null, 4));
//     console.log("-----------------------------------");
// }).catch(error => {
//     console.log(JSON.stringify(error))
// })

// minio.getMultilanguageSkill("myskill", "develop").then(skill => {
//     console.log("[MultiLanguageSkill]---------------------");
//     console.log(JSON.stringify(skill, null, 4));
//     console.log("********");
//     console.log(JSON.stringify(transformMapToObject(skill.skills), null, 4));
//     console.log("-----------------------------------");
// }).catch(error => {
//     console.log(JSON.stringify(error))
// })

// minio.getMultilanguageSkillOnlyDialog("myskill", "develop").then(skill => {
//     console.log("[MultiLanguageSkill]---------------------");
//     console.log(JSON.stringify(skill, null, 4));
//     console.log("********");
//     console.log(JSON.stringify(transformMapToObject(skill.skills), null, 4));
//     console.log("-----------------------------------");
// }).catch(error => {
//     console.log(JSON.stringify(error))
// })


// _______________________________________________



const mongoUrl = `mongodb://${process.env.MONGODB_HOST || "localhost"}:${process.env.MONGODB_PORT || "27017"}`

const mongodb = new MongoClient(mongoUrl);

mongodb.connect()
    .then(() => {
        console.log("Connected successfully to server");
        return mongodb.db(process.env.MONGODB_DATABASE)
    })
    .then(async db => {

        // const collection = db.collection("context");

        // const context: Context = {
        //     currentNodeId: "nodeId",
        //     currentSkillId: "skillId",
        //     language: "en",
        //     variables: new Map()
        // }
        //
        // context.variables.set("name", "Roberto");
        // context.variables.set("age", "24");
        //
        // const res = await collection.updateOne(
        //     { _id: "assistantId_channelId_userId" },
        //     {
        //         $set: {
        //             // _id: "assistantId_channelId_userId",
        //             context: context
        //         }
        //     },
        //     {
        //         upsert: true // insert if doesnt exist
        //     }
        // );
        //
        // console.log("res", res.result);
        //
        // const find = await collection.find({ _id: "assistantId_channelId_userId" });
        // const findRes = await find.toArray();
        //
        // console.log("findRes", JSON.stringify(findRes));


        /////////////////

        const servicesCollection = db.collection("services");

        const assistantActiveServices: AssistantActiveServices = {
            environmentId: "develop",
            skills: [
                {
                    dockerContainerId: "1132123",
                    endpoint: "http://localhost:5000/nlu",
                    language: "en",
                    skillId: "myskill"
                }
            ],
            dialog: {
                dockerContainerId: "1234"
            }
        }

        const res2 = await servicesCollection.replaceOne( // updateOne
            { _id: "myassistant_develop" }, // assistantId_environmentId
            {
                $set: assistantActiveServices
            },
            {
                upsert: true // insert if doesnt exist
            }
        );

        const find2 = await servicesCollection.find({ _id: "myassistant_develop" });
        const findRes2 = await find2.toArray();

        console.log("findRes2", JSON.stringify(findRes2));


        mongodb.close();

    })
    .catch(error => {
        mongodb.close();
        console.error(error);
    });




// setTimeout(() => {
//     console.log("asad");
// },1111111111);

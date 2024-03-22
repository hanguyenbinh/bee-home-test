import { Test, TestingModule } from "@nestjs/testing";
import { MongoMemoryServer } from "mongodb-memory-server";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import mongoose, { Connection, connect, Model, Types } from "mongoose";
import { getModelToken } from "@nestjs/mongoose";
import { User, UserSchema } from "./schemas/user.schema";
import { Comment, CommentSchema } from "./schemas/comment.schema";
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { isNotEmptyObject } from "class-validator";
import { randomInteger } from "./common/functions.common";
import * as moment from 'moment'

const profiles = [
  {
    "_id": 'a0a37d46-e18d-48f1-9bf5-5e14124435e3',
    "name": "A Martinez",
    "description": "Adolph Larrue Martinez III.",
    "mbti": "ISFJ",
    "enneagram": "9w3",
    "variant": "sp/so",
    "tritype": 725,
    "socionics": "SEE",
    "sloan": "RCOEN",
    "psyche": "FEVL",
    "image": "https://soulverse.boo.world/images/1.png",
  },
];
let newUsers = [];

let comments = [
]

const mbti = ['INFP', 'INFJ', 'ENFP', 'ENFJ', 'INTJ', 'INTP', 'ENTP', 'ENTJ', 'ISFP', 'ISFJ', 'ESFP', 'ESFJ', 'ISTP', 'ISTJ', 'ESTP', 'ESTJ']
const enneagram = ['1w2', '2w3', '3w2', '3w4', '4w3', '4w5', '5w4', '5w6', '6w5', '6w7', '7w6', '7w8', '8w7', '8w9', '9w8', '9w1']
const zodiac = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']

describe("AppController", () => {
  let appController: AppController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;
  let commentModel: Model<Comment>;


  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);
    commentModel = mongoConnection.model(Comment.name, CommentSchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Comment.name), useValue: commentModel },
      ],
    }).compile();
    appController = app.get<AppController>(AppController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    // const collections = mongoConnection.collections;
    // for (const key in collections) {
    //   const collection = collections[key];
    //   await collection.deleteMany({});
    // }
  });

  describe("post create-profile", () => {
    it("should return the saved object", async () => {
      const user = await appController.createProfile(profiles[0]);
      profiles[0]._id = user._id;
      expect(user.name).toBe(profiles[0].name);
    });
    it("should return existing profile", async () => {
      const user = await appController.getProfile(profiles[0]._id);
      // console.log(user);
      expect(user).toBeDefined();
      expect(user._id).toBe(profiles[0]._id);
    });
    it("should return null", async () => {
      const user = await appController.getProfile(uuidv4());
      expect(user).toBeNull();
    });
  });

  describe("get profiles", () => {
    it("should return the saved objects", async () => {
      const jobs = [];
      for (let i = 0; i < 100; i++) {
        const user = {
          "_id": uuidv4(),
          "name": faker.person.fullName(),
          "description": faker.lorem.words(5),
          "mbti": mbti[randomInteger(1, mbti.length) - 1],
          "enneagram": enneagram[randomInteger(1, enneagram.length) - 1],
          "variant": "sp/so",
          "tritype": randomInteger(500, 999),
          "socionics": faker.lorem.words(1),
          "sloan": faker.lorem.word(1),
          "psyche": faker.lorem.words(1),
          "image": faker.image.url(),
        }
        jobs.push((new userModel(user)).save());
      }
      newUsers = await Promise.all(jobs);
      const users = await appController.getProfiles();
      expect(users).toHaveLength(101);
    });
  });

  describe("post comment", () => {
    it("should return the saved objects", async () => {
      const jobs = [];
      for (let i = 0; i < 1000; i++) {
        const profile = newUsers[randomInteger(1, newUsers.length) - 1];
        // console.log('profile', profile._id);
        const comment = {
          "userId": newUsers[randomInteger(1, newUsers.length) - 1],
          "content": faker.lorem.paragraph(),
          "mbti": mbti[randomInteger(1, mbti.length) - 1],
          "enneagram": enneagram[randomInteger(1, enneagram.length) - 1],
          "zodiac": zodiac[randomInteger(1, zodiac.length) - 1],
        };
        jobs.push(appController.createComment(profile._id, comment));
      }
      comments = (await Promise.all(jobs)).filter(item => item.data && isNotEmptyObject(item.data)).map(item => item.data);
      expect(comments).toHaveLength(1000);
    });

  });

  describe("get comments api", () => {
    it("should return the sorted array by best", async () => {
      const userId = newUsers[randomInteger(1, newUsers.length) - 1]._id;
      const allUsers = await userModel.find();
      const allComments = await commentModel.find({ profile: userId });
      const jobs = []
      for (let i = 0; i < 5000; i++) {
        const user = allUsers[randomInteger(1, allUsers.length) - 1];
        const comment = allComments[randomInteger(1, allComments.length) - 1]
        jobs.push(commentModel.findByIdAndUpdate(comment._id, {
          updatedAt: new Date(),
          $push: {
            like: user._id,
          },
          $inc: {
            likeCount: 1
          }
        }))
      }
      await Promise.all(jobs);
      const updatedComments = await commentModel.find({ profile: userId });
      const sorted = updatedComments.sort((a, b) => {
        const numberA = a.likeCount || 0
        const numberB = b.likeCount || 0
        return numberB > numberA ? 1 : -1
      })
      //manually count
      const filteredComments = await appController.getComments(userId, '', '', 'Best')
      // const idA = filteredComments[0]._id
      // const idB = sorted[0]._id;
      // const commentAinB = sorted.find(item=>item._id == idA)
      // const commentBinA = filteredComments.find(item=>item._id == idB)
      expect(filteredComments.length).toBe(sorted.length);
      expect(filteredComments[0].likeCount).toBe(sorted[0].likeCount);
      expect(filteredComments[filteredComments.length - 1].likeCount || 0).toBe(sorted[sorted.length - 1].likeCount || 0);
    }, 50000);

    it("should return sorted array by Recent", async () => {
      const userId = newUsers[randomInteger(1, newUsers.length) - 1]._id;
      const allComments = await commentModel.find({ profile: userId });

      const sorted = allComments.sort((a, b) => {
        const numberA = a.createdAt ? (new Date(a.createdAt)).getTime() : 0
        const numberB = b.createdAt ? (new Date(b.createdAt)).getTime() : 0
        return numberB > numberA ? 1 : -1
      })

      const result = await appController.getComments(userId, '', '', 'Recent')
      console.log(typeof result[0].createdAt);    
      expect(result.length).toBe(sorted.length);
      expect(moment(result[0].createdAt).format('YYYY-MM-DD HH:mm:ss')).toBe(moment(sorted[0].createdAt).format('YYYY-MM-DD HH:mm:ss'));
      expect(moment(result[result.length - 1].createdAt).format('YYYY-MM-DD HH:mm:ss')).toBe(moment(sorted[sorted.length - 1].createdAt).format('YYYY-MM-DD HH:mm:ss'));
    });

    it("should return only mbti comment", async () => {
      const userId = newUsers[randomInteger(1, newUsers.length) - 1]._id;
      const allComments = await commentModel.find({ profile: userId });
      const mbtiValue = mbti[randomInteger(1, mbti.length) - 1];
      const result = await appController.getComments(userId, 'MBTI', mbtiValue, '')
      const filtered = allComments.filter(item => item.mbti == mbtiValue)
      expect(result.length).toBe(filtered.length);
    });
    it("should return only enneagram comment", async () => {
      const userId = newUsers[randomInteger(1, newUsers.length) - 1]._id;
      const allComments = await commentModel.find({ profile: userId });
      const enneagramValue = enneagram[randomInteger(1, enneagram.length) - 1];
      const result = await appController.getComments(userId, 'Enneagram', enneagramValue, '')
      const filtered = allComments.filter(item => item.enneagram == enneagramValue)
      expect(result.length).toBe(filtered.length);
    });

    it("should return only zodiac comment", async () => {
      const userId = newUsers[randomInteger(1, newUsers.length) - 1]._id;
      const allComments = await commentModel.find({ profile: userId });
      const zodiacValue = zodiac[randomInteger(1, zodiac.length) - 1];
      const result = await appController.getComments(userId, 'Zodiac', zodiacValue, '')
      const filtered = allComments.filter(item => item.zodiac == zodiacValue)
      expect(result.length).toBe(filtered.length);
    });
  });
});
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './schemas/comment.schema';
import { CreateLikeDto } from './dto/create-like.dto';
import { isEmpty } from 'class-validator';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { randomInteger } from './common/functions.common';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    // private configService: ConfigService,
  ) {

  }
  async getProfile(id: string) {
    // console.log('getProfile', id)
    // return this.userModel.find();
    return this.userModel.findOne({ _id: id }).populate({
      path: 'comments',
      // model: 'CommentSchema',
      populate: {
        path: 'profile',
        // model: 'UserSchema',
        select: {
          'name': 1,
          '_id': 1
        }
      }
    });
  }

  async getProfiles() {
    return this.userModel.find();
  }

  async createProfile(input: CreateUserDto) {
    const user = new this.userModel(input);
    return user.save();
  }
  async updateProfile(id: string, input: CreateUserDto) {
    return this.userModel.findByIdAndUpdate(id, input);
  }
  async createComment(id: string, input: CreateCommentDto) {
    // console.log('create comment', id, input);
    const user = await this.userModel.findOne({ _id: id });
    if (!user) return {
      status: false,
      message: 'USER_NOT_FOUND'
    }
    const comment = new this.commentModel({ ...input, profile: user, createdAt: new Date() });
    const result = await comment.save();
    return {
      status: true,
      message: 'COMMENT_ADDED',
      data: result
    }
  }

  async createLike(id: string, input: CreateLikeDto) {
    return this.commentModel.findByIdAndUpdate(id, {
      updatedAt: new Date(),
      $push: {
        like: input.userId,
      },
      $inc: {
        likeCount: 1
      }
    });
  }

  async removeLike(id: string, input: CreateLikeDto) {
    return this.commentModel.findByIdAndUpdate(id, {
      updatedAt: new Date(),
      $pull: {
        like: input.userId,
      },
      $inc: {
        likeCount: -1
      }
    });
  }

  async getComments(profileId: string, filter: string, filterValue: string, sort: string) {
    console.log(profileId, filter, filterValue, sort);
    const conditions: any = {
      "profile._id": profileId
    }
    // filterValue = 'ENFJ';
    const aggregateOptions: any[] = [
      {
        $lookup: {
          from: "users",    //must be PHYSICAL collection name
          localField: "profile",
          foreignField: "_id",
          as: "profile",
        },
      },
      // { "$unwind": "$profile" },

    ]
    if (!isEmpty(filter) && !isEmpty(filterValue)) {
      switch (filter) {
        case 'MBTI': {
          conditions.mbti = filterValue;
          break;
        }
        case 'Enneagram': {
          conditions.enneagram = filterValue;
          break;
        }
        case 'Zodiac': {
          conditions.zodiac = filterValue;
          break;
        }
      }

    }
    aggregateOptions.push({
      $match: conditions
    })

    if (sort == 'Recent') {
      aggregateOptions.push({
        $sort: {
          createdAt: -1
        }
      })
    }
    else if (sort == 'Best') {
      aggregateOptions.push({
        $sort: {
          likeCount: -1
        }
      })
    }
    console.log('aggregateOptions', aggregateOptions)
    return this.commentModel.aggregate(aggregateOptions);
  }

  async generateData() {
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
      jobs.push((new this.userModel(user)).save());
    }
    newUsers = await Promise.all(jobs);
    const jobs1 = [];
    for (let i = 0; i < 1000; i++) {
      const profile = newUsers[randomInteger(1, newUsers.length) - 1];
      const comment = {
        "userId": newUsers[randomInteger(1, newUsers.length) - 1],
        "content": faker.lorem.paragraph(),
        "mbti": mbti[randomInteger(1, mbti.length) - 1],
        "enneagram": enneagram[randomInteger(1, enneagram.length) - 1],
        "zodiac": zodiac[randomInteger(1, zodiac.length) - 1],
      };
      jobs1.push(this.createComment(profile._id, comment));
    }
    comments = (await Promise.all(jobs))
  }

  async generateLike() {
    const users = await this.userModel.find();
    const comments = await this.commentModel.find();
    const jobs = []
    for (let i = 0; i < 5000; i++) {
      const user = users[randomInteger(1, users.length) - 1];
      const comment = comments[randomInteger(1, comments.length) - 1]
      jobs.push(this.commentModel.findByIdAndUpdate(comment._id, {
        updatedAt: new Date(),
        $push: {
          like: user._id,
        },
        $inc: {
          likeCount: 1
        }
      }))
    }
    return Promise.all(jobs);
  }

}

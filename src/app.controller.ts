import { Controller, Get, Param, ParseUUIDPipe, Res, Render, Post, Body, Redirect, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateLikeDto } from './dto/create-like.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }
  @Get('generate-data')
  async generateData(){
    return this.appService.generateData();
  }

  @Get('generate-like')
  async generateLikeData(){
    return this.appService.generateLike();
  }

  @Get()
  @Redirect('list-profile')
  get() { }

  @Get('add-profile')
  @Render('add-profile')
  addProfile() {
  }
  @Get('list-profile')
  @Render('list-profiles')
  async getAllProfiles() {
    const profiles = await this.appService.getProfiles();
    // console.log(profiles);
    return { profiles }
  }

  @Get('edit-profile/:id')
  @Render('edit-profile')
  async editProfile(@Param('id', ParseUUIDPipe) id: string) {
    const profile = await this.appService.getProfile(id);
    return { profile }
  }

  


  @Get('view-profile/:id')
  async getProfileMVC(@Param('id', ParseUUIDPipe) id: string, @Query('filter') filter: string, @Query('filter_value') filterValue: string, @Query('sort') sort: string, @Res() res: Response) {
    const user = await this.appService.getProfile(id);
    const comments = await this.appService.getComments(id, filter, filterValue, sort);
    console.log(comments);
    // console.log('get user by id', user)
    return user ? res.render('profile_template', {
      profile: user, filters: [
        { name: 'All', url: '/view-profile/' + id + '?filter=All&filter_value=' + filterValue + (sort ? '&sort=' + sort : '') },
        { name: 'MBTI', url: '/view-profile/' + id + '?filter=MBTI&filter_value=' + filterValue + (sort ? '&sort=' + sort : '') },
        { name: 'Enneagram', url: '/view-profile/' + id + '?filter=Enneagram&filter_value=' + filterValue + (sort ? '&sort=' + sort : '') },
        { name: 'Zodiac', url: '/view-profile/' + id + '?filter=Zodiac&filter_value=' + filterValue + (sort ? '&sort=' + sort : '') },
      ],
      sorts: [
        { name: 'Best', url: '/view-profile/' + id + '?sort=Best' + (filter ? '&filter=' + filter + '&filter_value=' + filterValue : '') },
        { name: 'Recent', url: '/view-profile/' + id + '?sort=Recent' + (filter ? '&filter=' + filter + '&filter_value=' + filterValue: '') },
      ],
      filter: filter || 'All',
      sort,
      filterValue
    }) : res.render('profile_not_found');
  }

  @Post('create-profile')
  async createProfileMVC(@Body() input: CreateUserDto, @Res() res: Response) {
    const user = await this.appService.createProfile(input);
    res.redirect(`/${user._id}`);
  }

  @Post('update-profile/:id')
  async updateProfile(@Param('id', ParseUUIDPipe) id: string, @Body() input: CreateUserDto, @Res() res: Response) {
    const user = await this.appService.createProfile(input);
    res.redirect(`/list-profile`);
  }

  //restful

  @Get('profile')
  async getProfiles() {
    return this.appService.getProfiles();
  }


  @Get('profile/:profileId')
  async getProfile(@Param('profileId', ParseUUIDPipe) profileId: string) {
    return this.appService.getProfile(profileId);
  }

  @Get('comments/:profileId')
  async getComments(@Param('profileId', ParseUUIDPipe) profileId: string, @Query('filter') filter: string, @Query('filter_value') filterValue: string, @Query('sort') sort: string) {
    return this.appService.getComments(profileId, filter, filterValue, sort)
  }

  
  @Post('profile')
  async createProfile(@Body() input: CreateUserDto) {
    return this.appService.createProfile(input);
  }

  @Post('comment/:id')
  async createComment(@Param('id', ParseUUIDPipe) id: string, @Body() input: CreateCommentDto) {
    return this.appService.createComment(id, input);
  }

  @Post('like/:commentId')
  async createLike(@Param('commentId', ParseUUIDPipe) commentId: string, @Body() input: CreateLikeDto) {
    return this.appService.createLike(commentId, input);
  }


  @Post('unlike/:commentId')
  async removeLike(@Param('commentId', ParseUUIDPipe) commentId: string, @Body() input: CreateLikeDto) {
    return this.appService.removeLike(commentId, input);
  }


}

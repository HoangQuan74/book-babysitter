import { Controller } from '@nestjs/common';
import { PostService } from './post.service';
import { MessagePattern } from '@nestjs/microservices';
import { IQuery, IRequestUser } from '@lib/common/interfaces';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @MessagePattern({
    cmd: PostController.prototype.getListPost.name,
  })
  getListPost(data) {
    return this.postService.getListPost(data);
  }

  @MessagePattern({
    cmd: PostController.prototype.getNotificationPostList.name,
  })
  getNotificationPostList(payload: { reqUser: IRequestUser; query: IQuery }) {
    const { reqUser, query } = payload;
    return this.postService.getNotificationPostList(reqUser, query);
  }

  @MessagePattern({
    cmd: PostController.prototype.getListUserPost.name,
  })
  getListUserPost(data) {
    return this.postService.getListUserPost(data);
  }

  @MessagePattern({
    cmd: PostController.prototype.getPostType.name,
  })
  getPostType(data) {
    return this.postService.getPostType(data);
  }

  @MessagePattern({
    cmd: PostController.prototype.getPostCategory.name,
  })
  getPostCategory(data) {
    return this.postService.getPostCategory(data);
  }

  @MessagePattern({
    cmd: PostController.prototype.createPost.name,
  })
  createPost(data) {
    return this.postService.createPost(data);
  }

  @MessagePattern({
    cmd: PostController.prototype.getPostDetail.name,
  })
  getPostDetail(data) {
    return this.postService.getPostDetail(data);
  }

  @MessagePattern({
    cmd: PostController.prototype.updatePost.name,
  })
  updatePost(data) {
    return this.postService.updatePost(data);
  }

  @MessagePattern({
    cmd: PostController.prototype.updateUserPost.name,
  })
  updateUserPost(data) {
    return this.postService.updateUserPost(data);
  }

  @MessagePattern({
    cmd: PostController.prototype.searchPost.name,
  })
  searchPost(data) {
    return this.postService.searchPost(data);
  }

  @MessagePattern({
    cmd: PostController.prototype.deletePost.name,
  })
  deletePost(data) {
    return this.postService.deletePost(data);
  }

  @MessagePattern({
    cmd: PostController.prototype.getHistorySearch.name,
  })
  getHistorySearch(data) {
    return this.postService.getHistorySearch(data);
  }

  @MessagePattern({
    cmd: PostController.prototype.deleteSearchHistory.name,
  })
  deleteSearchHistory(data) {
    return this.postService.deleteSearchHistory(data);
  }

  @MessagePattern({
    cmd: PostController.prototype.getMyPost.name,
  })
  getMyPost(payload: { reqUser: IRequestUser; query: IQuery }) {
    const { reqUser, query } = payload;
    return this.postService.getListUserPostByUserId(query, reqUser.userId);
  }

  @MessagePattern({
    cmd: PostController.prototype.getListUserPostByUserId.name,
  })
  getListUserPostByUserId(payload: { query: IQuery; userId: string }) {
    const { query, userId } = payload;
    return this.postService.getListUserPostByUserId(query, userId);
  }

  @MessagePattern({
    cmd: PostController.prototype.getPostById.name,
  })
  getPostById(payload: { reqUser: IRequestUser; id: string }) {
    const { reqUser, id } = payload;
    return this.postService.getPostById(reqUser, id);
  }

  @MessagePattern({
    cmd: PostController.prototype.getPostReacted.name,
  })
  getPostReacted(payload: { reqUser: IRequestUser; query: IQuery }) {
    const { reqUser, query } = payload;
    return this.postService.getPostReacted(reqUser, query);
  }
}

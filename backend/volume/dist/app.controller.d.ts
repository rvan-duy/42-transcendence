import { UserService } from './user.service';
import { PostService } from './post.service';
import { User as UserModel, Post as PostModel } from '@prisma/client';
export declare class AppController {
    private readonly userService;
    private readonly postService;
    constructor(userService: UserService, postService: PostService);
    getCat(): string;
    getPostById(id: string): Promise<PostModel>;
    getPublishedPosts(): Promise<PostModel[]>;
    getFilteredPosts(searchString: string): Promise<PostModel[]>;
    createDraft(postData: {
        title: string;
        content?: string;
        authorEmail: string;
    }): Promise<PostModel>;
    signupUser(userData: {
        name?: string;
        email: string;
    }): Promise<UserModel>;
    publishPost(id: string): Promise<PostModel>;
    deletePost(id: string): Promise<PostModel>;
}

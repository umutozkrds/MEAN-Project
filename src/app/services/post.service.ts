import { Injectable } from "@angular/core";
import { Blog } from "../models/blog.model";
import { BehaviorSubject, map, Observable, Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { title } from "node:process";

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: Blog[] = [];
  private postsUpdated = new BehaviorSubject<{ posts: Blog[], sumPosts: number }>({ posts: [], sumPosts: 0 });
  private currentPage = 1;
  private pageSize = 2;

  constructor(private http: HttpClient) { }

  getPosts(pageSize: number, currentPage: number) {
    this.currentPage = currentPage;
    this.pageSize = pageSize;
    const queryParams = `?pageSize=${pageSize}&page=${currentPage}`
    this.http.get<{ message: string, posts: any, sumPost: number }>('http://localhost:3000/api/posts' + queryParams)
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map((post: any) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator
              };
            }),
            sumPosts: postData.sumPost
          };
        })
      )
      .subscribe((transformedPostData) => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          sumPosts: transformedPostData.sumPosts
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string, creator: string }>('http://localhost:3000/api/posts/' + id)
      .pipe(
        map(postData => {
          return {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator
          };
        })
      );
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: FormData | Blog;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: undefined
      };
    }
    this.http.put<{ message: string }>('http://localhost:3000/api/posts/' + id, postData)
      .subscribe(response => {
        if (response.message === "updated!") {
          this.getPosts(this.pageSize, this.currentPage);
        }
      });
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image);
    this.http.post<{ message: string, post: any }>('http://localhost:3000/api/posts', postData)
      .subscribe((responseData) => {
        // After successfully adding the post, refresh the current page
        this.getPosts(this.pageSize, this.currentPage);
      });
  }

  deletePost(postId: string) {
    return this.http.delete("http://localhost:3000/api/posts/" + postId);
  }
}
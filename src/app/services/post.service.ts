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
  private postsUpdated = new BehaviorSubject<Blog[]>(this.posts);

  constructor(private http: HttpClient) { }

  getPosts() {
    this.http.get<{ message: string, posts: any }>('http://localhost:3000/api/posts')
      .pipe(
        map((postData) => {
          return postData.posts.map((post: any) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id
            };
          });
        })
      )
      .subscribe((postData) => {
        this.posts = postData;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string) {
    const post: Blog = { id: null, title: title, content: content };
    this.http.post<{ message: string, postId: string }>('http://localhost:3000/api/posts', post)
      .subscribe((responseData) => {
        const postId = responseData.postId;
        post.id = postId;
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
      });
  }

  deletePost(postId: string) {
    this.http.delete("http://localhost:3000/api/posts/" + postId)
      .subscribe(() => {
        this.posts = this.posts.filter(post => post.id !== postId);
        this.postsUpdated.next([...this.posts]);
        console.log("deleted!");
      });
  }
}
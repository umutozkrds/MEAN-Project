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
              id: post._id,
              imagePath : post.imagePath
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

  getPost(id: string) {
    return this.http.get<{ _id: string, title: string, content: string }>('http://localhost:3000/api/posts/' + id)
      .pipe(
        map(postData => {
          return {
            id: postData._id,
            title: postData.title,
            content: postData.content
          };
        })
      );
  }

  updatePost(id: string, title: string, content: string) {
    const post: Blog = {
      id: id,
      title: title,
      content: content,
      imagePath : null
    }
    this.http.put('http://localhost:3000/api/posts/' + id, post).subscribe(
      result => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      }
    )
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image);
    this.http.post<{ message: string, post: Blog }>('http://localhost:3000/api/posts', postData)
      .subscribe((responseData) => {
        const post: Blog = {
          id: responseData.post.id,
          title: title,
          content: content,
          imagePath : responseData.post.imagePath
        };
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
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Blog } from '../../models/blog.model';
import { PostService } from '../../services/post.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-list',
  standalone: false,
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.css'
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Blog[] = [];

  private postsSub!: Subscription;

  constructor(private postService: PostService) {

  }

  ngOnInit(): void {
    this.postService.getPosts();
    this.postsSub = this.postService.getPostUpdateListener().subscribe((posts: Blog[]) => {
      console.log("Gelen Postlar:", posts);
      this.posts = posts; // Güncellenmiş postları atıyoruz
    });
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
  }

  onDelete(postId: string) {
    this.postService.deletePost(postId)
  }
}

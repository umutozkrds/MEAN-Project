import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Blog } from '../../models/blog.model';
import { PostService } from '../../services/post.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-post-list',
  standalone: false,
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.css'
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Blog[] = [];
  isLoading = false;
  pageSize = 2;
  totalPost = 0;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];

  private postsSub!: Subscription;

  constructor(private postService: PostService) {

  }

  ngOnInit(): void {
    this.isLoading = true;
    this.postService.getPosts(this.pageSize, this.currentPage);
    this.postsSub = this.postService.getPostUpdateListener().subscribe((postData: { posts: Blog[], sumPosts: number }) => {
      this.isLoading = false;
      this.posts = postData.posts;
      this.totalPost = postData.sumPosts;
    });
  }

  onChangedPage(page: PageEvent) {
    this.isLoading = true;
    this.currentPage = page.pageIndex + 1;
    this.pageSize = page.pageSize;
    this.postService.getPosts(this.pageSize, this.currentPage);
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe(() => {
      this.postService.getPosts(this.pageSize, this.currentPage);
    });
  }
}

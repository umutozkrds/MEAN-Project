import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Blog } from '../../models/blog.model';
import { PostService } from '../../services/post.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../services/auth.service';
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
  private authStatusSub!: Subscription;
  userId: string | undefined;
  isAuthenticated = false;

  constructor(private postService: PostService, private authService: AuthService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.isAuthenticated = this.authService.getIsAuth();

    this.postService.getPosts(this.pageSize, this.currentPage);
    this.postsSub = this.postService.getPostUpdateListener()
      .subscribe((postData: { posts: Blog[], sumPosts: number }) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPost = postData.sumPosts;
      });

    this.authStatusSub = this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  onChangedPage(page: PageEvent) {
    this.isLoading = true;
    this.currentPage = page.pageIndex + 1;
    this.pageSize = page.pageSize;
    this.postService.getPosts(this.pageSize, this.currentPage);
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe(() => {
      this.postService.getPosts(this.pageSize, this.currentPage);
    }, error => {
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    if (this.postsSub) {
      this.postsSub.unsubscribe();
    }
    if (this.authStatusSub) {
      this.authStatusSub.unsubscribe();
    }
  }
}

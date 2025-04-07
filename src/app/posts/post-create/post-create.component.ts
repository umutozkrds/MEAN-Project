import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Blog } from '../../models/blog.model';
import { mimeType } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-post-create',
  standalone: false,
  templateUrl: './post-create.component.html',
  styleUrl: './post-create.component.css'
})
export class PostCreateComponent implements OnInit, OnDestroy {
  title: string = "";
  content: string = "";
  form: FormGroup = new FormGroup({});
  imagePreview: string = "";
  mode: string = "create";
  id: any = "";
  post: Blog = { id: '', title: '', content: '', imagePath: null };
  isLoading = false;
  private authStatusSub!: Subscription;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }


  ngOnInit(): void {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.isLoading = false;
    });
    this.form = new FormGroup({
      "title": new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      "content": new FormControl(null, {
        validators: [Validators.required]
      }),
      "image": new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      }),
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('id')) {
        this.mode = "edit";
        this.id = paramMap.get('id');
        this.isLoading = true;
        this.postService.getPost(this.id).subscribe(postData => {
          this.isLoading = false;
          this.post = {
            id: postData.id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath
          }
          this.form.patchValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
          });
          this.imagePreview = this.post.imagePath || '';
        });
      }
      else {
        this.mode = "create";
        this.id = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }

  onImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.form.patchValue({
        image: file
      });
      this.form.get('image')?.updateValueAndValidity();
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  savePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === "create") {
      this.postService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }
    else {
      this.postService.updatePost(
        this.id,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }
    this.router.navigate(['/']);
    this.form.reset();
  }


}


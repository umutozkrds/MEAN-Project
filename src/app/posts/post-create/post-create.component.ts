import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Blog } from '../../models/blog.model';

@Component({
  selector: 'app-post-create',
  standalone: false,
  templateUrl: './post-create.component.html',
  styleUrl: './post-create.component.css'
})
export class PostCreateComponent implements OnInit {
  title: string = "";
  content: string = "";
  mode: string = "create";
  id: any = "";
  post: Blog = { id: '', title: '', content: '' };


  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('id')) {
        this.mode = "edit";
        this.id = paramMap.get('id');
        this.postService.getPost(this.id).subscribe(postData => {
          this.post = postData;
        });
      }
      else {
        this.mode = "create";
        this.id = null;
      }
    });
  }

  savePost(form: NgForm) {
    if (form.invalid) {
      return;
    }
    if (this.mode === "create") {
      this.postService.addPost(form.value.title, form.value.content)
    }
    else {
      this.postService.updatePost(this.id, form.value.title, form.value.content)
    }
    this.router.navigate(['/'])
    form.reset()
  }


}


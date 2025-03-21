import { Component } from '@angular/core';

@Component({
  selector: 'app-post-create',
  standalone: false,
  templateUrl: './post-create.component.html',
  styleUrl: './post-create.component.css'
})
export class PostCreateComponent {
  value : string = "";
  post : string = "";


  addPost() {
    console.log(this.value)
    console.log(this.post)

    this.post = this.value;
  }


}


import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-website-edit',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './website-edit.component.html',
  styleUrls: ['./website-edit.component.scss']
})
export class WebsiteEditComponent {}

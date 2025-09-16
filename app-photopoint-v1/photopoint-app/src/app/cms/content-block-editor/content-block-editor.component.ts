import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-content-block-editor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './content-block-editor.component.html',
  styleUrls: ['./content-block-editor.component.scss']
})
export class ContentBlockEditorComponent {}

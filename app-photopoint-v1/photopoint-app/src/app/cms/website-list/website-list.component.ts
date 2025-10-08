import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WebsiteService } from '../../services/website.service';
import { Website } from '../../models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-website-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './website-list.component.html',
  styleUrl: './website-list.component.scss'
})
export class WebsiteListComponent implements OnInit {
  environment = environment;
  websites = signal<Website[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showDeleteModal = signal(false);
  websiteToDelete = signal<Website | null>(null);
  deleting = signal(false);

  constructor(private websiteService: WebsiteService) {}

  ngOnInit() {
    this.loadWebsites();
  }

  async loadWebsites() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const websites = await this.websiteService.getWebsites();
      this.websites.set(websites);
    } catch (error) {
      console.error('Failed to load websites:', error);
      this.error.set('Failed to load websites. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  deleteWebsite(website: Website) {
    this.websiteToDelete.set(website);
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.websiteToDelete.set(null);
  }

  async confirmDelete() {
    const website = this.websiteToDelete();
    if (!website) return;

    this.deleting.set(true);

    try {
      await this.websiteService.deleteWebsite(website.id);
      
      // Remove from local list
      const updatedWebsites = this.websites().filter(w => w.id !== website.id);
      this.websites.set(updatedWebsites);
      
      this.cancelDelete();
    } catch (error) {
      console.error('Failed to delete website:', error);
      this.error.set('Failed to delete website. Please try again.');
    } finally {
      this.deleting.set(false);
    }
  }
}

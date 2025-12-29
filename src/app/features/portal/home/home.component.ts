import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TokenStorageService } from '../../../core/services/token-storage.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  private tokenStorage = inject(TokenStorageService);

  cliente = this.tokenStorage.cliente;
}

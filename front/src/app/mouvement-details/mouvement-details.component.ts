import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MouvementService } from '../services/mouvement.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mouvement-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mouvement-details.component.html',
  styleUrl: './mouvement-details.component.css'
})
export class MouvementDetailsComponent implements OnInit {
  mouvement: any;

  constructor(
    private route: ActivatedRoute,
    private mouvementService: MouvementService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mouvementService.getMouvementById(id).subscribe({
        next: (response) => {
          this.mouvement = response.mouvement;
        },
        error: (error) => {
          console.error('Erreur lors du chargement du mouvement', error);
        }
      });
    }
  }
}

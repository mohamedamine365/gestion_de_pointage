import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AthService } from '../services/ath.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent implements OnInit {
  
  userId: string = '';
  user: any | null = null;

  constructor(private route: ActivatedRoute, private athService: AthService) {}
  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    console.log(this.userId);
    this.athService.getUserById(this.userId).subscribe((data: any) => {
      this.user = data.user;
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AthService } from '../services/ath.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface User {
  _id: string;
  email: string;
  nom: string;
  prenom: string;
  matricule: string;
}

@Component({
  selector: 'app-email-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ToastModule],
  templateUrl: './email-user.component.html',
  styleUrls: ['./email-user.component.css'],
  providers: [MessageService]
})
export class EmailUserComponent implements OnInit {
  userId: string = '';
  user: User | null = null;
  emailForm: FormGroup;
  isSending: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private athService: AthService,
    private messageService: MessageService
  ) {
    this.emailForm = new FormGroup({
      recipient: new FormControl({ value: '', disabled: true }, Validators.required),
      subject: new FormControl('', Validators.required),
      message: new FormControl('', [Validators.required, Validators.minLength(10)])
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.athService.getUserById(this.userId).subscribe({
      next: (data: any) => {
        this.user = data.user;
        this.emailForm.patchValue({
          recipient: this.user?.email || ''
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les informations utilisateur'
        });
      }
    });
  }

  sendEmail() {
    if (this.emailForm.invalid) return;
  
    this.isSending = true;
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <div style="margin-bottom: 20px;">
          <strong>Message envoyé est :</strong><br><br>
          ${this.emailForm.value.message.replace(/\n/g, '<br>')}
        </div>
        
        <hr style="border: 1px solid #eaeaea; margin: 20px 0;">
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h3 style="color: #2c3e50; margin-top: 0;">Administrateur Message</h3>
          
          <div style="display: flex; align-items: start; margin-bottom: 15px;">
            <img src="https://www.entreprises-magazine.com/wp-content/uploads/2021/04/Poulina-696x385.png" 
                 alt="Poulina Group Holding" 
                 style="max-width: 150px; height: auto; margin-right: 20px;">
            
            <div>
              <p style="margin: 5px 0; color: #343a40;">
                <strong>Fondateur :</strong> Abdelwahab Ben Ayed<br>
                <strong>Création :</strong> 1967<br>
                <strong>Siège social :</strong> Ezzahra, Tunisie
              </p>
            </div>
          </div>
          
          <div style="color: #495057; font-size: 14px;">
            <p style="margin: 5px 0;">
              <strong>Dates clés :</strong> 1998: introduction en bourse de la société El Mazraa; 2008: création de la holding
            </p>
            <p style="margin: 5px 0;"><strong>Effectif :</strong> 12 000</p>
            <p style="margin: 5px 0;"><strong>Forme juridique :</strong> Société anonyme</p>
            <p style="margin: 5px 0;">
              <strong>Site web :</strong> 
              <a href="https://www.poulinagroupholding.com/" style="color: #3498db;">
                https://www.poulinagroupholding.com/
              </a>
            </p>
            <p style="margin: 5px 0;"><strong>Téléphone :</strong> 70 020 520</p>
          </div>
        </div>
      </div>
    `;
  
    const formData = {
      to: this.user?.email,
      subject: this.emailForm.value.subject,
      html: emailContent,
      text: `Message envoyé est :\n\n${this.emailForm.value.message}`
    };
  
    this.athService.sendEmail(formData).subscribe({
      next: () => {
        this.isSending = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Email envoyé avec succès'
        });
        this.emailForm.reset({
          recipient: this.user?.email || ''
        });
      },
      error: (err) => {
        this.isSending = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Échec de l'envoi de l'email"
        });
      }
    });
  }
}
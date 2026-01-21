import { Component, OnInit } from '@angular/core';
import { AthService } from '../services/ath.service';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EtablissementService } from '../services/etablissement.service';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api'; // Importez MessageService
import { ToastModule } from 'primeng/toast'; // Importez ToastModule
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-parametrage-des-acces',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ReactiveFormsModule, ToastModule,],
  providers: [MessageService], // ✅ Ajout ici
  templateUrl: './parametrage-des-acces.component.html',
  styleUrls: ['./parametrage-des-acces.component.css']
})
export class ParametrageDesAccesComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  currentPageUsers: any[] = [];
  etablissements: any[] = [];
  showModal: boolean = false;
  isEdit: boolean = false;
  currentUserId: string | null = null;
  searchTerm: string = '';
  currentPage: number = 1;
  usersPerPage: number = 5;
  totalPages: number = 1;
  submitted = false;

  userForm: FormGroup;

  constructor(
    private athService: AthService,
    private etablissement: EtablissementService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.userForm = this.fb.group({
      matricule: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)]],
      nom: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ\s'-]+$/)]],
      prenom: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ\s'-]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      ]],
      privilege: ['Admin', Validators.required],
      etablissement: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.getAllUsers();
    this.getAllEtablissements();

  }

  get f() { return this.userForm.controls; }

  getAllUsers() {
    this.athService.getAllusers().subscribe({
      next: (response: any) => {
        this.users = response.users;
        this.filteredUsers = [...this.users];
        this.totalPages = Math.ceil(this.filteredUsers.length / this.usersPerPage);
        this.updateCurrentPageUsers();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur récupération utilisateurs: ' + err,
          life: 5000
        });
        console.error('Erreur récupération utilisateurs:', err);
      }
    });
  }

  getAllEtablissements() {
    this.etablissement.getAllEtablissements().subscribe({
      next: (response: any) => {
        this.etablissements = response.etablissements;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur récupération utilisateurs: ' + err,
          life: 5000
        });
        console.error('Erreur récupération utilisateurs:', err);
      }
    });
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      // Normaliser le terme de recherche
      const searchTermNormalized = this.searchTerm
        .toLowerCase()
        .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
        .trim();

      // Séparer les mots de recherche
      const searchTerms = searchTermNormalized.split(' ');

      this.filteredUsers = this.users.filter(user => {
        // Combinaison nom + prénom
        const fullName = `${user.nom?.toLowerCase() || ''} ${user.prenom?.toLowerCase() || ''}`.trim();
        const fullNameReverse = `${user.prenom?.toLowerCase() || ''} ${user.nom?.toLowerCase() || ''}`.trim();

        // Vérification pour l'établissement (recherche exacte)
        const etablissementMatch = user.etablissement?.nom &&
          user.etablissement.nom.toLowerCase() === searchTermNormalized;

        // Vérification pour les autres champs (recherche partielle)
        const otherFieldsMatch = searchTerms.every(term =>
        (user.matricule?.toLowerCase().includes(term) ||
          user.nom?.toLowerCase().includes(term) ||
          user.prenom?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.privilege?.toLowerCase().includes(term) ||
          fullName.includes(term) ||
          fullNameReverse.includes(term))
        );

        return etablissementMatch || otherFieldsMatch;
      });
    } else {
      this.filteredUsers = [...this.users];
    }

    this.totalPages = Math.ceil(this.filteredUsers.length / this.usersPerPage);
    this.currentPage = 1;
    this.updateCurrentPageUsers();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateCurrentPageUsers();
    }
  }

  updateCurrentPageUsers() {
    const start = (this.currentPage - 1) * this.usersPerPage;
    const end = start + this.usersPerPage;
    this.currentPageUsers = this.filteredUsers.slice(start, end);
  }

  openModal() {
    this.showModal = true;
    this.isEdit = false;
    this.submitted = false;
    this.userForm.reset({
      privilege: null,
      etablissement: null
    });

  }


  openEditModal(user: any) {
    this.showModal = true;
    this.isEdit = true;
    this.currentUserId = user._id;
    this.submitted = false;

    // Trouver l'objet etablissement correspondant dans la liste this.etablissements
    const matchingEtablissement = this.etablissements.find(
      etab => etab._id === user.etablissement?._id
    );

    this.userForm.patchValue({
      matricule: user.matricule,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      password: '', // On ne montre pas le mot de passe existant
      privilege: user.privilege,
      etablissement: matchingEtablissement || null
    });
  }

  closeModal() {
    this.showModal = false;
    this.userForm.reset();
  }

  onSubmit() {
    this.submitted = true;

    if (this.userForm.invalid) {
      return;
    }

    const formData = this.userForm.value;

    if (this.isEdit) {
      this.athService.updateUser(this.currentUserId!, formData).subscribe({
        next: () => {
          this.getAllUsers();
          this.closeModal();
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Utilisateur mis à jour avec succès.',
            life: 3000
          });
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec de la mise à jour de l\'utilisateur.',
            life: 5000
          });
          console.error('Erreur mise à jour utilisateur:', err);
        }
      });
    } else {
      this.athService.createUser(formData).subscribe({
        next: () => {
          this.getAllUsers();
          this.closeModal();
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Utilisateur ajouté avec succès.',
            life: 3000
          });
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec de l\'ajout de l\'utilisateur.',
            life: 5000
          });
          console.error('Erreur ajout utilisateur:', err);
        }
      });
    }
  }

  deleteUser(userId: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.athService.deleteUser(userId).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: "L'utilisateur a été bloqué avec succès",
            life: 2500
          });
          this.getAllUsers();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec de la suppression',
            life: 5000
          });
          console.error(err);
        }
      });
    }
  }

  recupererUser(userId: string) {
    if (confirm('Êtes-vous sûr de vouloir réactiver cet utilisateur ?')) {
      this.athService.recupererUser(userId).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: "L'utilisateur a été réactivé avec succès",
            life: 2500
          });
          this.getAllUsers();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec de la réactivation',
            life: 5000
          });
          console.error(err);
        }
      });
    }
  }

}
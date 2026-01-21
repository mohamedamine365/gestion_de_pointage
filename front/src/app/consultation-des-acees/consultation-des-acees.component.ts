import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MouvementService } from '../services/mouvement.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Colors } from 'chart.js';


declare var bootstrap: any; // En haut de votre fichier

@Component({
  selector: 'app-consultation-des-acees',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ReactiveFormsModule, ToastModule],
  templateUrl: './consultation-des-acees.component.html',
  styleUrls: ['./consultation-des-acees.component.css']
})
export class ConsultationDesAceesComponent implements OnInit, AfterViewInit {

  mouvements: any[] = [];
  paginatedMouvements: any[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  startDate: string = new Date().toISOString().split('T')[0]; // Aujourd'hui par défaut
  endDate: string = new Date().toISOString().split('T')[0];  
  excelStartDate: string = new Date().toISOString().split('T')[0];
  excelEndDate: string = new Date().toISOString().split('T')[0]; // Aujourd'hui par défaut
  private modalInstance: any;
  private excelModalInstance: any;


  constructor(private mouvementService: MouvementService) {}
  @ViewChild('pdfModal') pdfModal!: ElementRef;
  @ViewChild('excelModal') excelModal!: ElementRef;

  ngOnInit(): void {
    this.getallMouvements();
  }
// Et modifiez ngAfterViewInit():
ngAfterViewInit(): void {
  if (this.pdfModal) {
    this.modalInstance = new bootstrap.Modal(this.pdfModal.nativeElement);
  }
  if (this.excelModal) {
    this.excelModalInstance = new bootstrap.Modal(this.excelModal.nativeElement);
  }
}
  getallMouvements() {
    this.mouvementService.getAllMouvements().subscribe({
      next: (res) => {
        this.mouvements = res.mouvements;
        this.totalPages = Math.ceil(this.mouvements.length / this.itemsPerPage);
        this.updatePagination();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des mouvements', err);
      }
    });
  }

  onSearch() {
    this.currentPage = 1; // Revenir à la première page
    this.updatePagination();
  }
  
  updatePagination() {
    const searchTermNormalized = this.searchTerm
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  
    // Si le terme de recherche est vide, afficher tout
    if (!searchTermNormalized) {
      this.totalPages = Math.ceil(this.mouvements.length / this.itemsPerPage);
      this.paginatedMouvements = this.mouvements.slice(
        (this.currentPage - 1) * this.itemsPerPage,
        this.currentPage * this.itemsPerPage
      );
      return;
    }
  
    const filteredMouvements = this.mouvements.filter(mouvement => {
      const user = mouvement.user || {};
      const etablissement = user.etablissement || {};
      const siteCentralisateur = etablissement.site_centralisateur || {};
  
      // Récupération des valeurs
      const nom = user.nom?.toLowerCase() || '';
      const prenom = user.prenom?.toLowerCase() || '';
      const matricule = user.matricule?.toLowerCase() || '';
      const resultat = mouvement.resultat?.toLowerCase() || '';
      const etablissementNom = (etablissement.nom?.toLowerCase() || '').trim();
      const siteCentralisateurNom = (siteCentralisateur.nom?.toLowerCase() || '').trim();
      
      // Formatage de la date pour la recherche
      const formattedDate = mouvement.date_mouvement ? 
        this.formatDateForSearch(mouvement.date_mouvement) : '';
  
      const fullName = `${nom} ${prenom}`.trim();
      const fullNameReverse = `${prenom} ${nom}`.trim();
  
      // Même logique de recherche pour TOUS les champs
      return (
        matricule.includes(searchTermNormalized) ||
        nom.includes(searchTermNormalized) ||
        prenom.includes(searchTermNormalized) ||
        resultat.includes(searchTermNormalized) ||
        etablissementNom.includes(searchTermNormalized) ||
        siteCentralisateurNom.includes(searchTermNormalized) ||
        formattedDate.includes(searchTermNormalized) ||
        fullName.includes(searchTermNormalized) ||
        fullNameReverse.includes(searchTermNormalized)
      );
    });
  
    this.totalPages = Math.ceil(filteredMouvements.length / this.itemsPerPage);
    this.paginatedMouvements = filteredMouvements.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }
  // Ajoutez cette nouvelle méthode pour formater la date pour la recherche
  private formatDateForSearch(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`.toLowerCase();
    } catch (e) {
      console.error('Erreur de formatage de date pour la recherche', dateString, e);
      return '';
    }
  }
  
  

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  downloadPDF() {
    if (this.modalInstance) {
      this.modalInstance.show();
    }
  }
  
  downloadExcel() {
    if (this.excelModalInstance) {
      this.excelModalInstance.show();
    }
  }
  generatePDF() {
    this.modalInstance.hide();
    
    // Declare these variables only once at the start of the method
    const formattedStartDate = this.formatDate(this.startDate);
    const formattedEndDate = this.formatDate(this.endDate);
    const filteredMouvements = this.filterMouvementsByDate();
  
    const doc = new jsPDF();
  
    // Maintenant vous pouvez utiliser les variables
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('Rapport complet des pointages des employés', 105, 24, { align: 'center' });
  
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Période du ${formattedStartDate} au ${formattedEndDate}`, 105, 32, { align: 'center' });
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 38, 195, 38);
  
    // Réinitialiser la couleur pour le contenu
    doc.setTextColor(0, 0, 0); // Noir
    doc.setFontSize(10);
      
    const tableData = filteredMouvements.map(mouvement => [
      mouvement.user?.matricule || '-',
      mouvement.date_mouvement ? this.formatDate(mouvement.date_mouvement) : '-',
      mouvement.resultat || '-',
      `${mouvement.user?.nom || ''} ${mouvement.user?.prenom || ''}`.trim() || '-',
      mouvement.user?.etablissement?.site_centralisateur?.nom || '-',
      mouvement.user?.etablissement?.nom || '-'
    ]);
  
    const headers = [
      ['Matricule', 'Date de mouvement', 'Résultat', 'Nom et prénom', 'Site Centralisateur', 'Etablissement']
    ];
  
    autoTable(doc, {
      head: headers,
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 10,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [44, 62, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
  
    doc.save(`suivi_activites_${formattedStartDate}_${formattedEndDate}.pdf`);
  }

  private filterMouvementsByDate(): any[] {
    if (!this.startDate || !this.endDate) return this.mouvements;

    const startDateObj = new Date(this.startDate);
    startDateObj.setUTCHours(0, 0, 0, 0); // Début de journée
    
    const endDateObj = new Date(this.endDate);
    endDateObj.setUTCHours(23, 59, 59, 999); // Fin de journée

    return this.mouvements.filter(m => {
      if (!m.date_mouvement) return false;
      
      const mouvementDate = new Date(m.date_mouvement);
      return mouvementDate >= startDateObj && mouvementDate <= endDateObj;
    });
  }

  
  
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    
    // Format JJ/MM/AAAA
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    
    return `${day}/${month}/${year}`;
  }

  // Ajoutez la nouvelle méthode generateExcel()
  generateExcel() {
    this.excelModalInstance.hide();
    
    const formattedStartDate = this.formatDate(this.excelStartDate);
    const formattedEndDate = this.formatDate(this.excelEndDate);
    
    // Filtrer les mouvements selon la période sélectionnée
    const filteredMouvements = this.filterMouvementsForExcel();
    
    const tableData = filteredMouvements.map(mouvement => ({
      Matricule: mouvement.user?.matricule || '-',
      // Formater la date pour l'Excel (JJ/MM/AAAA HH:MM:SS)
      DateDeMouvement: mouvement.date_mouvement ? this.formatDateTime(mouvement.date_mouvement) : '-',
      Resultat: mouvement.resultat || '-',
      NomEtPrenom: `${mouvement.user?.nom || ''} ${mouvement.user?.prenom || ''}`.trim() || '-',
      SiteCentralisateur: mouvement.user?.etablissement?.site_centralisateur?.nom || '-',
      Etablissement: mouvement.user?.etablissement?.nom || '-'
    }));
  
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mouvements');
    
    // Nom du fichier avec la période
    XLSX.writeFile(wb, `mouvements_${formattedStartDate}_${formattedEndDate}.xlsx`);
  }
  
  // Nouvelle méthode pour formater la date avec l'heure
  private formatDateTime(dateString: string): string {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '/'); // Uniformise les séparateurs
    } catch (e) {
      console.error('Erreur de formatage de date', dateString, e);
      return '-';
    }
  }
  private filterMouvementsForExcel(): any[] {
    if (!this.excelStartDate || !this.excelEndDate) return this.mouvements;

    const startDateObj = new Date(this.excelStartDate);
    startDateObj.setUTCHours(0, 0, 0, 0);
    
    const endDateObj = new Date(this.excelEndDate);
    endDateObj.setUTCHours(23, 59, 59, 999);

    return this.mouvements.filter(m => {
      if (!m.date_mouvement) return false;
      
      const mouvementDate = new Date(m.date_mouvement);
      return mouvementDate >= startDateObj && mouvementDate <= endDateObj;
    });
  }
}
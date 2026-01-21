import { Component, OnInit } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartType } from 'chart.js';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { AthService } from '../services/ath.service';
import { StatistiqueService } from '../services/statistique.service';
import { ChartData } from 'chart.js';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api'; // Importez MessageService
import { ToastModule } from 'primeng/toast'; // Importez ToastModule
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-repartion-des-acces',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule, ToastModule, RouterModule, ReactiveFormsModule],
  templateUrl: './repartion-des-acces.component.html',
  styleUrls: ['./repartion-des-acces.component.css'],
  providers: [
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    JwtHelperService, MessageService
  ]
})
export class RepartionDesAccesComponent implements OnInit {
  showWelcome = false;


  /*****Initialisation pour load data user stats *****/
  public userStats = {
    total: 0,
    active: 0,
    inactive: 0
  };
  public loadingUserStats = true;
  public statsError: string | null = null;

  /*****Initialisation pour load data mouvement stats *****/


  public mouvementStats = {
    total: 0,
    success: 0,
    failed: 0,
    badge: 0,
    mobile: 0,
    biometrique: 0,
    successRate: 0,
    dailyAvg: 0
  };
  public loadingMouvementStats = true;
  public mouvementStatsError: string | null = null;

  /********Initialisation pour pie chart  *********/

  // Ajoutez ces nouvelles propriétés à votre classe
  public privilegeStats = {
    total: 0,
    repartition: {
      admin: 0,
      filiale: 0,
      groupe: 0,
      gestion: 0
    }
  };
  public loadingPrivilegeStats = true;
  public privilegeStatsError: string | null = null;

  public topUsers: any[] = [];
  public loadingTopUsers = true;
  public topUsersError: string | null = null;

  // Pie Chart Configuration
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12
          },
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  public pieChartData: ChartData<'pie'> = {
    labels: ['Admin', 'Filiale', 'Groupe', 'Gestion'],
    datasets: [{
      data: [],
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0'
      ],
      hoverBackgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0'
      ]
    }]
  };

  public pieChartType: ChartType = 'pie';



  /********Initialisation pour bar chart  *********/
  public barChartData: ChartConfiguration['data'] = {
    datasets: []
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.03)',
        },
        ticks: {
          stepSize: 5,
          font: {
            size: 11
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12
          },
          padding: 20,
          usePointStyle: true
        }
      }
    }
  };

  public ChartType: ChartType = 'bar';
  public nom: string = '';
  public prenom: string = '';

  constructor(
    private statistiqueService: StatistiqueService,
    private messageService: MessageService,
    private router: Router,
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.showWelcome = navigation?.extras.state?.['showWelcome'] || false;

    if (this.showWelcome) {
      console.log('Welcome message should be shown');
      this.messageService.add({
        severity: 'success',
        summary: 'Connexion réussie',
        detail: 'Vous êtes maintenant connecté',
        life: 3000
      });
    }
  }
  

  ngOnInit(): void {
    // this.loadUserData();
    this.loadAccessStats();
    this.loadUserStats();
    this.loadMouvementStats();
    this.loadPrivilegeStats(); // Nouveau
    this.loadTopUsers(); // Nouveau




  }

  // loadUserData(): void {
  //   const token = localStorage.getItem('token'); 
  //   if (token) {
  //     const decodedToken = this.jwtHelper.decodeToken(token);
  //     const userId = decodedToken?.id; 

  //     if (userId) {
  //       this.userService.getUserById(userId).subscribe({
  //         next: (response: any) => {
  //           if (response.success && response.user) {
  //             this.nom = response.user.nom;
  //             this.prenom = response.user.prenom;
  //           }
  //         },
  //         error: (err) => console.error('Erreur récupération utilisateur:', err)
  //       });
  //     }
  //   }
  // }


  /******************* get all access stats , par 30 days, succes/echec, bar chart ************************/
  loadAccessStats(): void {
    this.statistiqueService.getAccessStats().subscribe({
      next: (data: any) => {
        if (data.success && data.data) {
          this.prepareChartData(data.data);
        }
      },
      error: (err) => {
        console.error('Erreur chargement statistiques:', err);
      }
    });
  }

  prepareChartData(stats: any[]): void {
    const labels = stats.map(item => {
      const [year, month, day] = item.date.split('-');
      return `${day}/${month}`; // Format plus court pour les labels
    });

    this.barChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Échecs',
          data: stats.map(item => item.failed),
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          barPercentage: 0.6,
          categoryPercentage: 0.8
        },
        {
          label: 'Succès',
          data: stats.map(item => item.success),
          backgroundColor: 'rgb(68, 88, 126)',
          borderColor: 'rgb(53, 86, 153)',
          borderWidth: 1,
          barPercentage: 0.6,
          categoryPercentage: 0.8
        }
      ]
    };
  }



  /******************* get all user data , count user, count user/actif , count user/inactif ************************/

  loadUserStats() {
    this.loadingUserStats = true;
    this.statsError = null;

    this.statistiqueService.getTotalUsers().subscribe({
      next: (data: any) => {
        if (data.success && data.data) {
          this.userStats = {
            total: data.data.total || 0,
            active: data.data.active || 0,
            inactive: data.data.inactive || 0
          };
        }
        this.loadingUserStats = false;
      },
      error: (err) => {
        console.error(err);
        this.statsError = 'Erreur lors du chargement des statistiques utilisateurs';
        this.loadingUserStats = false;
      }
    });
  }

  // Charge les statistiques globales des mouvements
  loadMouvementStats(): void {
    this.loadingMouvementStats = true;
    this.mouvementStatsError = null;

    this.statistiqueService.getMouvementStats().subscribe({
      next: (data: any) => {
        if (data.success && data.data) {
          this.mouvementStats = {
            total: data.data.total || 0,
            success: data.data.repartition_resultat_global.succes || 0,
            failed: data.data.repartition_resultat_global.failed || 0,
            badge: data.data.repartition_methode.badge || 0,
            mobile: data.data.repartition_methode.mobile || 0,
            biometrique: data.data.repartition_methode.biometrique || 0,
            successRate: data.data.taux_succes_global || 0,
            dailyAvg: data.data.moyenne_journaliere || 0
          };
        }
        this.loadingMouvementStats = false;
      },
      error: (err) => {
        console.error(err);
        this.mouvementStatsError = 'Erreur lors du chargement des statistiques de mouvements';
        this.loadingMouvementStats = false;
      }
    });
  }

  /****** pie chart code */
  // Ajoutez ces nouvelles méthodes
  loadPrivilegeStats(): void {
    this.loadingPrivilegeStats = true;
    this.privilegeStatsError = null;

    this.statistiqueService.getUserPrivilegeStats().subscribe({
      next: (data: any) => {
        if (data.success && data.data) {
          this.privilegeStats = {
            total: data.data.total,
            repartition: data.data.repartition_privilege
          };

          // Mise à jour des données du pie chart
          this.pieChartData.datasets[0].data = [
            this.privilegeStats.repartition.admin,
            this.privilegeStats.repartition.filiale,
            this.privilegeStats.repartition.groupe,
            this.privilegeStats.repartition.gestion
          ];
        }
        this.loadingPrivilegeStats = false;
      },
      error: (err) => {
        console.error(err);
        this.privilegeStatsError = 'Erreur lors du chargement des statistiques de privilèges';
        this.loadingPrivilegeStats = false;
      }
    });
  }

  //***** top user code */

  loadTopUsers(): void {
    this.loadingTopUsers = true;
    this.topUsersError = null;

    this.statistiqueService.getTopUsers().subscribe({
      next: (data: any) => {
        if (data.success && data.data) {
          this.topUsers = data.data;
        }
        this.loadingTopUsers = false;
      },
      error: (err) => {
        console.error(err);
        this.topUsersError = 'Erreur lors du chargement du top utilisateurs';
        this.loadingTopUsers = false;
      }
    });
  }

}
